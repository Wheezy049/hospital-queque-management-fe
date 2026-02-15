"use client";
import React, { useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearToken, getToken } from "@/lib/auth/token";
import { api } from "@/lib/api/endpoints";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PATIENT";
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthed: boolean;
  logout: () => void;
  refetchMe: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = getToken();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: api.auth.me,
    enabled: !!token, // only try if token exists
  });

  const logout = () => {
    clearToken();
    queryClient.removeQueries({ queryKey: ["auth-me"] });
    router.push("/login");
  };

  const value: AuthContextValue = {
    user: (meQuery.data as AuthUser) ?? null,
    isLoading: meQuery.isLoading,
    isAuthed: !!token && !!meQuery.data,
    logout,
    refetchMe: () => meQuery.refetch(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
