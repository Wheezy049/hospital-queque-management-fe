"use client";
import React from "react";
import { motion, easeOut } from "framer-motion";
import {
  Building2,
  Users,
  ArrowRight,
  Activity,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListDepartments } from "@/lib/hooks/useDepartments";
import { useListDoctors } from "@/lib/hooks/useAuthActions";

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
  colorClass,
  trend
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  trend?: string;
}) {
  return (
    <motion.div variants={item}>
      <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden relative group hover:border-primary/30 transition-all">
        <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 opacity-10 rounded-full ${colorClass} group-hover:scale-110 transition-transform`}></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl ${colorClass} bg-opacity-10 grid place-items-center`}>
              <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              {trend && <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{trend}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SuperAdminOverviewPage() {
  const hospitalId = process.env.NEXT_PUBLIC_HOSPITAL_ID ?? ""
  const departmentsQuery = useListDepartments(hospitalId)
  const doctorsQuery = useListDoctors(hospitalId)
  
  const deptsCount = departmentsQuery.data?.length ?? 0;
  const doctorsCount = doctorsQuery.data?.length ?? 0;

  // const isLoading = departmentsQuery.isLoading || doctorsQuery.isLoading;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Hospital Overview</h1>
        <p className="text-muted-foreground">Manage infrastructure and clinical staff from a single dashboard.</p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Departments"
          value={departmentsQuery.isLoading ? "—" : deptsCount}
          icon={Building2}
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Total Doctors"
          value={doctorsQuery.isLoading ? "—" : doctorsCount}
          icon={Stethoscope}
          colorClass="bg-purple-500"
        />
        <StatCard
          title="System Status"
          value="Online"
          icon={ShieldCheck}
          colorClass="bg-emerald-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm h-full overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-lg">System Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Button asChild variant="outline" className="h-28 flex-col gap-3 rounded-2xl border-dashed hover:border-primary hover:bg-primary/5 transition-all">
                  <a href="/super-admin/departments">
                    <Building2 className="h-7 w-7 text-primary" />
                    <div className="text-center">
                      <p className="font-bold text-sm">Departments</p>
                      <p className="text-[10px] text-muted-foreground">Configure hospital units</p>
                    </div>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-28 flex-col gap-3 rounded-2xl border-dashed hover:border-primary hover:bg-primary/5 transition-all">
                  <a href="/super-admin/doctors">
                    <Users className="h-7 w-7 text-primary" />
                    <div className="text-center">
                      <p className="font-bold text-sm">Manage Doctors</p>
                      <p className="text-[10px] text-muted-foreground">Register and assign staff</p>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm h-full overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-lg">Real-time Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="p-8 text-center space-y-3">
                  <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Monitoring Live Sessions</p>
                    <p className="text-xs text-muted-foreground">All systems are functioning normally.</p>
                  </div>
                  <Button asChild variant="ghost" className="text-primary rounded-xl text-xs">
                    <a href="/super-admin/queque">View Global Queue <ArrowRight className="ml-1 h-3 w-3" /></a>
                  </Button>
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SuperAdminOverviewPage;
