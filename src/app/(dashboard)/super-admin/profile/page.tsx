"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User2, Mail, Shield, Fingerprint } from "lucide-react";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

function ProfilePage() {
  const { user } = useAuth();
  const initials = user?.name?.[0]?.toUpperCase() ?? "S";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your administrative account settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="h-fit rounded-2xl border-border/60 shadow-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto h-24 w-24 rounded-full grid place-items-center bg-primary text-primary-foreground font-bold text-4xl shadow-sm">
              {initials}
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{user?.name || "Super Admin"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || "admin@hospital.com"}</p>
            </div>
            <div className="pt-2">
              <Badge className="rounded-lg">{user?.role || "SUPER_ADMIN"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" defaultValue={user?.name} className="pl-9 rounded-xl" readOnly />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" defaultValue={user?.email} className="pl-9 rounded-xl" readOnly />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="role" defaultValue={user?.role} className="pl-9 rounded-xl bg-muted/50" readOnly disabled />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="id">User ID</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="id" defaultValue={user?.id} className="pl-9 rounded-xl font-mono text-xs bg-muted/50" readOnly disabled />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 ${className}`}>
      {children}
    </span>
  );
}

export default ProfilePage;
