"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ListOrdered,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { api } from "@/lib/api/endpoints";
import type { QuequeItem } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

function badgeVariant(status: QuequeItem["status"]) {
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

function todayISO() {
  // YYYY-MM-DD
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminQueuePage() {
  const qc = useQueryClient();
  const hospitalId = process.env.NEXT_PUBLIC_HOSPITAL_ID ?? "";

  // load departments (admin)
  const departmentsQuery = useQuery({
    queryKey: ["departments", hospitalId],
    queryFn: () => api.departments.list({ hospitalId }),
  });

  // avoid useEffect setState: derive default department from data
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string>("");
  const firstDepartmentId = departmentsQuery.data?.[0]?.id ?? "";
  const departmentId = selectedDepartmentId || firstDepartmentId;

  // date filter (optional)
  const [date, setDate] = React.useState<string>(todayISO());

  // queue query
  const queueQuery = useQuery({
    queryKey: ["queue", "byDate", departmentId, date],
    queryFn: () => api.queue.listAdmin({ departmentId, date }),
    enabled: !!departmentId,
    refetchInterval: 10_000, // near-real-time
  });

  const queue = (queueQuery.data ?? []).slice().sort((a, b) => a.position - b.position);
  const waitingCount = queue.filter((q) => q.status === "WAITING").length;
  const activeItem = queue.find((q) => q.status === "ACTIVE") ?? null;

  const nextMutation = useMutation({
    mutationFn: () => api.queue.next({ departmentId, date }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["queue", "byDate", departmentId, date] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: (vars: { id: string; direction: "UP" | "DOWN" }) =>
      api.queue.move(vars.id, vars.direction),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["queue", "byDate", departmentId, date] });
    },
  });

  const completeCurrentMutation = useMutation({
    mutationFn: (appointmentId: string) => api.appointments.complete(appointmentId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["queue", "byDate", departmentId, date] });
    },
  });

  const canOperate = !!departmentId && !!date;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Queue</h1>
          <p className="text-sm text-muted-foreground">
            Call next patient, move queue order, and complete the current patient.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Department */}
          <Select value={departmentId} onValueChange={setSelectedDepartmentId}>
            <SelectTrigger className="w-full sm:w-[240px] rounded-xl">
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

          {/* Date */}
          <Input
            className="rounded-xl sm:w-[160px]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />

          {/* Refresh */}
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => queueQuery.refetch()}
            disabled={!canOperate || queueQuery.isFetching}
          >
            <RefreshCw className={queueQuery.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </div>

      {!hospitalId ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-destructive">Missing hospitalId</p>
            <p className="text-xs text-muted-foreground mt-1">
              Set <span className="font-mono">NEXT_PUBLIC_HOSPITAL_ID</span> in <span className="font-mono">.env.local</span>.
              Your backend needs hospitalId for departments.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats + actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              Queue summary
            </CardTitle>
            <CardDescription>
              Total: <span className="font-semibold text-foreground">{queue.length}</span> • Waiting:{" "}
              <span className="font-semibold text-foreground">{waitingCount}</span> • Active:{" "}
              <span className="font-semibold text-foreground">{activeItem ? `#${activeItem.position}` : "—"}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {queueQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : queueQuery.isError ? (
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-semibold text-destructive">
                  {(queueQuery.error as Error).message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ensure departmentId is selected and backend route matches.
                </p>
              </div>
            ) : queue.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <p className="text-sm font-semibold text-foreground">No queue for this date</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Book appointments to generate queue items.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.map((q) => {
                  const isActive = q.status === "ACTIVE";
                  return (
                    <div
                      key={q.id}
                      className={[
                        "rounded-xl border p-4 flex items-center justify-between gap-3",
                        isActive
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-background",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl border border-border bg-card grid place-items-center font-bold text-foreground">
                          #{q.position}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            Appointment:{" "}
                            <span className="font-mono text-xs text-muted-foreground">
                              {q.appointmentId}
                            </span>
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant={badgeVariant(q.status)} className="rounded-lg">
                              {q.status}
                            </Badge>
                            {isActive ? (
                              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                                <UserRound className="h-3.5 w-3.5" /> Current
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Move controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => moveMutation.mutate({ id: q.id, direction: "UP" })}
                          disabled={!canOperate || moveMutation.isPending || q.status === "DONE"}
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => moveMutation.mutate({ id: q.id, direction: "DOWN" })}
                          disabled={!canOperate || moveMutation.isPending || q.status === "DONE"}
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Run core queue actions for selected department/date.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button
              className="w-full rounded-xl"
              onClick={() => nextMutation.mutate()}
              disabled={!canOperate || nextMutation.isPending}
            >
              {nextMutation.isPending ? "Calling..." : "Call Next"}
            </Button>

            <Button
              variant="secondary"
              className="w-full rounded-xl"
              onClick={() => {
                if (!activeItem) return;
                completeCurrentMutation.mutate(activeItem.appointmentId);
              }}
              disabled={!canOperate || !activeItem || completeCurrentMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {completeCurrentMutation.isPending ? "Completing..." : "Complete Current"}
            </Button>

            <Separator />

            <div className="rounded-xl border border-border bg-background p-4 text-sm">
              <p className="font-semibold text-foreground">Selected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Department:{" "}
                <span className="font-mono">
                  {departmentId ? departmentId : "—"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Date: <span className="font-mono">{date || "—"}</span>
              </p>
            </div>

            {(nextMutation.isError || moveMutation.isError || completeCurrentMutation.isError) ? (
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-destructive">
                  {(
                    (nextMutation.error ||
                      moveMutation.error ||
                      completeCurrentMutation.error) as Error
                  )?.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check that you’re logged in as ADMIN and departmentId is valid.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
