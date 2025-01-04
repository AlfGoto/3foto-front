"use client";

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { DisplayDisplays } from "@/components/profile/display-displays";

export default function ProfilePage() {
  const [displays, setDisplays] = useState([]);
  const { status, data: session } = useSession();

  useEffect(() => {
    getDisplays();
  }, [status]);
  async function getDisplays() {
    if (status === "loading") return;
    const myHeaders = new Headers();
    if (session?.token) myHeaders.append("credentials", session?.token);
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_DISPLAY! + "/displays",
      {
        credentials: "include",
        headers: myHeaders,
      }
    );
    const json = await response.json();
    setDisplays(json);
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <SessionProvider>
      <div className="max-w-4xl mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-8">Profile</h1>
        <DisplayDisplays items={displays} session={session} />
        <br />
        <Button variant="destructive" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </SessionProvider>
  );
}
