declare interface ModelOptions {
    model?: string;
}

declare interface AIEngine {
    engineName: string;
    runPrompt: (
        event: Electron.IpcMainInvokeEvent,
        prompt: string,
        modelsOptions?: ModelOptions,
        remixOptions?: { responseID?: string; imageInput?: string }
    ) => Promise<any>;
    stopCurrentResponse: () => Promise<void>;
}
