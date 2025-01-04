"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorViewProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { FileIcon, Trash2Icon, DownloadIcon } from "lucide-react";

export function CreatorView({ id, files, API_URL }: CreatorViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function deleteDisplay(id: string) {
    const response = await fetch(`${API_URL}/delete-display/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete display");
    }

    return await response.json();
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDisplay(id);
      setSuccess("Display deleted successfully");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to delete display");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (fileName: string) => {
    // In a real application, you would fetch the file from your server here
    // For this example, we'll just create a dummy text file
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
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl font-bold mb-4">Creator View</h1>
      <div className="mb-6">
        <p className="text-lg font-semibold">Selected Files:</p>
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
      </div>
      <div className="flex justify-between items-center">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center space-x-2"
        >
          <Trash2Icon className="h-4 w-4" />
          <span>{isDeleting ? "Deleting..." : "Delete Display"}</span>
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mt-4 bg-green-100 border-green-300">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
