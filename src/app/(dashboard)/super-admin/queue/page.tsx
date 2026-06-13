"use client";
import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  RefreshCw,
  History,
  Search,
  Calendar,
  Clock,
  LayoutGrid
} from "lucide-react";
import type { QueueItem } from "@/lib/api/types";
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
import { useListAdminQueue, useMoveQueue, useNextQueue } from "@/lib/hooks/useQueue";
import { useListDepartments } from "@/lib/hooks/useDepartments";
import { useCompleteAppointment } from "@/lib/hooks/useAppointments";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHospital } from "@/providers/hospital-provider";

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

function GlobalQueuePage() {
  const { activeHospitalId: hospitalId } = useHospital();
  const departmentsQuery = useListDepartments(hospitalId)
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string>("");
  const firstDepartmentId = departmentsQuery.data?.[0]?.id ?? "";
  const departmentId = selectedDepartmentId || firstDepartmentId;
  
  // Date is automatically set to today and not editable as per request
  const today = todayISO();
  const [historyDate, setHistoryDate] = useState(today);
  const [search, setSearch] = useState("");

  const queueQuery = useListAdminQueue({ departmentId, date: today });
  const historyQuery = useListAdminQueue({ departmentId, date: historyDate });

  const currentQueue = React.useMemo(() => {
    return (queueQuery.data ?? []).slice().sort((a, b) => a.position - b.position)
  }, [queueQuery.data]);

  const historyQueue = React.useMemo(() => {
    return (historyQuery.data ?? [])
      .filter(q => q.appointment?.patient?.name?.toLowerCase().includes(search.toLowerCase()))
      .slice().sort((a, b) => a.position - b.position);
  }, [historyQuery.data, search]);

  const waitingCount = currentQueue.filter((q) => q.status === "WAITING").length;
  const activeItem = currentQueue.find((q) => q.status === "ACTIVE") ?? null;

  const nextMutation = useNextQueue();
  const moveMutation = useMoveQueue();
  const completeCurrentMutation = useCompleteAppointment();

  const canOperate = !!departmentId;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Global Queue</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3 w-3" /> Today: {format(new Date(), "MMMM do, yyyy")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Department</p>
            <Select value={departmentId} onValueChange={setSelectedDepartmentId}>
              <SelectTrigger className="w-full sm:w-[240px] rounded-xl h-10">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {(departmentsQuery.data ?? []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="rounded-xl h-10 self-end"
            onClick={() => {
              queueQuery.refetch();
              historyQuery.refetch();
            }}
          >
            <RefreshCw className={(queueQuery.isFetching || historyQuery.isFetching) ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl p-1 bg-muted/50 border border-border/40">
          <TabsTrigger value="live" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Live Queue
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="w-4 h-4 mr-2" />
            Queue History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Today’s Sessions
                </CardTitle>
                <CardDescription>
                  Total: {currentQueue.length} • Waiting: {waitingCount} • Active: {activeItem ? `#${activeItem.position}` : "—"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-3">
                {queueQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : currentQueue.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
                    <p className="text-sm font-bold text-foreground">No active queue items</p>
                    <p className="text-xs text-muted-foreground">Select a department or check back later.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentQueue.map((q) => {
                      const isActive = q.status === "ACTIVE";
                      return (
                        <div
                          key={q.id}
                          className={[
                            "rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all hover:shadow-md",
                            isActive ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-background",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`h-12 w-12 rounded-2xl border grid place-items-center font-bold text-lg ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 text-foreground border-border'}`}>
                              #{q.position}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{q.appointment?.patient?.name || "Patient"}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {q.scheduledAt ? format(new Date(q.scheduledAt), "h:mm a") : "—"}
                              </p>
                              <Badge variant={badgeVariant(q.status)} className="rounded-lg mt-2 text-[10px] px-2 py-0.5 uppercase tracking-wider">{q.status}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl h-9 w-9"
                              onClick={() => moveMutation.mutate({ id: q.id, direction: "UP" })}
                              disabled={!canOperate || moveMutation.isPending || q.status === "DONE"}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl h-9 w-9"
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

            <Card className="rounded-2xl border-border/60 shadow-sm h-fit">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-base">Queue Actions</CardTitle>
                <CardDescription>Control the flow of today&#39;s patients.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Button
                  className="w-full rounded-2xl h-12 font-bold shadow-sm"
                  onClick={() => nextMutation.mutate({ departmentId, date: today })}
                  disabled={!canOperate || nextMutation.isPending}
                >
                  {nextMutation.isPending ? "Calling..." : "Call Next Patient"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full rounded-2xl h-12 font-bold border border-border"
                  onClick={() => activeItem && completeCurrentMutation.mutate(activeItem.appointment?.id || "")}
                  disabled={!canOperate || !activeItem || completeCurrentMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {completeCurrentMutation.isPending ? "Completing..." : "Complete Current"}
                </Button>
                <Separator className="my-4" />
                <div className="bg-muted/30 rounded-2xl p-4 space-y-2 border border-border/40">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Info</p>
                  <p className="text-xs text-foreground font-semibold flex items-center justify-between">
                    Dept: <span>{departmentsQuery.data?.find(d => d.id === departmentId)?.name || "—"}</span>
                  </p>
                  <p className="text-xs text-foreground font-semibold flex items-center justify-between">
                    Date: <span>{format(new Date(), "yyyy-MM-dd")}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Search Patient</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Patient name..." 
                  className="pl-9 rounded-xl h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-48 space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Select Date</p>
              <Input 
                type="date" 
                className="rounded-xl h-10"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
              />
            </div>
          </div>

          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-sm">Queue Records for {historyDate}</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border/40">
                  <tr>
                    <th className="px-6 py-3 font-bold">Pos</th>
                    <th className="px-6 py-3 font-bold">Patient</th>
                    <th className="px-6 py-3 font-bold">Time</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {historyQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-6 py-4 h-12 animate-pulse bg-muted/5"></td></tr>
                    ))
                  ) : historyQueue.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                           <div className="h-10 w-10 rounded-full bg-muted/50 grid place-items-center mb-1">
                              <Search className="h-5 w-5 text-muted-foreground/40" />
                           </div>
                           <p className="text-sm font-bold text-foreground">No records found</p>
                           <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                              We couldn&#39;t find any queue records for {historyDate} matching your search.
                           </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    historyQueue.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-bold text-primary">#{q.position}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold">{q.appointment?.patient?.name || "Patient"}</div>
                           <div className="text-[10px] text-muted-foreground">{q.appointment?.patient?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {q.scheduledAt ? format(new Date(q.scheduledAt), "h:mm a") : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={badgeVariant(q.status)} className="rounded-lg text-[10px]">
                            {q.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default GlobalQueuePage;
