import { InferenceClient } from "@huggingface/inference";


export class HuggingFaceApi implements AIEngine {
    private inferenceClient: InferenceClient;

    engineName = "huggingface";


    constructor(apiKey: string) {
        this.inferenceClient = new InferenceClient(apiKey);
    }

    async runPrompt(
        event: Electron.IpcMainInvokeEvent,
        prompt: string,
        modelsOptions?: ModelOptions,
        remixOptions?: { responseID?: string; imageInput?: string }
    ): Promise<any> {
        // Example implementation for HuggingFace API call
        const model = modelsOptions?.model || "stabilityai/stable-diffusion-2";
        const response = await this.inferenceClient.textToImage({
            model,
            inputs: prompt,
        },
        { outputType: "blob", }
        );

       // result is blob
       // convert to base64
       const arrayBuffer = await response.arrayBuffer();
       const base64String = Buffer.from(arrayBuffer).toString('base64');

       event.sender.send("ai-response-image", { result: base64String });
       return;

    }

    async stopCurrentResponse(): Promise<void> {
        // HuggingFace Inference API does not currently support aborting requests
        return;
    }   

}