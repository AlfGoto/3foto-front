"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, ImageIcon, Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Img from "next/image";
import { MAX_SIZE, RAW_EXTENSIONS, STANDARD_FORMATS } from "@/lib/formats";
import { ImageItem } from "@/lib/types";
import {
  createWebP,
  extractJpegPreview,
  formatSize,
  generateHash,
  isRawFile,
} from "@/lib/utils";
import { useSession } from "next-auth/react";

export function ImageProcessor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  console.log(session);

  useEffect(() => {
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
              ? {
                  ...img,
                  processed: blob,
                  preview: URL.createObjectURL(blob as Blob),
                }
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
  ): Promise<Blob | null> => {
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
                      sizes="(max-width: 500px) 100vw, (max-width: 1000px) 50vw, 25vw"
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
