"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, ImageIcon, Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Img from "next/image";

interface ImageItem {
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

const MAX_SIZE = 100 * 1024 * 1024; // 100MB per image
const TARGET_HEIGHT = 720; // 720p

// Standard image formats
const STANDARD_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

// Raw image extensions
const RAW_EXTENSIONS = [
  // "3fr", // Hasselblad
  // "ari", // Arri Alexa
  // "arw",
  // "srf",
  // "sr2", // Sony
  // "bay", // Casio
  // "braw", // Blackmagic
  // "cri", // Cintel
  // "crw",
  "cr2",
  "cr3", // Canon
  // "cap",
  // "iiq",
  // "eip", // Phase One
  // "dng", // Adobe
  // "erf", // Epson
  // "fff", // Hasselblad
  // "mef", // Mamiya
  // "mrw", // Minolta
  // "nef",
  // "nrw", // Nikon
  // "orf", // Olympus
  // "pef",
  // "ptx", // Pentax
  // "raf", // Fujifilm
  // "raw",
  // "rw2", // Panasonic
  // "rwl",
  // "dng", // Leica
  // "x3f", // Sigma
];

const isRawFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return RAW_EXTENSIONS.includes(extension);
};

const generateHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export function ImageProcessor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("images:", images);
    images.forEach(async (im) => {
      if (im.status === "pending") {
        const blob = await processImage(
          im.original as File,
          (progress, status) => {
            setImages((prev) =>
              prev.map((img) =>
                img.id === im.id
                  ? { ...img, status: status, progress: progress * 100 }
                  : img
              )
            );
          }
        );
        setImages((prev) =>
          prev.map((img) =>
            img.id === im.id
              ? { ...img, processed: blob, preview: URL.createObjectURL(blob) }
              : img
          )
        );
      }
    });
  }, [images]);

  const processImage = async (
    file: File,
    onProgress: (
      progress: number,
      status: "pending" | "processing" | "processed" | "error"
    ) => void
  ): Promise<Blob> => {
    if (isRawFile(file)) {
      const result = await extractJpegPreview(file, onProgress);
      return result;
    }

    const result = await createWebP(file, onProgress);
    return result as Blob;
  };

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter((file) => {
      const isRaw = isRawFile(file);
      return (
        file.size <= MAX_SIZE && (isRaw || STANDARD_FORMATS.includes(file.type))
      );
    });

    if (imageFiles.length === 0) {
      setError("Please select valid image files under 100MB");
      return;
    }

    setError(null);

    for (const file of imageFiles) {
      const hash = await generateHash(file);

      setImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: file.name,
          originalSize: file.size,
          processedSize: 0,
          preview: null,
          processed: null,
          original: file,
          status: "pending",
          isRaw: isRawFile(file),
          progress: 0,
          hash,
        },
      ]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return filtered;
    });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-muted-foreground text-center">
              Drag and drop images here, or click to select
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Supported formats: Standard images (JPEG, PNG, etc.) and RAW files
            </p>
            <details className="text-xs text-muted-foreground mt-1">
              <summary className="cursor-pointer">
                Supported RAW formats
              </summary>
              <p className="mt-1">
                {RAW_EXTENSIONS.map((ext) => `.${ext}`).join(", ")}
              </p>
            </details>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              multiple
              accept={[
                ...STANDARD_FORMATS,
                ...RAW_EXTENSIONS.map((ext) => `.${ext}`),
              ].join(",")}
              className="w-full max-w-xs"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6">
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group border rounded-lg p-4 hover:border-primary/50"
            >
              <div className="aspect-square relative mb-2">
                {img.preview ? (
                  <div className="relative w-full h-full">
                    <Img
                      src={img.preview}
                      alt={img.name}
                      fill
                      sizes="(max-width: 400px) 100vw, (max-width: 768px) 50vw, 25vw"
                      className="rounded object-cover"
                      priority={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                    {img.isRaw ? (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(img.id)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium truncate">{img.name}</p>
                <p className="text-xs text-muted-foreground">
                  Original: {formatSize(img.originalSize)}
                  {img.isRaw && " (RAW)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {img.status === "processed" ? (
                    `Processed: ${formatSize(img.processed?.size as number)}`
                  ) : img.status === "error" ? (
                    <span className="text-destructive">
                      {img.error || "Error processing image"}
                    </span>
                  ) : img.status === "processing" ? (
                    "Processing..."
                  ) : (
                    "Waiting..."
                  )}
                </p>
                <Progress
                  value={img.progress}
                  className={`h-1 ${
                    img.status === "processed"
                      ? "bg-green-500"
                      : img.status === "error"
                      ? "bg-red-500"
                      : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function extractJpegPreview(
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

      // Simplified search for JPEG marker (may not be 100% accurate)
      const jpegMarker = new Uint8Array([0xff, 0xd8]); // JPEG start-of-image marker
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

async function createWebP(
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
