"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ListOrdered,
  RefreshCw,
  UserRound,
} from "lucide-react";
import type { QueueItem } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListAdminQueue, useMoveQueue, useNextQueue } from "@/lib/hooks/useQueue";
import { useCompleteAppointment } from "@/lib/hooks/useAppointments";
import { format } from "date-fns";
import { useAuth } from "@/providers/auth-provider";
import { Building2 } from "lucide-react";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

function badgeVariant(status: QueueItem["status"]) {
  switch (status) {
    case "ACTIVE": return "default";
    case "WAITING": return "secondary";
    case "DONE": return "outline";
    default: return "secondary";
  }
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function QueuePage() {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? "";
  const [date, setDate] = React.useState<string>(todayISO());

  const queueQuery = useListAdminQueue({ departmentId, date });
  const queue = React.useMemo(() => {
    return (queueQuery.data ?? []).slice().sort((a, b) => a.position - b.position)
  }, [queueQuery.data]);

  const waitingCount = queue.filter((q) => q.status === "WAITING").length;
  const activeItem = queue.find((q) => q.status === "ACTIVE") ?? null;

  const nextMutation = useNextQueue();
  const moveMutation = useMoveQueue();
  const completeCurrentMutation = useCompleteAppointment();

  const canOperate = !!departmentId && !!date;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Queue Management</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <Building2 className="h-3.5 w-3.5 text-primary" /> {user?.department?.name || "My Department"}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <ListOrdered className="h-3.5 w-3.5 text-primary" /> Today, {format(new Date(), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button
            variant="outline"
            className="rounded-xl h-10"
            onClick={() => queueQuery.refetch()}
            disabled={!canOperate || queueQuery.isFetching}
          >
            <RefreshCw className={queueQuery.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Refresh Queue
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              Queue Summary
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
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : queue.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-background border border-border/60 grid place-items-center mx-auto shadow-sm">
                  <UserRound className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">No patients in queue</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                    The queue is currently empty for your department today.
                  </p>
                </div>
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
                        isActive ? "border-primary/30 bg-primary/5" : "border-border bg-background",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl border border-border bg-card grid place-items-center font-bold text-foreground">
                          #{q.position}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{q.appointment?.patient?.name || "Patient"}</p>
                          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 truncate">
                            <span>{q.scheduledAt ? format(new Date(q.scheduledAt), "h:mm a") : "—"}</span>
                          </div>
                          <Badge variant={badgeVariant(q.status)} className="rounded-lg mt-1">{q.status}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => moveMutation.mutate({ id: q.id, direction: "UP" })}
                          disabled={!canOperate || moveMutation.isPending || q.status === "DONE"}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => moveMutation.mutate({ id: q.id, direction: "DOWN" })}
                          disabled={!canOperate || moveMutation.isPending || q.status === "DONE"}
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
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full rounded-xl"
              onClick={() => nextMutation.mutate({ departmentId, date })}
              disabled={!canOperate || nextMutation.isPending}
            >
              {nextMutation.isPending ? "Calling..." : "Call Next"}
            </Button>
            <Button
              variant="secondary"
              className="w-full rounded-xl"
              onClick={() => activeItem && completeCurrentMutation.mutate(activeItem.appointment?.id || "")}
              disabled={!canOperate || !activeItem || completeCurrentMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {completeCurrentMutation.isPending ? "Completing..." : "Complete Current"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default QueuePage;
