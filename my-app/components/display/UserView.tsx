"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserViewProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function UserView({ id, files, API_URL }: UserViewProps) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submitSelectedFiles(id: string, selectedFiles: string[]) {
    const response = await fetch(`${API_URL}/submit-files/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedFiles }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit selected files");
    }

    return await response.json();
  }

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await submitSelectedFiles(id, selectedFiles);
      setSuccess("Files submitted successfully");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to submit files");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl font-bold mb-4">Select Files</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <Card
            key={file.id}
            className={`cursor-pointer ${
              selectedFiles.includes(file.id) ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelectFile(file.id)}
          >
            <CardContent className="p-4">
              <div className="aspect-square relative mb-2">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedFiles.length === 0}
        className="mt-4"
      >
        {isSubmitting ? "Submitting..." : "Submit Selected Files"}
      </Button>
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
