"use client";
import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Lock, 
  Building2, 
  ShieldCheck,
  ArrowRight,
  Search,
  RefreshCw
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useListDepartments } from "@/lib/hooks/useDepartments";
import { useCreateDoctor, useListDoctors } from "@/lib/hooks/useAuthActions";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const container = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.4, ease: easeOut },
  },
};

// const item = {
//   hidden: { opacity: 0, y: 10 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
// };

function SuperAdminDoctorsPage() {
  const hospitalId = process.env.NEXT_PUBLIC_HOSPITAL_ID ?? "";
  const deptsQuery = useListDepartments(hospitalId);
  const doctorsQuery = useListDoctors(hospitalId);
  const createMutation = useCreateDoctor();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
  });

  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.departmentId) {
      toast.error("Please fill in all fields.");
      return;
    }

    createMutation.mutate({
      ...formData,
      hospitalId
    }, {
      onSuccess: () => {
        toast.success("Doctor created successfully!");
        setFormData({ name: "", email: "", password: "", departmentId: "" });
        doctorsQuery.refetch();
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to create doctor.");
      }
    });
  };

  const filteredDoctors = doctorsQuery.data?.filter(doc => 
    doc.name?.toLowerCase().includes(search.toLowerCase()) || 
    doc.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Medical Staff</h1>
          <p className="text-sm text-muted-foreground">Manage your doctors and department assignments.</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => doctorsQuery.refetch()}>
          <RefreshCw className={doctorsQuery.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          Refresh List
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl p-1 bg-muted/50 border border-border/40">
          <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 mr-2" />
            Doctors List
          </TabsTrigger>
          <TabsTrigger value="add" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Doctor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Doctor Name</TableHead>
                  <TableHead className="font-bold">Email Address</TableHead>
                  <TableHead className="font-bold">Department</TableHead>
                  <TableHead className="font-bold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorsQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4} className="h-12 animate-pulse bg-muted/10"></TableCell>
                    </TableRow>
                  ))
                ) : filteredDoctors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                      No doctors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors?.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-bold">{doc.name}</TableCell>
                      <TableCell className="text-muted-foreground">{doc.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-lg">
                          {doc.department?.name || "Unassigned"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="rounded-lg">
                          Authorized
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card className="rounded-2xl border-border/60 shadow-sm max-w-2xl">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-6 rounded-t-2xl">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Register New Doctor
              </CardTitle>
              <CardDescription>Assign credentials and a department to the new doctor.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Dr. Jane Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane.smith@hospital.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Initial Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="department" className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Assign Department
                    </Label>
                    <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                      <SelectTrigger id="department" className="rounded-xl h-12">
                        <SelectValue placeholder="Select a department..." />
                      </SelectTrigger>
                      <SelectContent>
                        {deptsQuery.data?.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-xl h-12 px-8 font-bold">
                    {createMutation.isPending ? "Creating..." : "Create Doctor Profile"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default SuperAdminDoctorsPage;
