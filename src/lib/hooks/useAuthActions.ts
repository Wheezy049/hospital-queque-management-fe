"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/endpoints"
import { queryKeys } from "../queryKeys"

export function useCreateDoctor() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.auth.createDoctor,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.doctors,
            })
        },
    })
}
export function useListDoctors(hospitalId?: string) {
    return useQuery({
        queryKey: [queryKeys.doctors, hospitalId],
        queryFn: () => api.auth.listDoctors(hospitalId),
        enabled: true,
    })
}
