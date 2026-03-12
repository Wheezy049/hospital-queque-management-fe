"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import { UserCircle2, Mail, BadgeCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.4, ease: easeOut },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
};

function PatientProfilePage() {
  const { user, isLoading } = useAuth();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-3xl"
    >
      <motion.div variants={item}>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and account settings.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
          <div className="h-24 md:h-32 bg-primary/10 w-full relative">
            {/* Header background accent */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
          </div>
          
          <CardContent className="px-6 pb-8 pt-0 relative sm:px-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 sm:-mt-16 mb-8">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background bg-card flex items-center justify-center shadow-md relative overflow-hidden">
                <UserCircle2 className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/60" />
              </div>
              
              <div className="text-center sm:text-left pb-2 flex-1">
                {isLoading ? (
                  <div className="space-y-2 flex flex-col items-center sm:items-start">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                      {user?.name || "Unknown Patient"}
                      <BadgeCheck className="h-5 w-5 text-primary" />
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                      Patient Account
                    </p>
                  </>
                )}
              </div>
              
              {!isLoading && (
                 <div className="pb-2 hidden sm:block">
                   <Badge variant="outline" className="rounded-lg px-3 py-1 bg-primary/5 text-primary border-primary/20">
                     Active User
                   </Badge>
                 </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-3 text-muted-foreground mb-1">
                    <UserCircle2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Full Name</span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-full max-w-[200px]" />
                  ) : (
                    <p className="text-base font-medium text-foreground">{user?.name || "—"}</p>
                  )}
                </div>
                
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-3 text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Email Address</span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-full max-w-[240px]" />
                  ) : (
                    <p className="text-base font-medium text-foreground">{user?.email || "—"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                 <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-3 text-muted-foreground mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Account Role</span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-full max-w-[100px]" />
                  ) : (
                    <p className="text-base font-medium text-foreground">{user?.role || "—"}</p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-3 text-muted-foreground mb-1">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Account ID</span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-full max-w-[280px]" />
                  ) : (
                    <p className="text-xs font-mono font-medium text-foreground truncate">{user?.id || "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default PatientProfilePage;