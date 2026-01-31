"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  ListOrdered,
  CalendarCheck,
  Building2,
  UserCircle2,
  LogOut,
  LucideIcon,
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutGrid },
  { title: "Queue", href: "/admin/queue", icon: ListOrdered },
  { title: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
  { title: "Departments", href: "/admin/departments", icon: Building2 },
  { title: "Profile", href: "/admin/profile", icon: UserCircle2 },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname.startsWith(href);
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-[280px] border-r border-border bg-card">
      {/* Logo */}
      <div className="border-b border-border p-6">
        <Link href="/admin" className="flex items-center gap-3">
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
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <button className="w-full flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
