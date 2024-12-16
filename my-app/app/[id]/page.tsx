"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
}

export default function DownloadPage() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "image1.jpg",
      type: "image/jpeg",
      url: "/placeholder.svg",
    },
    {
      id: "2",
      name: "document.pdf",
      type: "application/pdf",
      url: "/placeholder.svg",
    },
    { id: "3", name: "image2.png", type: "image/png", url: "/placeholder.svg" },
  ]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const router = useRouter();

  const toggleFileSelection = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  const downloadFiles = (filesToDownload: FileItem[]) => {
    filesToDownload.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (
        file.type.startsWith("image/") &&
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      ) {
        // For mobile devices, attempt to save to camera roll
        // Note: This is a simplified approach and may not work on all devices/browsers
        fetch(file.url)
          .then((res) => res.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Download Files</h1>
      <div className="space-y-4">
        <Button onClick={() => downloadFiles(files)}>Download All Files</Button>
        <Button
          onClick={() =>
            downloadFiles(
              files.filter((file) => selectedFiles.includes(file.id))
            )
          }
          disabled={selectedFiles.length === 0}
        >
          Download Selected Files
        </Button>
      </div>
      <ScrollArea className="h-[400px] mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="relative">
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
