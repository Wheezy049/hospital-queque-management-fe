"use client";
import React, { useMemo } from "react";
import { motion, easeOut } from "framer-motion";
import { Activity, Clock, Search, RotateCw, CalendarClock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAppointments } from "@/lib/hooks/useAppointments";
import { useListDepartments } from "@/lib/hooks/useDepartments";
import { useListPublicQueue } from "@/lib/hooks/useQueue";
import { format } from "date-fns";
import type { Appointment, QueueItem } from "@/lib/api/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useHospital } from "@/providers/hospital-provider";

const container = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.4, ease: easeOut },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
};

function statusBadgeVariant(status: QueueItem["status"]) {
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

function LiveQueueView({
  appointment,
  onRefresh
}: {
  appointment: Appointment;
  onRefresh: () => void;
}) {
  // Note: the backend queue router takes an ID. 
  // Assuming the `appointment.department` object has an `id` or we can fallback safely.
  // Actually, wait, let's grab it directly if the queue router expects it.
  // Wait, let's look at the payload:
  // "department": { "name": "Cardiology", "hospital": { "name": "..." }} 
  // We need to fetch the department ID to list the queue.
  // We will assume the queue API might accept departmentId or we need to resolve it.
  // BUT the user payload shows: `appointment.queue.position` directly exists inside the appointment.
  // This means we might not even need to poll the queue endpoint if it's already in the appointment!

  // Since we might still want to poll for live updates, we can keep the hook.
  // Let's assume queue.listAdmin still works if we pass department Id somehow, 
  // but if we don't have department ID here, we might need to rely on the appointment's `queue` object for the current user.

  const { activeHospitalId: hospitalId } = useHospital();
  const departmentsQuery = useListDepartments(hospitalId);

  const departmentId = useMemo(() => {
    if (!departmentsQuery.data || !appointment.department?.name) return "";
    return departmentsQuery.data.find(d => d.name === appointment.department?.name)?.id ?? "";
  }, [departmentsQuery.data, appointment.department?.name]);

  const queueDate = appointment.scheduledAt ? appointment.scheduledAt.split("T")[0] : undefined;

  const queueQuery = useListPublicQueue({ departmentId, date: queueDate });

  // Actually, we can just use the appointment itself if the queue query fails or isn't needed:
  const queueData = queueQuery.data ?? [];

  const myQueueItem = useMemo(() => {
    // Check live queue first
    const liveItem = queueData.find((q) => q.appointmentId === appointment.id || q.appointment?.id === appointment.id);
    if (liveItem) return liveItem;
    // Fallback to the snapshot in the appointment payload itself
    if (appointment.queue) {
      return {
        ...appointment.queue,
        appointmentId: appointment.id
      } as QueueItem;
    }
    return null;
  }, [queueData, appointment]);

  const activeItem = useMemo(() => {
    return queueData.find((q) => q.status === "ACTIVE") ?? null;
  }, [queueData]);

  const queueAhead = useMemo(() => {
    if (myQueueItem && myQueueItem.status === "WAITING") {
      return queueData.filter(q => q.status === "WAITING" && q.position < myQueueItem.position).length;
    }
    return 0;
  }, [queueData, myQueueItem]);

  const appointmentDate = appointment.scheduledAt ? new Date(appointment.scheduledAt) : new Date();

  return (
    <div className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-lg flex items-center gap-2 font-semibold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Live Queue Tracker
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time updates for your {appointment.department?.name || "appointment"}.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onRefresh();
            queueQuery.refetch();
          }}
          disabled={queueQuery.isFetching}
          className="rounded-xl h-9"
        >
          <RotateCw className={`h-4 w-4 mr-2 ${queueQuery.isFetching ? 'animate-spin' : ''}`} />
          {queueQuery.isFetching ? 'Syncing...' : 'Refresh Status'}
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Card className="rounded-2xl border-border/60 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-primary"></div>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">

              {/* Left Side: Patient's Queue Position */}
              <div className="p-8 text-center flex flex-col items-center justify-center bg-muted/10">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Your Queue Number
                </p>
                {queueQuery.isLoading ? (
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                ) : myQueueItem ? (
                  <div className="h-32 w-32 rounded-full border-8 border-primary/20 bg-background flex items-center justify-center mb-6 shadow-inner relative">
                    {myQueueItem.status === "ACTIVE" && (
                      <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20"></div>
                    )}
                    <span className="text-5xl font-black text-foreground">#{myQueueItem.position}</span>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-dashed border-border flex items-center justify-center mb-6 bg-muted/30">
                    <Search className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}

                {queueQuery.isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : myQueueItem ? (
                  <div className="space-y-2">
                    <Badge variant={statusBadgeVariant(myQueueItem.status)} className="px-3 py-1 text-sm rounded-lg uppercase tracking-wide">
                      {myQueueItem.status}
                    </Badge>
                    {myQueueItem.status === "WAITING" && (
                      <p className="text-sm font-medium text-foreground mt-2">
                        <span className="text-primary font-bold">{queueAhead}</span> patient{queueAhead !== 1 ? 's' : ''} ahead of you
                      </p>
                    )}
                    {myQueueItem.status === "ACTIVE" && (
                      <p className="text-sm font-medium text-primary mt-2">
                        It&#39;s your turn! Please proceed to the doctor.
                      </p>
                    )}
                    {myQueueItem.status === "DONE" && (
                      <p className="text-sm font-medium text-muted-foreground mt-2">
                        Your appointment is complete.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Not in queue yet</p>
                    <p className="text-xs text-muted-foreground">The admin hasn&#39;t started the queue for your slot.</p>
                  </div>
                )}
              </div>

              {/* Right Side: Appointment & Current Active */}
              <div className="p-8 flex flex-col justify-between bg-background">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Appointment Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{appointment.department?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">Department</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {format(appointmentDate, "h:mm a")}
                          </p>
                          <p className="text-xs text-muted-foreground">Scheduled Time</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/60">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Currently Serving</h3>
                    {queueQuery.isLoading ? (
                      <Skeleton className="h-16 w-full rounded-xl" />
                    ) : activeItem ? (
                      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            #{activeItem.position}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {(activeItem.appointmentId === appointment.id || activeItem.appointment?.id === appointment.id) ? "You (Active)" : "Active Patient"}
                            </p>
                            <p className="text-xs text-primary font-medium">In Progress</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                        <p className="text-sm font-medium text-foreground">No active patient</p>
                        <p className="text-xs text-muted-foreground">Waiting for doctor to call next.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function PatientQueuePage() {
  const appointmentsQuery = useMyAppointments("upcoming");

  // Find an appointment for today
  const todayAppt = useMemo(() => {
    if (!appointmentsQuery.data) return null;
    const todayStr = new Date().toISOString().split("T")[0];
    return appointmentsQuery.data.find(apt => apt.scheduledAt && apt.scheduledAt.split("T")[0] === todayStr);
  }, [appointmentsQuery.data]);

  // Find the next upcoming appointment (future slot)
  const upcomingAppt = useMemo(() => {
    if (!appointmentsQuery.data) return null;
    const todayStr = new Date().toISOString().split("T")[0];
    return appointmentsQuery.data.find(apt => apt.scheduledAt && apt.scheduledAt.split("T")[0] !== todayStr && apt.status === "WAITING");
  }, [appointmentsQuery.data]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Queue Status
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your position in the queue for today&#39;s appointment.
        </p>
      </motion.div>

      {appointmentsQuery.isLoading ? (
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-8 flex flex-col items-center justify-center">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </motion.div>
      ) : appointmentsQuery.isError ? (
        <motion.div variants={item}>
          <Card className="rounded-2xl border-destructive/20 bg-destructive/5 text-center p-8">
            <p className="text-destructive font-semibold">Failed to load appointments.</p>
            <Button variant="outline" size="sm" onClick={() => appointmentsQuery.refetch()} className="mt-4">
              Try Again
            </Button>
          </Card>
        </motion.div>
      ) : todayAppt ? (
        <LiveQueueView
          appointment={todayAppt}
          onRefresh={() => appointmentsQuery.refetch()}
        />
      ) : upcomingAppt ? (
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-primary"></div>
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-6">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CalendarClock className="h-8 w-8 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">Upcoming Appointment</h2>
                  <p className="text-sm text-muted-foreground">
                    You have an upcoming appointment scheduled for this department.
                  </p>
                </div>

                {/* Queue Details Card */}
                <div className="w-full bg-muted/30 rounded-xl p-5 border border-border/60 space-y-4 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Department</span>
                    <span className="text-sm font-bold text-foreground">{upcomingAppt.department?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Scheduled Time</span>
                    <span className="text-sm font-semibold text-foreground">
                      {upcomingAppt.scheduledAt ? format(new Date(upcomingAppt.scheduledAt), "EEEE, MMM do 'at' h:mm a") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Your Queue Number</span>
                    <span className="text-sm font-black text-primary text-base">#{upcomingAppt.queue?.position ?? "N/A"}</span>
                  </div>
                  {upcomingAppt.estimatedWaitTime !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Estimated Wait</span>
                      <span className="text-sm font-semibold text-primary">
                        {upcomingAppt.estimatedWaitTime === 0 ? "0 minutes (First in line)" : `${upcomingAppt.estimatedWaitTime} minutes`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-xs text-primary/80 font-medium text-center">
                  Note: The live queue tracker and navigation will activate on the day of your appointment.
                </div>

                <div className="flex items-center justify-center gap-3 w-full">
                  <Button asChild variant="outline" className="rounded-xl w-full">
                    <Link href="/patient/appointments">View Full Schedule</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm text-center p-12 overflow-hidden relative">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarClock className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Appointments Today</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You don&#39;t have any appointments scheduled for today. Queue status is only available on the day of your visit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="rounded-xl">
                <Link href="/patient/book">Book New Appointment</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/patient/appointments">View Upcoming Schedule</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PatientQueuePage;