"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clipboard, Check } from "lucide-react";
import Image from "next/image";

interface FileItem {
  id: string;
  name: string;
  type: string;
  file: File;
}

interface FileUploaderProps {
  apiUrl: string;
}

export function FileUploader({ apiUrl }: FileUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        file: file,
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadResult(null);
    setId(null);

    try {
      const formData = new FormData();
      files.forEach((fileItem) => {
        formData.append(`files`, fileItem.file, fileItem.name);
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log(result);
      setId(result.id);
      setUploadResult("Files uploaded successfully");
      setFiles([]);
    } catch (error) {
      console.error(error);
      setUploadResult("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (id) {
      const linkToCopy = `${window.location.href}${id}`;
      try {
        await navigator.clipboard.writeText(linkToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-4 flex items-end sm:flex sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-2/3">
          <Label htmlFor="file" className="block mb-1">
            Choose files
          </Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            multiple
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-1/3">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
      {uploadResult && (
        <p
          className={`mt-4 text-sm ${
            uploadResult.includes("Failed") ? "text-red-600" : "text-green-600"
          }`}
        >
          {uploadResult}
        </p>
      )}
      {id && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md">
          <p className="text-green-800 font-semibold mb-2">
            Upload Successful!
          </p>
          <p className="text-sm text-green-700 mb-2">
            Your files are available at:
          </p>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.href}${id}`}
              readOnly
              className="flex-grow text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isCopied ? "Copied" : "Copy link"}
              </span>
            </Button>
          </div>
        </div>
      )}
      <ScrollArea className="h-[300px] mt-4 sm:h-[400px] lg:h-[500px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="h-full">
              <CardContent className="p-4 flex flex-col h-full">
                {file.type.startsWith("image/") ? (
                  <div className="relative w-full h-32 sm:h-40 flex-grow">
                    <Image
                      src={URL.createObjectURL(file.file)}
                      alt={file.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 sm:h-40 bg-gray-200 flex items-center justify-center flex-grow">
                    <span className="text-gray-500 text-sm sm:text-base">
                      {file.type}
                    </span>
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
