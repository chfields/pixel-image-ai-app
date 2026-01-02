declare interface AIEngine {
    engineName: string;
    runPrompt: (
        event: Electron.IpcMainInvokeEvent,
        prompt: string,
        remixOptions?: { responseID?: string; imageInput?: string }
    ) => Promise<any>;
    stopCurrentResponse: () => Promise<void>;
}
