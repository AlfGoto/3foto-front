"use client";

import { ImageProcessor } from "@/components/ImageProcessor";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <div className="max-w-4xl mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-4">Upload Your Raws</h1>
        <ImageProcessor apiUrl={String(process.env.NEXT_PUBLIC_API_DISPLAY)} />
      </div>
    </SessionProvider>
  );
}
