"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthed, user } = useAuth();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthed) router.replace("/login");
      else if (user?.role !== "ADMIN") router.replace("/login");
    }
  }, [isLoading, isAuthed, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
         <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Navbar />
          <main className="px-4 md:px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
