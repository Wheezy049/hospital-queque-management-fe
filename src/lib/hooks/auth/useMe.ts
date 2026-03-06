"use client"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/endpoints"
import { getToken } from "@/lib/auth/token"
import { queryKeys } from "@/lib/queryKeys"

export function useMe() {
    const token = getToken()

    return useQuery({
        queryKey: queryKeys.me,
        queryFn: api.auth.me,
        enabled: !!token,
        retry: false,
    })
}