"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  LayoutGrid,
  ListOrdered,
  CalendarCheck,
  Building2,
  UserCircle2,
  LogOut,
  LucideIcon,
  BookUser,
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const adminNavItems: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutGrid },
  { title: "Queque", href: "/admin/queque", icon: ListOrdered },
  { title: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
  { title: "Departments", href: "/admin/departments", icon: Building2 },
  { title: "Profile", href: "/admin/profile", icon: UserCircle2 },
];

const patientNavItems: NavItem[] = [
  { title: "Overview", href: "/patient", icon: LayoutGrid },
  { title: "My Appointments", href: "/patient/appointments", icon: CalendarCheck },
  { title: "Book Appointment", href: "/patient/book", icon: BookUser },
  { title: "Queque Status", href: "/patient/queue", icon: ListOrdered },
  { title: "Profile", href: "/patient/profile", icon: UserCircle2 },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin" || href === "/patient") return pathname === href;
  return pathname.startsWith(href);
}

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : patientNavItems;
  const homeHref = isAdmin ? "/admin" : "/patient";
  const dashboardType = isAdmin ? "Admin Dashboard" : "Patient Dashboard";

  return (
    <aside className="hidden md:flex md:flex-col md:w-[280px] border-r border-border bg-card">
      <div className="border-b border-border p-6">
        <Link href={homeHref} className="flex items-center gap-3">
          <div className="">
            <Image
              src="/logo.png"
              alt="Hospital Queue"
              width={70}
              height={70}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="leading-tight whitespace-nowrap">
            <p className="font-semibold text-foreground">Hospital Queue</p>
            <p className="text-xs text-muted-foreground">{dashboardType}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-9 w-9 rounded-xl grid place-items-center border transition-colors",
                    active
                      ? "border-primary/20 bg-primary/15"
                      : "border-border bg-background group-hover:bg-background"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-foreground")} />
                </span>

                <p className={cn("text-sm font-semibold", active ? "text-foreground" : "")}>
                  {item.title}
                </p>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-6 py-4 border-t border-border">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
