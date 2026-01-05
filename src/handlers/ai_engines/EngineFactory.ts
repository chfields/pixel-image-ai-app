import { ApiKeyStorage } from "../ApiKeyStorage";
import { OpenAIApi } from "./openai";
import { HuggingFaceApi } from ".//HuggingFaceApi";
import log from "../../main-logger";

const availabeEngines = [
  { name: "openai", label: "OpenAI", constructor: OpenAIApi },
  { name: "huggingface", label: "HuggingFace", constructor: HuggingFaceApi },
];

export class EngineFactory {
  static getEngine(engineName: string, apiKeyStorage: ApiKeyStorage): AIEngine {
    const apiKey = apiKeyStorage.getApiKey(engineName);
    if (!apiKey || apiKey.length === 0) {
      return null;
    }
    const findEngine = availabeEngines.find(
      (engine) => engine.name === engineName
    );
    if (!findEngine) {
      throw new Error(`Unsupported engine: ${engineName}`);
    }
    return new findEngine.constructor(apiKey);
  }

  static getAvailableEngines(): { name: string; label: string }[] {
    return availabeEngines.map((engine) => ({
      name: engine.name,
      label: engine.label,
    }));
  }

  static async runPrompt(
    engine: AIEngine,
    event: Electron.IpcMainInvokeEvent,
    prompt: string,
    modelsOptions?: ModelOptions,
    remixOptions?: { responseID?: string; imageInput?: string }
  ): Promise<any> {
    log.info(
      `Running prompt with engine: ${engine.engineName} and model: ${modelsOptions?.model}`
    );
    return engine.runPrompt(event, prompt, modelsOptions, remixOptions);
  }

  static async stopCurrentResponse(engine: AIEngine): Promise<void> {
    log.debug(`Stopping current response for engine: ${engine.engineName}`);
    return engine.stopCurrentResponse();
  }
}
