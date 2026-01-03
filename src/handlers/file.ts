import * as fs from "fs";
import { dialog, shell } from "electron";

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
      const data = fs.readFileSync(filePath); 
      /// convert buffer to base64
      const base64Data = data.toString("base64");
      return base64Data;
    } catch (error) {
      console.error("Failed to read file:", error);
      return null;
    }
  }
  static async showFolder(directoryPath: string): Promise<void> {
    if (fs.existsSync(directoryPath)) {
      await shell.openPath(directoryPath);
    }
  }

  static async writeFileFromBase64(
    fileDirectory: string,
    fileName: string,
    data: string
  ): Promise<string> {
    const buffer = Buffer.from(data, "base64");
    const pathSep = process.platform === "win32" ? "\\" : "/";
    // create directory if it doesn't exist
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync(fileDirectory, { recursive: true });
    }
    // if file exists, add an index to the filename
    let finalFileName = fileName;
    let index = 1;
    while (fs.existsSync(`${fileDirectory}${pathSep}${finalFileName}`)) {
      const nameParts = fileName.split(".");
      const baseName = nameParts.slice(0, -1).join(".");
      const extension = nameParts[nameParts.length - 1];
      finalFileName = `${baseName}-${index}.${extension}`;
      index++;
    }

    fs.writeFileSync(`${fileDirectory}${pathSep}${finalFileName}`, buffer);

    return `${fileDirectory}${pathSep}${finalFileName}`;
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
