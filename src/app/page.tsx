"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthed, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthed){
        if(user?.role === "SUPER_ADMIN") {
          router.replace("/super-admin");
        } else if(user?.role === "ADMIN") {
          router.replace("/doctor");
        } else {
          router.replace("/patient");
        }
      }else router.replace("/login");
    }
  }, [isLoading, isAuthed, router, user]);

  return (
    <div className="min-h-screen grid place-items-center">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
    </div>
  );
}
