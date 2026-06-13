"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import { Building2, Plus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateDepartment, useListDepartments } from "@/lib/hooks/useDepartments";
import { useHospital } from "@/providers/hospital-provider";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

function SuperAdminDepartmentsPage() {
  const { activeHospitalId: hospitalId } = useHospital();
  const [name, setName] = React.useState("");
  const departmentsQuery = useListDepartments(hospitalId);
  const createMutation = useCreateDepartment();

  const handleCreate = () => {
    if (!name.trim()) return
    createMutation.mutate(
      { name: name.trim(), hospitalId },
      { onSuccess: () => setName("") }
    )
  }

  const canCreate = !!hospitalId && name.trim().length >= 2 && !createMutation.isPending;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Configure hospital departments for queuing.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => departmentsQuery.refetch()}
          disabled={departmentsQuery.isFetching}
        >
          <RefreshCw className={departmentsQuery.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          Refresh
        </Button>
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Create Department
          </CardTitle>
          <CardDescription>Example: Emergency, Radiology, Dental</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl"
          />
          <Button
            className="rounded-xl"
            onClick={handleCreate}
            disabled={!canCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Existing Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentsQuery.data?.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-semibold">{d.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{d.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default SuperAdminDepartmentsPage;
