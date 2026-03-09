"use client"
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthed, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthed) {
      router.replace("/login");
      return;
    }

    const isAdminPath = pathname.startsWith("/admin");
    const isPatientPath = pathname.startsWith("/patient");

    if (isAdminPath && user?.role !== "ADMIN") {
      router.replace("/patient");
    } else if (isPatientPath && user?.role !== "PATIENT") {
      router.replace("/admin");
    }
  }, [isLoading, isAuthed, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
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
