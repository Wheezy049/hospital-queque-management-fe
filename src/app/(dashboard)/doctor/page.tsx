"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import {
  CalendarCheck,
  ListOrdered,
  Activity,
  Building2,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";
import { useListAdminQueue, useNextQueue } from "@/lib/hooks/useQueue";
import { useCompleteAppointment, useListAppointments } from "@/lib/hooks/useAppointments";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, duration: 0.35, ease: easeOut },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } },
};

function StatCard({
  title,
  value,
  icon: Icon,
  helper,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  helper?: string;
}) {
  return (
    <motion.div variants={item}>
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{title}</p>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              {helper ? (
                <p className="text-xs text-muted-foreground">{helper}</p>
              ) : null}
            </div>

            <div className="h-10 w-10 rounded-2xl border border-border bg-background grid place-items-center">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DoctorOverviewPage() {
  const { user } = useAuth();

  // Use the doctor's assigned department
  const departmentId = user?.departmentId || "";
  const today = format(new Date(), "yyyy-MM-dd");

  const queueQuery = useListAdminQueue({ departmentId, date: today });
  const appointmentsQuery = useListAppointments({ 
    departmentId, 
    type: "upcoming" 
  });

  const nextMutation = useNextQueue();
  const completeCurrentMutation = useCompleteAppointment();

  // Filter appointments for today
  const todayAppointments = (appointmentsQuery.data ?? []).filter(apt => 
    apt.scheduledAt && apt.scheduledAt.split('T')[0] === today
  );
  const todayCount = todayAppointments.length;

  const queue = queueQuery.data ?? [];
  const activeItem = queue.find((q) => q.status === "ACTIVE") ?? null;

  // Waiting count should include people scheduled for today who haven't finished yet
  // We exclude the active patient to get the "waiting" count
  const waitingCount = todayAppointments.filter(apt => 
    apt.status !== "DONE" && 
    apt.status !== "CANCELLED" && 
    apt.id !== activeItem?.appointmentId &&
    apt.id !== activeItem?.appointment?.id
  ).length;

  const isLoading = queueQuery.isPending || appointmentsQuery.isPending;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Building2 className="h-3 w-3" /> {user?.department?.name || "My Department"}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => queueQuery.refetch()}
          disabled={queueQuery.isFetching || !departmentId}
        >
          <RefreshCw className={queueQuery.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          Refresh
        </Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today’s Patients"
          value={isLoading ? "—" : todayCount}
          icon={CalendarCheck}
          helper="Total appointments in queue."
        />
        <StatCard
          title="In Waiting"
          value={isLoading ? "—" : waitingCount}
          icon={ListOrdered}
          helper="Patients waiting to be called."
        />
        <StatCard
          title="Active Session"
          value={isLoading ? "—" : (activeItem ? `#${activeItem.position}` : "None")}
          icon={Activity}
          helper={activeItem ? "A patient is currently with you." : "No active session."}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 rounded-2xl border-border/60 shadow-sm">
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4 space-y-3">
              <p className="text-sm font-semibold">Call Next Patient</p>
              <Button
                className="w-full rounded-xl"
                onClick={() => nextMutation.mutate({ departmentId, date: today })}
                disabled={nextMutation.isPending || !departmentId}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Call Next
              </Button>
            </div>
            <div className="rounded-xl border border-border p-4 space-y-3">
              <p className="text-sm font-semibold">Complete Session</p>
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={() => activeItem && completeCurrentMutation.mutate(activeItem.appointment?.id || "")}
                disabled={!activeItem || completeCurrentMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Current
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20">
            <CardTitle className="text-base">Current Queue</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary rounded-xl">
              <a href="/doctor/queque">View All</a>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : queue.length === 0 ? (
               <div className="p-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted/50 grid place-items-center mx-auto mb-2">
                     <Clock className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">No patients in queue</p>
                    <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                      We couldn&#39;t find any queue records for <span className="font-semibold text-foreground">{user?.department?.name || "your department"}</span> on <span className="font-semibold text-foreground">{format(new Date(), "MMMM do")}</span>.
                    </p>
                  </div>
               </div>
            ) : (
              <div className="divide-y divide-border/40">
                {queue.slice(0, 5).map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold">#{q.position}</div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{q.appointment?.patient?.name || "Patient"}</p>
                        <p className="text-xs text-muted-foreground">{q.scheduledAt ? format(new Date(q.scheduledAt), "h:mm a") : "—"}</p>
                      </div>
                    </div>
                    <Badge variant={q.status === "ACTIVE" ? "default" : "secondary"} className="rounded-lg">
                      {q.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default DoctorOverviewPage;
