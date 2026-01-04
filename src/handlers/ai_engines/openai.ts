import OpenAI from "openai";
import {
  ResponseImageGenCallPartialImageEvent,
  ResponseOutputItem,
  ResponseReasoningSummaryTextDeltaEvent,
} from "openai/resources/responses/responses";
import log from '../../main-logger';

export const SYSTEM_PROMPT = `You are a helpful image generator that can generate images for a pixel display.
Generate images that are optimized for display on pixel-based lighting systems, such as those used in holiday light displays. The images should be clear and visually appealing when rendered on low-resolution grids of lights.
When generating images, follow these guidelines:

* Use a limited color palette suitable for pixel displays. Avoid gradients and complex color schemes.
* Design images with clear shapes and high contrast to ensure visibility on low-resolution grids.
* Use a perler bead style, focusing on simplicity and clarity.
* Avoid intricate details that will be lost when scaled down to pixel dimensions.
* Characters in the images should have white pixels in their eyes to enhance visibility.
* Characters should have blocked or pixelated edges to match the pixel display aesthetic.
* Characters should not have transparent or black as the primary color. Use solid, bright colors instead.
* For facial features like eyes and mouths, openings should be the background color.
* Do not use black or near-black anywhere. Empty space must be transparent/off pixels (alpha = 0), not black fill.
* Use bright, saturated colors only; avoid low-luminance tones.
* AVOID dark colors as they will not appear on a pixel light display.
* Never fill empty space with black.
* AVOID using text in the images.
* ADD white pixels to eyes of any characters.
* DO NOT add backgrounds unless the user prompt specifies
* Use hard pixel edges only: no anti-aliasing, no smoothing, no outlines, no shadows, no glow.
* No shadows or shading anywhere, especially inside the mouth, ears or nose.
* Do not add outlines to characters unless specifically requested.
`;

export class OpenAIApi implements AIEngine {
  private openai: OpenAI;

  currentController: AbortController | null = null;

  constructor(apiKey: string) {
    this.openai = this.getOpenAIInstance({ apiKey });
  }
  engineName = "openai";

  private getOpenAIInstance({ apiKey }: { apiKey: string }): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || apiKey,
      });
    }
    return this.openai;
  }

  private privateExtractImageFromResponse(
    event: Electron.IpcMainInvokeEvent,
    output: ResponseOutputItem[] | string
  ) {
    if (typeof output === "string") {
      event.sender.send("ai-response-image", { result: output });
    }
    if (!Array.isArray(output)) return;
    const imageResult = output.find(
      (output: ResponseOutputItem.ImageGenerationCall): boolean =>
        output.type === "image_generation_call"
    ) as ResponseOutputItem.ImageGenerationCall;
    event.sender.send("ai-response-image", imageResult);
  }

  async stopCurrentResponse(): Promise<void> {
    if (this.currentController) {
      this.currentController.abort();
    }
  }

  async runPrompt(
    event: Electron.IpcMainInvokeEvent,
    prompt: string,
    modelsOptions?: ModelOptions,
    remixOptions?: { responseID?: string; imageInput?: string }
  ): Promise<any> {
    this.currentController = new AbortController();
    const signal = this.currentController.signal;

    const userContent =
      remixOptions?.imageInput && !remixOptions.responseID
        ? {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
              {
                type: "input_image",
                image_url: `data:image/png;base64,${remixOptions.imageInput}`,
                detail: "auto",
              },
            ],
          }
        : {
            role: "user",
            content: prompt,
          };

    const input = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ] as any;

    input.push(userContent);

    const model = modelsOptions?.model || "gpt-5.2"; 

    const knownModelsWithReasoning = ["gpt-5", "gpt-5.1", "gpt-5.2"];
    const isReasoningModel = model && knownModelsWithReasoning.includes(model);

    const baseModelOptions: OpenAI.Responses.ResponseCreateParamsStreaming = {
      model: model,
      previous_response_id: remixOptions?.responseID
        ? remixOptions.responseID
        : undefined,
      stream: true,
      input,
      include: [],
      tools: [
        {
          type: "image_generation",
          model: "gpt-image-1.5",
          size: "1024x1024",
          quality: "low",
          output_format: "png",
          background: "transparent",
          moderation: "auto",
          partial_images: 0,
        },
      ],
    };

    if (isReasoningModel) {
      baseModelOptions.reasoning = {
        summary: "detailed",
        effort: "medium",
      };
      baseModelOptions.text = {
        verbosity: "high",
      };
      baseModelOptions.store = true;
      baseModelOptions.include.push("reasoning.encrypted_content");
    }

    try {
      const openai = this.openai;
      // Placeholder implementation for AI prompt processing
      // Replace this with actual AI integration logic
      const response = await openai.responses.create(
        baseModelOptions as OpenAI.Responses.ResponseCreateParamsStreaming,
        { signal }
      );

      for await (const chunk of response) {
        log.info("Received chunk of type:", chunk.type);
        switch (chunk.type) {
          case "response.completed":
            this.privateExtractImageFromResponse(event, chunk.response.output);
            event.sender.send("ai-response-completed", {
              responseID: chunk.response.id,
            });
            break;
          case "response.image_generation_call.partial_image": {
            const { partial_image_b64 } =
              chunk as ResponseImageGenCallPartialImageEvent;
            this.privateExtractImageFromResponse(event, partial_image_b64);
            break;
          }
          case "response.reasoning_summary_text.delta": {
            const { delta } = chunk as ResponseReasoningSummaryTextDeltaEvent;
            event.sender.send("ai-response-reasoning-summary-text-delta", {
              delta,
            });
            break;
          }
          case "response.reasoning_summary_part.added":
            event.sender.send("ai-response-status-update", {
              status: "Reasoning...",
            });
            break;
          case "response.image_generation_call.generating":
            event.sender.send("ai-response-status-update", {
              status: "Generating image...",
            });
            break;
          case "response.output_text.delta":
            log.debug("Output text delta:", chunk.delta);
            event.sender.send("ai-response-reasoning-summary-text-delta", {
              delta: chunk.delta,
            });
            break;
          default:
            break;
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        log.info("AI response was aborted.");
      } else {
        log.error("Error during AI response:", error);
        throw error;
      }
    } finally {
      this.currentController = null;
    }

    return null;
  }
}
