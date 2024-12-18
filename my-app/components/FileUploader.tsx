"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  const [id, setId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    document.title = "3F UP";
  }, []);

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
      setFiles([]);
    } catch (error) {
      console.error(error);
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <Label htmlFor="file" className="block mb-1.5">
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
        <div className="w-full sm:w-auto">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
      {id && (
        <>
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-md">
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
          <Button
            onClick={() => {
              location.reload();
            }}
            variant="outline"
            size="icon"
            className="mt-4 w-fit px-[10px]"
          >
            Another Link ?
          </Button>
        </>
      )}
      <div className="mt-6">
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="h-full min-w-[50px]">
              <CardContent className="p-4 flex flex-col h-full min-w-[50px]">
                {file.type.startsWith("image/") ? (
                  <div className="relative w-full h-32 sm:h-40 min-w-[50px]">
                    <Image
                      src={URL.createObjectURL(file.file)}
                      alt={file.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 sm:h-40 bg-gray-200 flex items-center justify-center min-w-[50px]">
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
      </div>
    </div>
  );
}
