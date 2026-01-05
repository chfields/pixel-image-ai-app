// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { ResponseOutputItem } from "openai/resources/responses/responses";

contextBridge.exposeInMainWorld("fileAPI", {
  showFolder: (directoryPath: string) => {
    return ipcRenderer.invoke("show-folder", directoryPath);
  },
  readFile: (filePath: string | undefined) => {
    return ipcRenderer.invoke("read-file", filePath);
  },
  selectDirectory: () => {
    return ipcRenderer.invoke("select-directory");
  },
  writeFileFromBase64: (
    fileDirectory: string,
    fileName: string,
    data: string
  ) => {
    return ipcRenderer.invoke(
      "write-file-from-base64",
      fileDirectory,
      fileName,
      data
    );
  },
});

contextBridge.exposeInMainWorld("imageAPI", {
  processImage: (imageData: string, imageOptions: ImageOptions) => {
    return ipcRenderer.invoke("process-image", imageData, imageOptions);
  },
  toPixels: (imageData: string) => {
    return ipcRenderer.invoke("to-pixels", imageData);
  },
  fromPixels: (
    data: Buffer,
    info: { width: number; height: number; channels: number }
  ) => {
    return ipcRenderer.invoke("from-pixels", data, info);
  },
});

contextBridge.exposeInMainWorld("aiAPI", {
  runPrompt: (
    engineName: string,
    prompt: string,
    modelsOptions?: ModelOptions,
    remixOptions?: { responseID?: string; imageInput?: string }
  ) => {
    return ipcRenderer.invoke("run-prompt", engineName, prompt, modelsOptions, remixOptions);
  },
  onResponseImage: (
    callback: (imageData: ResponseOutputItem.ImageGenerationCall) => void
  ) => {
    ipcRenderer.on("ai-response-image", (event, imageData) => {
      callback(imageData);
    });
  },
  onResponseCompleted: (callback: (data: { responseID: string }) => void) => {
    ipcRenderer.on("ai-response-completed", (event, data) => {
      callback(data);
    });
  },
  onReasoningSummaryDelta: (callback: (data: { delta: string }) => void) => {
    ipcRenderer.on(
      "ai-response-reasoning-summary-text-delta",
      (event, data) => {
        callback(data);
      }
    );
  },
  onStatusUpdate: (callback: (data: { status: string }) => void) => {
    ipcRenderer.on("ai-response-status-update", (event, data) => {
      callback(data);
    });
  },
  stopCurrentResponse: (engineName: string) => {
    return ipcRenderer.invoke("ai-stop-current-response", engineName);
  },
  getAvailableEngines: () => {
    return ipcRenderer.invoke("ai-get-available-engines");
  },
});

contextBridge.exposeInMainWorld("clipboardAPI", {
  writeText: (text: string) => {
    return ipcRenderer.invoke("clipboard-write-text", text);
  },
  readText: () => {
    return ipcRenderer.invoke("clipboard-read-text");
  },
});

contextBridge.exposeInMainWorld("envVars", {
  homeDir: process.env.HOME || "",
  platform: process.platform,
});


contextBridge.exposeInMainWorld("secureApiKeyStorage", {
  saveApiKey: (service: string, apiKey: string) => {
    return ipcRenderer.invoke("api-key-save", service, apiKey);
  },
  getApiKey: (service: string) => {
    return ipcRenderer.invoke("api-key-get", service);
  },
  deleteApiKey: (service: string) => {
    return ipcRenderer.invoke("api-key-delete", service);
  },
});


contextBridge.exposeInMainWorld("appSettingsAPI", {
  saveSettings: (settings: AppSettings) => {
    return ipcRenderer.invoke("settings-save", settings);
  },
  getSettings: () => {
    return ipcRenderer.invoke("settings-get");
  },
});