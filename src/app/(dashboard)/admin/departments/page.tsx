"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

export default function DepartmentsPage() {
  const qc = useQueryClient();
  const hospitalId = process.env.NEXT_PUBLIC_HOSPITAL_ID ?? "";

  const [name, setName] = React.useState("");

  const departmentsQuery = useQuery({
    queryKey: ["departments", hospitalId],
    queryFn: () => api.departments.list({ hospitalId }),
  });

  const createMutation = useMutation({
    mutationFn: () => api.departments.create({ name: name.trim(), hospitalId }),
    onSuccess: async () => {
      setName("");
      await qc.invalidateQueries({ queryKey: ["departments", hospitalId] });
    },
  });

  const canCreate = !!hospitalId && name.trim().length >= 2 && !createMutation.isPending;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Create departments and view all departments in your hospital.
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

      {!hospitalId ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-destructive">Missing hospitalId</p>
            <p className="text-xs text-muted-foreground mt-1">
              Set <span className="font-mono">NEXT_PUBLIC_HOSPITAL_ID</span> in{" "}
              <span className="font-mono">.env.local</span> to create and load departments.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Create */}
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Create department
          </CardTitle>
          <CardDescription>Example: General Outpatient, Pediatrics, Pharmacy</CardDescription>
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
            onClick={() => createMutation.mutate()}
            disabled={!canCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">All departments</CardTitle>
            <CardDescription>
              {departmentsQuery.isLoading
                ? "Loading..."
                : `${departmentsQuery.data?.length ?? 0} department(s)`}
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-lg">Hospital</Badge>
        </CardHeader>

        <CardContent>
          {departmentsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : departmentsQuery.isError ? (
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="text-sm font-semibold text-destructive">
                {(departmentsQuery.error as Error).message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Confirm your backend route and hospitalId.
              </p>
            </div>
          ) : (departmentsQuery.data?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-border bg-background p-6 text-center">
              <p className="text-sm font-semibold text-foreground">No departments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first department to start booking appointments.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentsQuery.data!.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-semibold">{d.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {d.id}
                      </TableCell>
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
