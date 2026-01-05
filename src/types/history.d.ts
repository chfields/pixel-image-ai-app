
declare interface InteractionRecord {
  id?: string;
  timestamp: number;
  engineName: string;
  modelName?: string;
  prompt: string;
  image: string | null;
  error?: string;
}