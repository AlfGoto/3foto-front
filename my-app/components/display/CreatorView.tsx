"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileIcon, DownloadIcon } from "lucide-react";

export interface CreatorViewProps {
  files: string[];
}

export function CreatorView({ files = [] }: CreatorViewProps) {
  const handleDownload = (fileName: string) => {
    const blob = new Blob([`This is the content of ${fileName}`], {
      type: "text/plain",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl font-bold mb-4">Creator View</h1>
      <div className="mb-6">
        <p className="text-lg font-semibold">Selected Files:</p>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">
            No files have been selected yet.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              The user has selected {files.length} file
              {files.length !== 1 ? "s" : ""}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((fileName, index) => (
                <Card key={index} className="flex items-center">
                  <CardContent className="flex justify-between items-center w-full py-4">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">
                        {fileName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(fileName)}
                      title="Download file"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
