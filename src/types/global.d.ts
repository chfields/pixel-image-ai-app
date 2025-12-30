// globals.d.ts in your project (e.g., in a 'src/types' folder)

// Makes the file a module, necessary for 'declare global' to work consistently
export {};

declare global {
  interface Window {
    electronAPI: {
      readFile: (filePath: string | undefined) => Promise<string>;
      selectDirectory: () => Promise<string[]>;
    };
  }
}

// Ensure your tsconfig.json includes this file or the folder it resides in.
