"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthed, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthed) router.replace("/admin");
      else router.replace("/login");
    }
  }, [isLoading, isAuthed, router]);

  return (
    <div className="min-h-screen grid place-items-center">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
    </div>
  );
}
