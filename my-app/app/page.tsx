"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleUpload = () => {
    console.log(files)
    // Here you would typically send the files to your backend
    // For now, we'll just simulate this by navigating to the download page
    router.push("/download");
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Upload Files</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="file">Choose files</Label>
          <Input id="file" type="file" onChange={handleFileChange} multiple />
        </div>
        <Button onClick={handleUpload} disabled={files.length === 0}>
          Upload
        </Button>
      </div>
      <ScrollArea className="h-[300px] mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
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
    </div>
  );
}
