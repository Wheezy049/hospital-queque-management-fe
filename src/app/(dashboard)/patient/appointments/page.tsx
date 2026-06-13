"use client";
import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { CalendarCheck, CalendarClock, Ban, MapPin, Clock, Calendar, Timer, ListOrdered } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAppointments, useCancelAppointment } from "@/lib/hooks/useAppointments";
import { format } from "date-fns";
import type { Appointment } from "@/lib/api/types";
import { toast } from "react-toastify";

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

function formatWaitTime(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs} ${hrs === 1 ? 'hour' : 'hours'}`;
  return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} and ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
}

function statusBadgeVariant(status: Appointment["status"]) {
  switch (status) {
    case "PENDING":
    case "WAITING":
      return "default";
    case "DONE":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

function AppointmentCard({ appointment, isPast }: { appointment: Appointment, isPast: boolean }) {
  const cancelMutation = useCancelAppointment();

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(appointment.id, {
        onSuccess: () => toast.success("Appointment cancelled."),
        onError: (err: Error) => toast.error(err.message || "Failed to cancel.")
      });
    }
  };

  const isCancellable = !isPast && (appointment.status === "PENDING" || appointment.status === "WAITING");
  const appointmentDate = appointment.scheduledAt ? new Date(appointment.scheduledAt) : new Date();

  return (
    <motion.div variants={item}>
      <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden hover:border-primary/30 transition-colors group">
        <div className="flex flex-col sm:flex-row">
          {/* Left section: Date block */}
          <div className="bg-muted/30 sm:w-32 flex flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-border/60 shrink-0">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              {format(appointmentDate, "MMM")}
            </span>
            <span className="text-3xl font-bold text-foreground my-1">
              {format(appointmentDate, "dd")}
            </span>
            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(appointmentDate, "HH:mm")}
            </span>
          </div>

          {/* Right section: Details */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Department: <span className="font-semibold">{appointment.department?.name || "Unknown"}</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(appointmentDate, "EEEE, MMMM do, yyyy")}
                </p>
                {appointment.status !== "DONE" && appointment.status !== "CANCELLED" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {appointment.queue?.position !== undefined && (
                      <p className="text-sm font-medium text-foreground bg-muted px-2 py-0.5 rounded-md border border-border flex items-center gap-1.5">
                        <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
                        Queue Position: #{appointment.queue.position}
                      </p>
                    )}
                    {appointment.estimatedWaitTime !== undefined && (
                      <p className="text-sm font-medium text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-md border border-primary/10 flex items-center gap-1.5">
                        <Timer className="h-3.5 w-3.5" />
                        Estimated wait: {appointment.estimatedWaitTime === 0 ? "0 minutes (First in line)" : formatWaitTime(appointment.estimatedWaitTime)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Badge variant={statusBadgeVariant(appointment.status)} className="rounded-lg shrink-0">
                {appointment.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]" title={appointment.id}>
                ID: {appointment.id}
              </span>

              {isCancellable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3 rounded-lg text-xs"
                >
                  <Ban className="h-3.5 w-3.5 mr-1.5" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function AppointmentsList({ type }: { type: "upcoming" | "past" }) {
  const query = useMyAppointments(type);

  const filteredAppointments = React.useMemo(() => {
    const data = query.data ?? [];
    const now = new Date();

    return data.filter((apt) => {
      const scheduledDate = new Date(apt.scheduledAt);
      const isPastDate = scheduledDate < now;
      const isFinished = apt.status === "DONE" || apt.status === "CANCELLED";

      if (type === "past") {
        return isFinished || isPastDate;
      } else {
        return !isFinished && !isPastDate;
      }
    });
  }, [query.data, type]);

  if (query.isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mt-8 text-center p-8 bg-destructive/5 rounded-2xl border border-destructive/20">
        <p className="text-destructive font-medium">Failed to load appointments.</p>
        <Button variant="outline" size="sm" onClick={() => query.refetch()} className="mt-4 rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  if (filteredAppointments.length === 0) {
    return (
      <motion.div 
        variants={item} 
        initial="hidden" 
        animate="show" 
        className="mt-8 flex flex-col items-center justify-center p-16 bg-muted/30 rounded-3xl border-2 border-dashed border-border/60 text-center space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
      >
        <div className="w-16 h-16 rounded-full bg-background border border-border shadow-sm flex items-center justify-center">
          {type === "upcoming" ? (
            <CalendarClock className="h-8 w-8 text-primary/60" />
          ) : (
            <CalendarCheck className="h-8 w-8 text-muted-foreground/60" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {type === "upcoming" ? "No upcoming appointments" : "No past visits found"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto">
            {type === "upcoming"
              ? "You don't have any upcoming visits scheduled at the moment."
              : "Your medical history for this hospital is currently empty."}
          </p>
        </div>
        {type === "upcoming" && (
          <Button asChild className="mt-2 rounded-xl shadow-md px-6">
            <a href="/patient/book">Book an Appointment</a>
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 mt-6">
      {filteredAppointments.map((apt) => (
        <AppointmentCard key={apt.id} appointment={apt} isPast={type === "past"} />
      ))}
    </motion.div>
  );
}

function PatientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            My Appointments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your upcoming schedule or check your past visits.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl shrink-0">
          <a href="/patient/book">New Appointment</a>
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "past")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl p-1 bg-muted/50 border border-border/40">
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
              <CalendarClock className="w-4 h-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
              <CalendarCheck className="w-4 h-4 mr-2" />
              Past Visits
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="upcoming" className="m-0 border-none p-0 outline-none">
              <AppointmentsList type="upcoming" />
            </TabsContent>

            <TabsContent value="past" className="m-0 border-none p-0 outline-none">
              <AppointmentsList type="past" />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

export default PatientAppointmentsPage;