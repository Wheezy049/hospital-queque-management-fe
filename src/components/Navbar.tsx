"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  X,
  User2,
  Settings,
  LogOut,
  ListOrdered,
  LucideIcon,
  BookUser,
} from "lucide-react";
import { formatHeaderDate } from "@/lib/date";
import { useAuth } from "@/providers/auth-provider";

const adminPageMeta: Record<
  string,
  { title: string; subtitle: string; ctaHref?: string; ctaLabel?: string; ctaIcon?: LucideIcon }
> = {
  "/admin": {
    title: "Welcome back 👋",
    subtitle: "Overview of today’s activity.",
    ctaHref: "/admin/queue",
    ctaLabel: "Go to Queue",
    ctaIcon: ListOrdered,
  },
  "/admin/queue": {
    title: "Queue Management",
    subtitle: "Call next patient and track progress.",
    ctaHref: "/admin/queue",
    ctaLabel: "Go to Queue",
    ctaIcon: ListOrdered,
  },
  "/admin/appointments": {
    title: "Appointments",
    subtitle: "Manage bookings, cancellations, and completion.",
    ctaHref: "/admin/queue",
    ctaLabel: "Go to Queue",
    ctaIcon: ListOrdered,
  },
  "/admin/departments": {
    title: "Departments",
    subtitle: "Create departments and manage limits.",
    ctaHref: "/admin/queue",
    ctaLabel: "Go to Queue",
    ctaIcon: ListOrdered,
  },
  "/admin/profile": {
    title: "Profile",
    subtitle: "Your staff account details.",
  },
};

const patientPageMeta: Record<
  string,
  { title: string; subtitle: string; ctaHref?: string; ctaLabel?: string; ctaIcon?: LucideIcon }
> = {
  "/patient": {
    title: "Welcome back 👋",
    subtitle: "Overview of your appointments and queue status.",
    ctaHref: "/patient/book",
    ctaLabel: "Book Appointment",
    ctaIcon: BookUser,
  },
  "/patient/appointments": {
    title: "Your Appointments",
    subtitle: "Here are your upcoming appointments.",
    ctaHref: "/patient/book",
    ctaLabel: "Book Appointment",
    ctaIcon: BookUser,
  },
  "/patient/book": {
    title: "Book an Appointment",
    subtitle: "Choose a department and a doctor.",
  },
  "/patient/queue": {
    title: "Your Queue Status",
    subtitle: "Check your position in the waiting line.",
  },
  "/patient/profile": {
    title: "Your Profile",
    subtitle: "Your personal details.",
  },
};

function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

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

  const pageMeta = isAdmin ? adminPageMeta : patientPageMeta;
  const homePath = isAdmin ? "/admin" : "/patient";
  const profilePath = isAdmin ? "/admin/profile" : "/patient/profile";
  const settingsPath = isAdmin ? "/admin/settings" : "/patient/settings";

  const meta = useMemo(() => {
    // find best match (so /admin/queue/123 still matches /admin/queue)
    const keys = Object.keys(pageMeta).sort((a, b) => b.length - a.length);
    const key = keys.find((k) => pathname.startsWith(k)) ?? homePath;
    return pageMeta[key];
  }, [pathname, pageMeta, homePath]);

  const dateLabel = formatHeaderDate(new Date());
  const displayName = user?.name || "Admin";
  const initials = displayName?.[0]?.toUpperCase() ?? "A";

  const CtaIcon = meta.ctaIcon;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="h-20 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            {isMenuOpen ? (
              <X onClick={() => setIsMenuOpen(false)} className="h-6 w-6 text-foreground cursor-pointer" />
            ) : (
              <Menu onClick={() => setIsMenuOpen(true)} className="h-6 w-6 text-foreground cursor-pointer" />
            )}
          </div>

          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">
              {meta.title === "Welcome back 👋" ? `Welcome back, ${displayName} 👋` : meta.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {dateLabel} • {meta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meta.ctaHref && meta.ctaLabel ? (
            <Button asChild className="hidden md:flex rounded-xl">
              <Link href={meta.ctaHref}>
                {CtaIcon ? <CtaIcon className="mr-2 h-4 w-4" /> : null}
                {meta.ctaLabel}
              </Link>
            </Button>
          ) : null}

          <Button variant="outline" size="icon" className="hidden md:flex rounded-xl" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

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
                    {initials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? "admin@hospital.com"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href={profilePath}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User2 className="h-4 w-4" />
                    Profile
                  </Link>

                  <Link
                    href={settingsPath}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                <div className="mt-1 pt-1 border-t border-border">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
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