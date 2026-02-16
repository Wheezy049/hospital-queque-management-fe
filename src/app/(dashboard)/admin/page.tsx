"use client";
import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  ListOrdered,
  Activity,
  Building2,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api/endpoints";
import type { QuequeItem } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function statusBadgeVariant(status: QuequeItem["status"]) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "WAITING":
      return "secondary";
    case "DONE":
      return "outline";
    default:
      return "secondary";
  }
}

function formatTimeAgo(dateISO: string) {
  const d = new Date(dateISO);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

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

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx} className="rounded-2xl border-border/60">
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminOverviewPage() {
  const qc = useQueryClient();
  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.departments.list(),
  });

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(() => 
    departmentsQuery.data?.[0]?.id ?? ""
  );
  const nextMutation = useMutation({
    mutationFn: () => api.queue.next({ departmentId }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["queue", "today", departmentId] });
    },
  });

  const firstDepartmentId = departmentsQuery.data?.[0]?.id ?? "";
  
  const departmentId = selectedDepartmentId || firstDepartmentId;

  // Queue (admin)
  const queueQuery = useQuery({
  queryKey: ["queue", "today", departmentId],
  queryFn: () => api.queue.listAdmin({ departmentId }),
  enabled: !!departmentId,
});

  // Departments

  const completeCurrentMutation = useMutation({
    mutationFn: (appointmentId: string) => api.appointments.complete(appointmentId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["queue", "today", departmentId] });
    },
  });

  const queue = queueQuery.data ?? [];
  const waitingCount = queue.filter((q) => q.status === "WAITING").length;
  const activeItem = queue.find((q) => q.status === "ACTIVE") ?? null;

  // For MVP: use queue length as “today’s appointments being handled”
  // Replace with real /appointments/today when you add it.
  const todayAppointmentsCount = queue.length;

  const departmentsCount = departmentsQuery.data?.length ?? 0;

  const isLoading = queueQuery.isLoading || departmentsQuery.isLoading;
  const isError = queueQuery.isError || departmentsQuery.isError;

  const queuePreview = queue.slice(0, 6);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top heading block */}
      <motion.div variants={item} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Summary of today’s activity: appointments, queue, and setup.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={departmentId} onValueChange={setSelectedDepartmentId}>
            <SelectTrigger className="w-[220px] rounded-xl">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {(departmentsQuery.data ?? []).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => nextMutation.mutate()}
            disabled={queueQuery.isFetching || !departmentId}
          >
            <RefreshCw className={queueQuery.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <LoadingGrid />
      ) : isError ? (
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-destructive">
                Couldn’t load overview data.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check your API base URL, token, and backend availability.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today’s Appointments"
            value={todayAppointmentsCount}
            icon={CalendarCheck}
            helper="Based on today’s queue records."
          />
          <StatCard
            title="Waiting"
            value={waitingCount}
            icon={ListOrdered}
            helper="Patients currently in WAITING state."
          />
          <StatCard
            title="Current Active"
            value={activeItem ? `#${activeItem.position}` : "—"}
            icon={Activity}
            helper={activeItem ? "A patient is being attended." : "No active patient yet."}
          />
          <StatCard
            title="Departments"
            value={departmentsCount}
            icon={Building2}
            helper="Configured departments."
          />
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Call next patient</p>
                    <p className="text-xs text-muted-foreground">
                      Moves the queue forward and sets the next as ACTIVE.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-lg">
                    Queue
                  </Badge>
                </div>

                <Button
                  className="mt-3 w-full rounded-xl"
                  onClick={() => nextMutation.mutate()}
                  disabled={nextMutation.isPending}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {nextMutation.isPending ? "Calling..." : "Call Next"}
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Complete current</p>
                    <p className="text-xs text-muted-foreground">
                      Marks the current ACTIVE patient’s appointment as complete.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-lg">
                    Appointment
                  </Badge>
                </div>

                <Button
                  variant="secondary"
                  className="mt-3 w-full rounded-xl"
                  onClick={() => {
                    if (!activeItem) return;
                    completeCurrentMutation.mutate(activeItem.appointmentId);
                  }}
                  disabled={!activeItem || completeCurrentMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {completeCurrentMutation.isPending ? "Completing..." : "Complete Current"}
                </Button>

                {!activeItem ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No active patient right now.
                  </p>
                ) : null}
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                Tip: Use Queue page for full control (move, manage, details).
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Queue preview */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today’s queue</CardTitle>
              <Button asChild variant="outline" className="rounded-xl">
                <a href="/admin/queue">Open Queue</a>
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {queueQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : queuePreview.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">No queue for today yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Once appointments are booked, they’ll show up here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border rounded-xl border border-border bg-background">
                  {queuePreview.map((q) => (
                    <div key={q.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl border border-border bg-card grid place-items-center font-bold text-foreground">
                          #{q.position}
                        </div>

                        <div className="leading-tight">
                          <p className="text-sm font-semibold text-foreground">
                            Appointment ID:{" "}
                            <span className="font-medium text-muted-foreground">
                              {q.appointmentId}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created {formatTimeAgo(q.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={statusBadgeVariant(q.status)}
                        className="rounded-lg"
                      >
                        {q.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Showing first {queuePreview.length} items.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Optional: small footer card */}
      <motion.div variants={item}>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">System summary</p>
              <p className="text-xs text-muted-foreground">
                Departments configured: {departmentsCount} • Queue items today: {todayAppointmentsCount}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-xl">
              <a href="/admin/departments">Manage Departments</a>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
