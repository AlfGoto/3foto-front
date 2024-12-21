export interface ImageItem {
  id: string;
  name: string;
  originalSize: number;
  processedSize: number;
  preview: string | null;
  processed: Blob | null;
  original: Blob | null;
  status: "pending" | "processing" | "processed" | "error";
  error?: string;
  isRaw: boolean;
  progress: number;
  hash: string; // For caching
}
