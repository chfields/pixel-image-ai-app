import * as fs from "fs";
import { dialog } from "electron";

export class FileApi {
  static async readFile(filePath: string | undefined): Promise<string> {
    try {
      if (!filePath) {
        const result = await dialog.showOpenDialog({
          properties: ["openFile"],
        });
        if (result.canceled || result.filePaths.length === 0) {
          return "";
        }
        filePath = result.filePaths[0];
      }
      const data = fs.readFileSync(filePath, "utf-8"); // Read file synchronously
      return data;
    } catch (error) {
      console.error("Failed to read file:", error);
      return null;
    }
  }

  static async selectDirectory(): Promise<string[]> {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (result.canceled) {
      return [];
    }
    return result.filePaths;
  }
}
