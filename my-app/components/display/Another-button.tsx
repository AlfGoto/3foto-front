"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Clipboard } from "lucide-react";

export function AnotherDisplay({ id }: { id: string }) {
  const [isCopied, setIsCopied] = useState(false);
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
    <>
      <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-md">
        <p className="text-green-800 font-semibold mb-2">Upload success !</p>
        <p className="text-sm text-green-700 mb-2">
          You can share this display with this link :
        </p>
        <div className="flex items-center space-x-2">
          <Input
            value={`${window.location.origin}/display/${id}`}
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
            <span className="sr-only">{isCopied ? "Copied" : "Copy link"}</span>
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
        Another display?
      </Button>
    </>
  );
}
