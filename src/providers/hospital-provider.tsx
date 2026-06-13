"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api/endpoints";
import type { Hospital } from "@/lib/api/types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth-provider";

type HospitalContextType = {
  activeHospitalId: string;
  setActiveHospitalId: (id: string) => void;
  hospitals: Hospital[];
  isLoading: boolean;
};

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth();
  const [activeHospitalId, setActiveHospitalId] = useState<string>("");

  // Fetch hospitals list
  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => api.hospitals.list(),
    enabled: isAuthed,
  });

  // Initialize active hospital ID
  useEffect(() => {
    if (hospitals.length > 0) {
      const savedId = localStorage.getItem("qure_active_hospital_id");
      if (savedId && hospitals.some((h) => h.id === savedId)) {
        setActiveHospitalId(savedId);
      } else {
        // Fallback to Env or first seeded hospital
        const envId = process.env.NEXT_PUBLIC_HOSPITAL_ID || "";
        if (envId && hospitals.some((h) => h.id === envId)) {
          setActiveHospitalId(envId);
        } else {
          setActiveHospitalId(hospitals[0].id);
        }
      }
    }
  }, [hospitals]);

  const handleSetActiveHospitalId = (id: string) => {
    setActiveHospitalId(id);
    localStorage.setItem("qure_active_hospital_id", id);
  };

  return (
    <HospitalContext.Provider
      value={{
        activeHospitalId,
        setActiveHospitalId: handleSetActiveHospitalId,
        hospitals,
        isLoading,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) throw new Error("useHospital must be used within a HospitalProvider");
  return context;
}
