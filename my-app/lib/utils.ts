import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RAW_EXTENSIONS, TARGET_HEIGHT } from "@/lib/formats";

export const isTextFile = (file: File) => {
  return (
    file.type.startsWith("text/") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".json") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".xml") ||
    file.name.endsWith(".yml") ||
    file.name.endsWith(".yaml")
  );
};

export const readTextFile = async (
  file: File,
  previewLength: number = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(
        text.slice(0, previewLength) +
          (text.length > previewLength ? "..." : "")
      );
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

export function extractJpegPreview(
  file: File,
  onProgress: (
    progress: number,
    status: "pending" | "processing" | "processed" | "error"
  ) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async (event: ProgressEvent<FileReader>) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const view = new DataView(arrayBuffer);

      const jpegMarker = new Uint8Array([0xff, 0xd8]);
      let jpegStart = -1;

      for (let i = 0; i < view.byteLength - 1; i++) {
        if (
          view.getUint8(i) === jpegMarker[0] &&
          view.getUint8(i + 1) === jpegMarker[1]
        ) {
          jpegStart = i;
          break;
        }
      }

      if (jpegStart !== -1) {
        const jpegData = arrayBuffer.slice(jpegStart);
        const blob = new Blob([jpegData], { type: "image/jpeg" });
        const webpBlob = await createWebP(
          new File([blob], "jpgBlob"),
          onProgress
        );
        resolve(webpBlob as Blob);
      } else {
        reject(new Error("No JPEG preview found in CR2 file."));
      }
    };

    fileReader.onerror = (error: ErrorEvent) => {
      reject(error);
    };

    fileReader.readAsArrayBuffer(file);
  });
}

export async function createWebP(
  file: File,
  onProgress: (
    progress: number,
    status: "pending" | "processing" | "processed" | "error"
  ) => void
) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        onProgress(0.3, "processing");
        // Calculate new dimensions
        const aspectRatio = img.width / img.height;
        const newWidth = Math.round(TARGET_HEIGHT * aspectRatio);

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = TARGET_HEIGHT;

        // Draw image
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        ctx.drawImage(img, 0, 0, newWidth, TARGET_HEIGHT);
        onProgress(0.7, "processing"); // 70% progress after resize

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              onProgress(1, "processed"); // 100% progress
              resolve(blob as Blob);
            } else {
              reject(new Error("Failed to create WebP"));
            }
          },
          "image/webp",
          0.8
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
    onProgress(0.3, "processing"); // 30% progress after loading starts
  });
}

export function formatSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
export function isRawFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return RAW_EXTENSIONS.includes(extension);
}

export async function generateHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
