"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Bell, Menu, X, User2, Settings, LogOut, ListOrdered } from "lucide-react";

function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="h-20 flex items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            {isMenuOpen ? (
              <X
                onClick={() => setIsMenuOpen(false)}
                className="h-6 w-6 text-foreground cursor-pointer"
              />
            ) : (
              <Menu
                onClick={() => setIsMenuOpen(true)}
                className="h-6 w-6 text-foreground cursor-pointer"
              />
            )}
          </div>

          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">Welcome back 👋</p>
            <p className="text-xs text-muted-foreground">
              Manage today’s queue and appointments.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Queue quick action */}
          <Button asChild className="hidden md:flex rounded-xl">
            <Link href="/admin/queue">
              <ListOrdered className="mr-2 h-4 w-4" />
              Go to Queue
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="icon"
              className={cn("rounded-xl", isProfileOpen && "bg-muted")}
              aria-label="User menu"
              onClick={() => setIsProfileOpen((v) => !v)}
            >
              <User2 className="h-4 w-4" />
            </Button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card shadow-lg p-2">
                <div className="flex items-center gap-3 p-3 border-b border-border mb-1">
                  <div className="h-10 w-10 rounded-full grid place-items-center bg-primary text-primary-foreground font-bold text-lg">
                    A
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-foreground truncate">Admin</p>
                    <p className="text-xs text-muted-foreground truncate">admin@hospital.com</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User2 className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                <div className="mt-1 pt-1 border-t border-border">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
