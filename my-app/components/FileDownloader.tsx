"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import JSZip from "jszip";

interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
}

export function FileDownloader({ initialFiles }: { initialFiles: FileItem[] }) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const toggleFileSelection = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  const downloadFolder = async (filesToDownload: FileItem[]) => {
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(filesToDownload[0].name.split(".")[0]);

      for (const file of filesToDownload) {
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            console.warn(`Skipping file (failed to fetch): ${file.name}`);
            continue;
          }

          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          folder?.file(file.name, arrayBuffer);
        } catch (fileError) {
          console.warn(`Error processing file: ${file.name}`, fileError);
        }
      }

      if (!folder || folder.length === 0) {
        console.error("No valid files to download.");
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = window.URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = zipUrl;
      a.download = `${filesToDownload[0].name.split(".")[0]}.zip`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(zipUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading folder:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isDownloading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">Downloading Files</h2>
        <p className="text-gray-600">
          Please wait while your files are being prepared...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Download Files</h1>
      <div className="space-y-4">
        <Button onClick={() => downloadFolder(files)} disabled={isDownloading}>
          Download All Files
        </Button>
        <Button
          onClick={() =>
            downloadFolder(
              files.filter((file) => selectedFiles.includes(file.id))
            )
          }
          disabled={selectedFiles.length === 0 || isDownloading}
        >
          Download Selected Files
        </Button>
      </div>
      <ScrollArea className="h-[400px] mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <Card key={file.name + index} className="relative">
              <CardContent className="p-4">
                <Checkbox
                  id={`file-${file.id}`}
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => toggleFileSelection(file.id)}
                  className="absolute top-2 right-2 z-10"
                />
                {file.type.startsWith("image/") ? (
                  <div className="relative w-full h-40">
                    <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">{file.type}</span>
                  </div>
                )}
                <p className="mt-2 text-sm truncate">{file.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <Button onClick={() => router.push("/")} className="mt-4">
        Upload More Files
      </Button>
    </div>
  );
}