"use client";
import React, { useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken } from "@/lib/auth/token";
import { useMe } from "@/lib/hooks/auth/useMe";
import { queryKeys } from "@/lib/queryKeys";

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
  const queryClient = useQueryClient();

  const meQuery = useMe()

  const logout = () => {
    clearToken();
    queryClient.setQueryData(queryKeys.me, null);
    queryClient.removeQueries({ queryKey: queryKeys.me });
    router.push("/login");
  };

  const value: AuthContextValue = {
    user: (meQuery.data as AuthUser) ?? null,
    isLoading: meQuery.isLoading,
    isAuthed: !!meQuery.data,
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
