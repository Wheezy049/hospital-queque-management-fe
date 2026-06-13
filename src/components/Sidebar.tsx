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
  Users,
} from "lucide-react";
import { useHospital } from "@/providers/hospital-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const superAdminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/super-admin", icon: LayoutGrid },
  { title: "Departments", href: "/super-admin/departments", icon: Building2 },
  { title: "Manage Doctors", href: "/super-admin/doctors", icon: Users },
  { title: "Global Queue", href: "/super-admin/queue", icon: ListOrdered },
  { title: "Profile", href: "/super-admin/profile", icon: UserCircle2 },
];

const doctorNavItems: NavItem[] = [
  { title: "Overview", href: "/doctor", icon: LayoutGrid },
  { title: "Appointments", href: "/doctor/appointments", icon: CalendarCheck },
  { title: "My Queue", href: "/doctor/queue", icon: ListOrdered },
  { title: "Profile", href: "/doctor/profile", icon: UserCircle2 },
];

const patientNavItems: NavItem[] = [
  { title: "Overview", href: "/patient", icon: LayoutGrid },
  { title: "My Appointments", href: "/patient/appointments", icon: CalendarCheck },
  { title: "Book Appointment", href: "/patient/book", icon: BookUser },
  { title: "Queue Status", href: "/patient/queue", icon: ListOrdered },
  { title: "Profile", href: "/patient/profile", icon: UserCircle2 },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/super-admin" || href === "/doctor" || href === "/patient") return pathname === href;
  return pathname.startsWith(href);
}

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { activeHospitalId, setActiveHospitalId, hospitals } = useHospital();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";

  let navItems: NavItem[] = [];
  let dashboardType = "";
  let homeHref = "/";

  if (isSuperAdmin) {
    navItems = superAdminNavItems;
    dashboardType = "Super Admin";
    homeHref = "/super-admin";
  } else if (isAdmin) {
    navItems = doctorNavItems;
    dashboardType = "Doctor Dashboard";
    homeHref = "/doctor";
  } else {
    navItems = patientNavItems;
    dashboardType = "Patient Dashboard";
    homeHref = "/patient";
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-[250px] border-r border-border bg-card h-screen sticky top-0">
      <div className="border-b border-border p-5 space-y-4">
        <Link href={homeHref} className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Qure Logo"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <div className="leading-tight whitespace-nowrap overflow-hidden">
            <p className="font-bold text-foreground text-lg">Qure</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{dashboardType}</p>
          </div>
        </Link>

        {/* Hospital Selector for Super Admins and Patients */}
        {(isSuperAdmin || user?.role === "PATIENT") && hospitals.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Active Location
            </label>
            <Select value={activeHospitalId} onValueChange={setActiveHospitalId}>
              <SelectTrigger className="w-full h-9 rounded-xl border-border bg-background text-xs font-semibold focus:ring-1">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {hospitals.map((h) => (
                  <SelectItem key={h.id} value={h.id} className="text-xs font-medium rounded-lg">
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
