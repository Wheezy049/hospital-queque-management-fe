"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { CalendarCheck, Info, CheckCircle2, Ban } from "lucide-react";
import { api } from "@/lib/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

export default function AppointmentsPage() {
  const [appointmentId, setAppointmentId] = React.useState("");

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.appointments.complete(id),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.appointments.cancel(id),
  });

  const disabled = appointmentId.trim().length < 5;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Admin actions for appointments (complete / cancel). Appointment creation is patient-only in your backend.
        </p>
      </div>

      {/* Admin actions */}
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Manage an appointment by ID
          </CardTitle>
          <CardDescription>
            Paste an appointment ID and complete or cancel it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              className="rounded-xl"
              placeholder="Appointment ID (from queue or DB)"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
            />

            <Button
              className="rounded-xl"
              onClick={() => completeMutation.mutate(appointmentId.trim())}
              disabled={disabled || completeMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {completeMutation.isPending ? "Completing..." : "Complete"}
            </Button>

            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => cancelMutation.mutate(appointmentId.trim())}
              disabled={disabled || cancelMutation.isPending}
            >
              <Ban className="mr-2 h-4 w-4" />
              {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
            </Button>
          </div>

          {(completeMutation.data || cancelMutation.data) ? (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Result</p>
              <p className="text-xs text-muted-foreground mt-1">
                {completeMutation.data?.message ?? cancelMutation.data?.message}
              </p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {completeMutation.data?.status ? (
                  <Badge className="rounded-lg">{completeMutation.data.status}</Badge>
                ) : null}
                {cancelMutation.data?.status ? (
                  <Badge variant="outline" className="rounded-lg">{cancelMutation.data.status}</Badge>
                ) : null}
              </div>
            </div>
          ) : null}

          {(completeMutation.isError || cancelMutation.isError) ? (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-destructive">
                {((completeMutation.error || cancelMutation.error) as Error)?.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ensure you’re logged in as ADMIN and the appointment ID is correct.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Why no create appointment here */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Creating appointments
          </CardTitle>
          <CardDescription>
            Your backend currently blocks admin from creating appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            In your controller: <span className="font-mono">Only patients can book appointments</span>.
          </p>
          <p>
            To generate test data now, create an appointment using a PATIENT token (Postman), then it will appear in Queue.
          </p>
          <p className="text-xs">
            If you want admin to create appointments for patients, add an admin endpoint like
            <span className="font-mono"> POST /appointments/admin-create</span>.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
