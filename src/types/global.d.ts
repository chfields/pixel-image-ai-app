// globals.d.ts in your project (e.g., in a 'src/types' folder)

// Makes the file a module, necessary for 'declare global' to work consistently
export {};

declare global {
  interface Window {
    electronAPI: {
      readFile: (filePath: string | undefined) => Promise<string>;
      selectDirectory: () => Promise<string[]>;
    };
    aiAPI: {
      runPrompt: (prompt: string) => Promise<any>;
      onResponseImage: (callback: (imageData: any) => void) => void;
      onResponseCompleted: (callback: (data: { responseID: string }) => void) => void;
      onReasoningSummaryDelta: (callback: (data: string) => void) => void;
    };
  }
}

// Ensure your tsconfig.json includes this file or the folder it resides in.
