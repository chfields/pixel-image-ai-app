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

  static async writeFileFromBase64(fileDirectory: string, fileName: string, data: string): Promise<string> {
    const buffer = Buffer.from(data, "base64");
    // create directory if it doesn't exist
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync(fileDirectory, { recursive: true });
    }
    // if file exists, add an index to the filename
    let finalFileName = fileName;
    let index = 1;
    while (fs.existsSync(`${fileDirectory}/${finalFileName}`)) {
      const nameParts = fileName.split(".");
      const baseName = nameParts.slice(0, -1).join(".");
      const extension = nameParts[nameParts.length - 1];
      finalFileName = `${baseName}-${index}.${extension}`;
      index++;
    }

    fs.writeFileSync(`${fileDirectory}/${finalFileName}`, buffer);

    return `${fileDirectory}/${finalFileName}`;
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
