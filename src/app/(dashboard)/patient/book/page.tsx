"use client";
import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useCreateAppointment } from "@/lib/hooks/useAppointments";
import { useListDepartments } from "@/lib/hooks/useDepartments";
import { useRouter } from "next/navigation";

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

// Generates time slots from 09:00 to 17:00
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

function PatientBookPage() {
  const router = useRouter();
  const hospitalId = process.env.NEXT_PUBLIC_HOSPITAL_ID ?? "";
  
  const departmentsQuery = useListDepartments(hospitalId);
  const createMutation = useCreateAppointment();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Default to minimum date being today
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !departmentId) {
      toast.error("Please fill in all fields (Department, Date, Time).");
      return;
    }

    createMutation.mutate(
      { departmentId, hospitalId, date, time },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Appointment booked successfully!");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to book appointment.");
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-12"
      >
        <Card className="rounded-2xl border-border/60 shadow-lg text-center p-8 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-2 bg-primary"></div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-8">
            Your appointment has been successfully scheduled. We will send you a reminder before your visit.
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push("/patient/appointments")} className="w-full rounded-xl">
              View My Appointments
            </Button>
            <Button onClick={() => router.push("/patient")} variant="outline" className="w-full rounded-xl">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-2xl mx-auto"
    >
      <motion.div variants={item} className="text-center sm:text-left mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Book an Appointment
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a department, date, and time that works best for you.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 border-b border-border/40 pb-6 rounded-t-2xl">
            <CardTitle className="text-lg flex items-center gap-2">
               <CalendarIcon className="h-5 w-5 text-primary" />
               Appointment Details
            </CardTitle>
            <CardDescription>All fields are required to secure your slot.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="department" className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Select Department
                </Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department" className="w-full rounded-xl h-12 bg-background data-[state=open]:ring-primary">
                    <SelectValue placeholder="Choose a specialist department..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {departmentsQuery.isLoading ? (
                      <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                    ) : departmentsQuery.isError ? (
                      <SelectItem value="error" disabled>Error loading departments</SelectItem>
                    ) : departmentsQuery.data && departmentsQuery.data.length > 0 ? (
                      departmentsQuery.data.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="py-2.5 cursor-pointer">
                          {d.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No departments available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    Preferred Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl h-12 bg-background focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="time" className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Preferred Time
                  </Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="time" className="w-full rounded-xl h-12 bg-background data-[state=open]:ring-primary">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[280px]">
                      {date ? (
                        TIME_SLOTS.map((slot) => {
                          // Simple past time check if selected date is today
                          const isToday = date === today;
                          const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
                          const [h, m] = slot.split(":").map(Number);
                          const slotMinutes = h * 60 + m;
                          const isPassed = isToday && slotMinutes <= currentMinutes;

                          return (
                            <SelectItem 
                              key={slot} 
                              value={slot} 
                              disabled={isPassed}
                              className="py-2.5 cursor-pointer"
                            >
                              {slot} {isPassed && "(Passed)"}
                            </SelectItem>
                          );
                        })
                      ) : (
                         <SelectItem value="none" disabled>Please select a date first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 mt-8 border-t border-border/60 flex items-center justify-end">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || !departmentId || !date || !time}
                  className="rounded-xl h-12 px-8 w-full sm:w-auto text-base font-semibold group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    {createMutation.isPending ? "Booking..." : "Confirm Booking"}
                    {!createMutation.isPending && (
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default PatientBookPage;