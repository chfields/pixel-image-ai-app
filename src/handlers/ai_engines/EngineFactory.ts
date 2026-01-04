import { ApiKeyStorage } from "../ApiKeyStorage";
import { OpenAIApi } from "./openai";
import log from '../../main-logger';
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
    modelsOptions?: ModelOptions,
    remixOptions?: { responseID?: string; imageInput?: string }
  ): Promise<any> {
    log.info(`Running prompt with engine: ${engine.engineName} and model: ${modelsOptions?.model}`);
    return engine.runPrompt(event, prompt, modelsOptions, remixOptions);
  }

  static async stopCurrentResponse(engine: AIEngine): Promise<void> {
    log.debug(`Stopping current response for engine: ${engine.engineName}`);
    return engine.stopCurrentResponse();
  }
}
