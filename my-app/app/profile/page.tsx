"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>
      <Button variant="destructive" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}
