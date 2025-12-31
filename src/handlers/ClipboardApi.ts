import { clipboard } from 'electron';
export class ClipboardApi {
  static async writeText(text: string): Promise<void> {
    clipboard.writeText(text);
  }

  static async readText(): Promise<string> {
    return clipboard.readText();
  }
}