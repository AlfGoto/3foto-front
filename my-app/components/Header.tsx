"use client";

import { SessionProvider } from "next-auth/react";
import LoginButton from "./LoginButton";

export function Header() {
  return (
    <SessionProvider>
      <header className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">3F</span>
          </div>
          <LoginButton />
        </div>
      </header>
    </SessionProvider>
  );
}
