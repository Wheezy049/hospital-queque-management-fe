"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bell,
  User2,
  Settings,
  LogOut,
  ListOrdered,
  LucideIcon,
  BookUser,
} from "lucide-react";
import { formatHeaderDate } from "@/lib/date";
import { useAuth } from "@/providers/auth-provider";

const superAdminPageMeta: Record<
  string,
  { title: string; subtitle: string; ctaHref?: string; ctaLabel?: string; ctaIcon?: LucideIcon }
> = {
  "/super-admin": {
    title: "Hospital Management",
    subtitle: "Global overview and system configuration.",
  },
  "/super-admin/departments": {
    title: "Departments",
    subtitle: "Manage hospital units and units.",
  },
  "/super-admin/doctors": {
    title: "Medical Staff",
    subtitle: "Manage doctors and department assignments.",
  },
  "/super-admin/queue": {
    title: "Global Queue",
    subtitle: "Real-time monitoring of all clinic queues.",
  },
  "/super-admin/profile": {
    title: "Admin Profile",
    subtitle: "Your administrative account settings.",
  },
};

const doctorPageMeta: Record<
  string,
  { title: string; subtitle: string; ctaHref?: string; ctaLabel?: string; ctaIcon?: LucideIcon }
> = {
  "/doctor": {
    title: "Doctor Dashboard",
    subtitle: "Overview of your clinical activity.",
    ctaHref: "/doctor/queue",
    ctaLabel: "Go to Queue",
    ctaIcon: ListOrdered,
  },
  "/doctor/appointments": {
    title: "Appointments",
    subtitle: "Manage patient bookings and notes.",
    ctaHref: "/doctor/queue",
    ctaLabel: "Go to Queue",
    ctaIcon: ListOrdered,
  },
  "/doctor/queue": {
    title: "Department Queue",
    subtitle: "Manage patient flow and sessions.",
  },
  "/doctor/profile": {
    title: "Medical Profile",
    subtitle: "Your clinical staff account details.",
  },
};

const patientPageMeta: Record<
  string,
  { title: string; subtitle: string; ctaHref?: string; ctaLabel?: string; ctaIcon?: LucideIcon }
> = {
  "/patient": {
    title: "Welcome 👋",
    subtitle: "Track your health and appointments.",
    ctaHref: "/patient/book",
    ctaLabel: "Book Appointment",
    ctaIcon: BookUser,
  },
  "/patient/appointments": {
    title: "My Appointments",
    subtitle: "Manage your upcoming visits.",
    ctaHref: "/patient/book",
    ctaLabel: "Book Appointment",
    ctaIcon: BookUser,
  },
  "/patient/book": {
    title: "New Appointment",
    subtitle: "Book a slot with your preferred department.",
  },
  "/patient/queue": {
    title: "Queue Status",
    subtitle: "Check your real-time waiting position.",
  },
};

function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const pageMeta = isSuperAdmin ? superAdminPageMeta : isAdmin ? doctorPageMeta : patientPageMeta;
  const homePath = isSuperAdmin ? "/super-admin" : isAdmin ? "/doctor" : "/patient";
  const profilePath = isSuperAdmin ? "/super-admin/profile" : isAdmin ? "/doctor/profile" : "/patient/profile";
  const settingsPath = isSuperAdmin ? "/super-admin/settings" : isAdmin ? "/doctor/settings" : "/patient/settings";

  const meta = useMemo(() => {
    const keys = Object.keys(pageMeta).sort((a, b) => b.length - a.length);
    const key = keys.find((k) => pathname.startsWith(k)) ?? homePath;
    return pageMeta[key] || { title: "Dashboard", subtitle: "Welcome back." };
  }, [pathname, pageMeta, homePath]);

  const dateLabel = formatHeaderDate(new Date());
  const displayName = user?.name || "User";
  const initials = displayName?.[0]?.toUpperCase() ?? "U";
  const CtaIcon = meta.ctaIcon;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="h-20 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">
              {meta.title.includes("Welcome") ? `${meta.title}, ${displayName}` : meta.title}
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
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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