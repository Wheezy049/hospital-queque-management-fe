"use client";
import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { 
  CheckCircle2, 
  Ban, 
  Search, 
  FileText, 
  X,
  History,
  Timer,
  Building2
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCancelAppointment, useCompleteAppointment, useListAppointments, useAddNotes } from "@/lib/hooks/useAppointments";
import { format } from "date-fns";
import { toast } from "react-toastify";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

function statusBadgeVariant(status: string) {
  switch (status) {
    case "PENDING": return "default";
    case "WAITING": return "secondary";
    case "DONE": return "outline";
    case "CANCELLED": return "destructive";
    default: return "secondary";
  }
}

function DoctorAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState<{ id: string, notes: string } | null>(null);
  const { user } = useAuth();
  
  const appointmentsQuery = useListAppointments({
    type: activeTab,
    search: search || undefined,
    departmentId: user?.departmentId
  });

  const filteredAppointments = React.useMemo(() => {
    const data = appointmentsQuery.data ?? [];
    const now = new Date();

    return data.filter((apt) => {
      // 1. Client-side Search Filter (in case backend is broad)
      const matchesSearch = !search || 
        apt.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        apt.patient?.email?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Strict Tab Categorization
      const scheduledDate = new Date(apt.scheduledAt);
      const isPastDate = scheduledDate < now;
      const isFinished = apt.status === "DONE" || apt.status === "CANCELLED";

      if (activeTab === "past") {
        return isFinished || isPastDate;
      } else {
        return !isFinished && !isPastDate;
      }
    });
  }, [appointmentsQuery.data, search, activeTab]);

  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();
  const addNotesMutation = useAddNotes();

  const handleComplete = (id: string) => {
    if (confirm("Mark this appointment as complete?")) {
      completeMutation.mutate(id, {
        onSuccess: () => toast.success("Appointment completed."),
        onError: (err: Error) => toast.error(err.message || "Failed to complete.")
      });
    }
  };

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(id, {
        onSuccess: () => toast.success("Appointment cancelled."),
        onError: (err: Error) => toast.error(err.message || "Failed to cancel.")
      });
    }
  };

  const handleSaveNotes = () => {
    if (!editingNotes) return;
    addNotesMutation.mutate({ id: editingNotes.id, notes: editingNotes.notes }, {
      onSuccess: () => {
        toast.success("Notes saved.");
        setEditingNotes(null);
      },
      onError: (err: Error) => toast.error(err.message || "Failed to save notes.")
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Building2 className="h-3 w-3" /> {user?.department?.name || "My Department"}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        <div className="w-full lg:max-w-sm space-y-2">
          <p className="text-xs font-medium text-muted-foreground ml-1">Search Patient</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Name or email..." 
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "past")} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl p-1 bg-muted/50 border border-border/40">
          <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <Timer className="w-4 h-4 mr-2" />
            Upcoming / Active
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <History className="w-4 h-4 mr-2" />
            Past Sessions
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Patient</TableHead>
                  <TableHead className="font-bold">Date & Time</TableHead>
                  <TableHead className="font-bold">Department</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Duration</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentsQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/10"></TableCell>
                    </TableRow>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                       <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="h-12 w-12 rounded-full bg-muted/30 grid place-items-center">
                             <Search className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">No appointments found</p>
                            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                              We couldn&#38;t find any {activeTab === 'upcoming' ? 'upcoming' : 'past'} appointments matching your search.
                            </p>
                          </div>
                          {search && (
                            <Button variant="link" size="sm" onClick={() => setSearch("")}>
                               Clear Search
                            </Button>
                          )}
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((apt) => (
                    <React.Fragment key={apt.id}>
                      <TableRow className="group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{apt.patient?.name || "N/A"}</span>
                            <span className="text-xs text-muted-foreground">{apt.patient?.email || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{format(new Date(apt.scheduledAt), "MMM d, yyyy")}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(apt.scheduledAt), "h:mm a")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-lg font-medium">
                            {apt.department.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(apt.status)} className="rounded-lg">
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{apt.duration} mins</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-lg"
                              onClick={() => setEditingNotes({ id: apt.id, notes: apt.notes || "" })}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            {apt.status !== "DONE" && apt.status !== "CANCELLED" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={() => handleComplete(apt.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleCancel(apt.id)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Sub-row for Description/Notes if editing */}
                      {editingNotes?.id === apt.id && (
                        <TableRow className="bg-primary/5 hover:bg-primary/5">
                          <TableCell colSpan={6} className="p-4">
                            <div className="space-y-4 max-w-2xl">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  Clinical Notes
                                </h4>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 rounded-md"
                                  onClick={() => setEditingNotes(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground italic">
                                  Patient Reason: {apt.description || "No reason provided."}
                                </p>
                                <textarea
                                  className="w-full min-h-[100px] p-3 rounded-xl border border-primary/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  placeholder="Type clinical notes here..."
                                  value={editingNotes.notes}
                                  onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    className="rounded-lg h-8"
                                    disabled={addNotesMutation.isPending}
                                    onClick={handleSaveNotes}
                                  >
                                    {addNotesMutation.isPending ? "Saving..." : "Save Notes"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </Tabs>
    </motion.div>
  );
}

export default DoctorAppointmentsPage;
