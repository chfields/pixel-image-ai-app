import OpenAI from "openai";
import {
  EasyInputMessage,
  ResponseImageGenCallPartialImageEvent,
  ResponseInput,
  ResponseInputImage,
  ResponseInputText,
  ResponseOutputItem,
  ResponseReasoningSummaryTextDeltaEvent,
} from "openai/resources/responses/responses";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const SYSTEM_PROMPT = `You are a helpful image generator that can generate images for a pixel display.
Generate images that are optimized for display on pixel-based lighting systems, such as those used in holiday light displays. The images should be clear and visually appealing when rendered on low-resolution grids of lights.
When generating images, follow these guidelines:

* Use a limited color palette suitable for pixel displays. Avoid gradients and complex color schemes.
* Design images with clear shapes and high contrast to ensure visibility on low-resolution grids.
* Avoid intricate details that will be lost when scaled down to pixel dimensions.
* Characters in the images should have white pixels in their eyes to enhance visibility.
* Characters should have blocked or pixelated edges to match the pixel display aesthetic.
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

export class AiApi {
  static privateExtractImageFromResponse(
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

  static async runPrompt(
    event: Electron.IpcMainInvokeEvent,
    prompt: string,
    remixOptions?: { responseID?: string; imageInput?: string }
  ): Promise<any> {
    const userContent = remixOptions?.imageInput && !remixOptions.responseID
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
            }
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

    // Placeholder implementation for AI prompt processing
    // Replace this with actual AI integration logic
    const response = await openai.responses.create({
      model: "gpt-5.2",
      previous_response_id: remixOptions?.responseID
        ? remixOptions.responseID
        : undefined,
      stream: true,
      reasoning: {
        summary: "detailed",
        effort: "medium",
      },
      text: {
        verbosity: "high",
      },
      store: true,
      input,
      include: [
        "reasoning.encrypted_content",
        "web_search_call.action.sources",
      ],
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
        // {
        //   type: "web_search",
        //   user_location: {
        //     type: "approximate",
        //     country: "US",
        //   },
        //   search_context_size: "low",
        // },
      ],
    });

    for await (const chunk of response) {
      console.log("Received chunk of type:", chunk.type);
      switch (chunk.type) {
        case "response.completed":
          AiApi.privateExtractImageFromResponse(event, chunk.response.output);
          event.sender.send("ai-response-completed", {
            responseID: chunk.response.id,
          });
          break;
        case "response.image_generation_call.partial_image": {
          const { partial_image_b64 } =
            chunk as ResponseImageGenCallPartialImageEvent;
          AiApi.privateExtractImageFromResponse(event, partial_image_b64);
          break;
        }
        case "response.reasoning_summary_text.delta": {
          const { delta } = chunk as ResponseReasoningSummaryTextDeltaEvent;
          event.sender.send("ai-response-reasoning-summary-text-delta", {
            delta,
          });
          break;
        }
        case "response.output_text.delta":
          console.log("Output text delta:", chunk.delta);
          break;
        default:
          break;
      }
    }

    return null;
  }
}
