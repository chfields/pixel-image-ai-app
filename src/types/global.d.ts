// globals.d.ts in your project (e.g., in a 'src/types' folder)

// Makes the file a module, necessary for 'declare global' to work consistently
export {};

declare global {
  interface Window {
    fileAPI: {
      showFolder: (directoryPath: string) => Promise<void>;
      readFile: (filePath: string | undefined) => Promise<string>;
      selectDirectory: () => Promise<string[]>;
      writeFileFromBase64: (fileDirectory: string, fileName: string, data: string) => Promise<string>;
    };
    aiAPI: {
      runPrompt: (prompt: string, remixOptions?: { responseID?: string; imageInput?: string }) => Promise<any>;
      onResponseImage: (callback: (imageData: any) => void) => void;
      onResponseCompleted: (callback: (data: { responseID: string }) => void) => void;
      onReasoningSummaryDelta: (callback: (data: string) => void) => void;
    };
    imageAPI: {
      processImage: (imageData: string, imageOptions: ImageOptions) => Promise<string>;
      toPixels: (imageData: string) => Promise<{ data: Buffer; info: { width: number; height: number; channels: number } }>;
      fromPixels: (data: Uint8ClampedArray, info: { width: number; height: number; channels: number }) => Promise<string>;
    };
    clipboardAPI: {
      writeText: (text: string) => Promise<void>;
      readText: () => Promise<string>;
    };
    envVars: {
      homeDir: string;
    };
  }
}

// Ensure your tsconfig.json includes this file or the folder it resides in.
