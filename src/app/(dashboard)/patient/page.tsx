"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import {
  CalendarCheck,
  CalendarClock,
  BookUser,
  ListOrdered,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";
import { useMyAppointments } from "@/lib/hooks/useAppointments";
import Link from "next/link";
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
      <Card className="rounded-2xl border-border/60 shadow-sm h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{title}</p>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              {helper ? (
                <p className="text-xs text-muted-foreground">{helper}</p>
              ) : null}
            </div>

            <div className="h-10 w-10 shrink-0 rounded-2xl border border-border bg-background grid place-items-center">
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
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, idx) => (
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

function PatientOverviewPage() {
  const { user } = useAuth();
  const upcomingQuery = useMyAppointments("upcoming");
  const pastQuery = useMyAppointments("past");

  const upcomingCount = upcomingQuery.data?.length ?? 0;
  const pastCount = pastQuery.data?.length ?? 0;

  const isLoading = upcomingQuery.isPending || pastQuery.isPending;
  const isError = upcomingQuery.isError || pastQuery.isError;

  const nextAppointment = upcomingQuery.data?.[0];
  const nextAppointmentDate = nextAppointment?.scheduledAt 
    ? new Date(nextAppointment.scheduledAt)
    : new Date();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Welcome, {user?.name || "Patient"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your appointments and track your queue status.
          </p>
        </div>
      </motion.div>

      {/* stats summary card */}
      {isLoading ? (
        <LoadingGrid />
      ) : isError ? (
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-destructive">
                Couldn’t load overview data.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          <StatCard
            title="Upcoming Appointments"
            value={upcomingCount}
            icon={CalendarClock}
            helper="Appointments scheduled for the future."
          />
          <StatCard
            title="Past Appointments"
            value={pastCount}
            icon={CalendarCheck}
            helper="Appointments you have completed."
          />
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Appointment Card */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="rounded-2xl border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-24 w-full rounded-xl" />
              ) : nextAppointment ? (
                <div className="rounded-xl border border-border bg-background p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {format(nextAppointmentDate, "EEEE, MMMM do, yyyy 'at' h:mm a")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Department: <span className="font-medium text-foreground">{nextAppointment.department?.name || "Unknown"}</span>
                    </p>
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        {nextAppointment.status}
                      </span>
                    </div>
                  </div>
                  <Button asChild className="rounded-xl w-full md:w-auto">
                    <Link href="/patient/queue">
                      Check Queue <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background p-8 text-center">
                  <p className="text-sm font-semibold text-foreground">No upcoming appointments</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    You don't have any appointments scheduled currently.
                  </p>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/patient/book">Book Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="rounded-2xl border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patient/book" className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl">
                <div className="group rounded-xl border border-border bg-background p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border border-border bg-card group-hover:bg-background grid place-items-center transition-colors">
                      <BookUser className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Book Appointment</p>
                      <p className="text-xs text-muted-foreground">Schedule a new visit</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/patient/queue" className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl">
                <div className="group rounded-xl border border-border bg-background p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border border-border bg-card group-hover:bg-background grid place-items-center transition-colors">
                      <ListOrdered className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Live Queue</p>
                      <p className="text-xs text-muted-foreground">Track your turn today</p>
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PatientOverviewPage;