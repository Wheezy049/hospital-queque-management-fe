"use client"
import { api } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.auth.register,

        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: queryKeys.me,
            })
        }
    })
}