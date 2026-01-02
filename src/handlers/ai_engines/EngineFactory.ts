import { ApiKeyStorage } from "../ApiKeyStorage";
import { OpenAIApi } from "./openai";

export class EngineFactory {
  static getEngine(engineName: string, apiKeyStorage: ApiKeyStorage) : AIEngine {
    const apiKey = apiKeyStorage.getApiKey(engineName);
    if (!apiKey || apiKey.length === 0) {
        return null;
    }
    switch (engineName) {
      case "openai":
        return new OpenAIApi(apiKey);
      default:
        throw new Error(`Unsupported engine: ${engineName}`);
    }
  }

  static async runPrompt(
    engine: AIEngine,
    event: Electron.IpcMainInvokeEvent,
    prompt: string,
    remixOptions?: { responseID?: string; imageInput?: string }
  ): Promise<any> {
    return engine.runPrompt(event, prompt, remixOptions);
  }

  static async stopCurrentResponse(engine: AIEngine): Promise<void> {
    return engine.stopCurrentResponse();
  }
}
