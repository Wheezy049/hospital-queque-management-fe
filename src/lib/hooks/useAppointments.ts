"use client"
import { api } from "@/lib/api/endpoints"
import { queryKeys } from "@/lib/queryKeys"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"

export function useCreateAppointment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.appointments.create,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.appointments,
            })

            queryClient.invalidateQueries({
                queryKey: queryKeys.queue,
            })
        },
    })
}

export function useCompleteAppointment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.appointments.complete,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.appointments,
            })

            queryClient.invalidateQueries({
                queryKey: queryKeys.queue,
            })
        },
    })
}

export function useCancelAppointment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.appointments.cancel,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.appointments,
            })

            queryClient.invalidateQueries({
                queryKey: queryKeys.queue,
            })
        },
    })
}

export function useMyAppointments(type?: "past" | "upcoming") {
    return useQuery({
        queryKey: [...queryKeys.appointments, type],
        queryFn: () => api.appointments.my({ type }),
    })
}