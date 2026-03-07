"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../queryKeys"
import { api } from "../api/endpoints"

export function useListDepartments(hospitalId?: string) {
    return useQuery({
        queryKey: [...queryKeys.departments, hospitalId],
        queryFn: () => api.departments.list({ hospitalId }),
        enabled: !!hospitalId,
    })
}

export function useCreateDepartment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.departments.create,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.departments,
            })
        }
    })
}