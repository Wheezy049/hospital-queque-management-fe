import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <Navbar />

          <main className="px-4 md:px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
