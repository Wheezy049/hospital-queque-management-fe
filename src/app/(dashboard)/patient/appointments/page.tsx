"use client";
import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { CalendarCheck, CalendarClock, Ban, MapPin, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        onError: (err: any) => toast.error(err.message || "Failed to cancel.")
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

  const appointments = query.data ?? [];

  if (appointments.length === 0) {
    return (
      <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center p-12 bg-muted/20 rounded-2xl border border-border/60 text-center">
        <div className="w-16 h-16 rounded-full bg-background border border-border mb-4 flex items-center justify-center">
          {type === "upcoming" ? (
            <CalendarClock className="h-8 w-8 text-muted-foreground/60" />
          ) : (
            <CalendarCheck className="h-8 w-8 text-muted-foreground/60" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground">No {type} appointments</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {type === "upcoming"
            ? "You don't have any upcoming visits scheduled."
            : "You haven't completed any visits yet."}
        </p>
        {type === "upcoming" && (
          <Button asChild className="mt-6 rounded-xl">
            <a href="/patient/book">Book Now</a>
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 mt-6">
      {appointments.map((apt) => (
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
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
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