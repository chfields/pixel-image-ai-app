import path from "path";
import fs from "fs";

const HISTORY_DIR_NAME = ".pixel-ai-history";
const HISTORY_FILE_NAME = "history.json";
const MAX_HISTORY_ENTRIES = 200;

export class HistoryHandler {
  static getOrCreateHistoryFilePath(currentDirectory: string): string {
    const historyDir = path.join(currentDirectory, HISTORY_DIR_NAME);
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir);
    }
    return path.join(historyDir, HISTORY_FILE_NAME);
  }

  static readHistoryFile(currentDirectory: string): InteractionRecord[] {
    const historyFilePath = this.getOrCreateHistoryFilePath(currentDirectory);
    if (!fs.existsSync(historyFilePath)) {
      return [];
    }
    const fileContent = fs.readFileSync(historyFilePath, "utf-8");
    try {
      const interactions: InteractionRecord[] = JSON.parse(fileContent);
      return interactions;
    } catch (error) {
      console.error("Error parsing history file:", error);
      return [];
    }
  }

  static writeHistoryFile(
    currentDirectory: string,
    interactions: InteractionRecord[]
  ): void {
    const historyFilePath = this.getOrCreateHistoryFilePath(currentDirectory);
    fs.writeFileSync(
      historyFilePath,
      JSON.stringify(interactions, null, 2),
      "utf-8"
    );
  }

  static async saveInteraction(
    currentDirectory: string,
    interaction: InteractionRecord
  ): Promise<void> {
    const interactions = this.readHistoryFile(currentDirectory);
    const id = `interaction-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    interactions.unshift({
        ...interaction,
        id,
    }); // Add new interaction to the beginning
    if (interactions.length > MAX_HISTORY_ENTRIES) {
      interactions.pop(); // Remove the oldest interaction if exceeding max entries
    }
    this.writeHistoryFile(currentDirectory, interactions);
  }

  static async getInteractions(
    currentDirectory: string,
    limit?: number
  ): Promise<InteractionRecord[]> {
    const interactions = this.readHistoryFile(currentDirectory);
    if (limit !== undefined) {
      return interactions.slice(0, limit);
    }
    return interactions;
  }

  static async clearHistory(currentDirectory: string): Promise<void> {
    const historyFilePath = this.getOrCreateHistoryFilePath(currentDirectory);
    if (fs.existsSync(historyFilePath)) {
      fs.unlinkSync(historyFilePath);
    }
  }
}
