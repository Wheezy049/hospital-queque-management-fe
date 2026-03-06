"use client"
import { api } from "@/lib/api/endpoints";
import { setToken } from "@/lib/auth/token";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.auth.login,

        onSuccess: (data) => {
            setToken(data.token)

            queryClient.refetchQueries({
                queryKey: queryKeys.me,
            })
        }
    })
}