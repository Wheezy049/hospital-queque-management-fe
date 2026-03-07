"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../queryKeys"
import { api } from "../api/endpoints"

export function useListAdminQueue({
  departmentId,
  date,
}: {
  departmentId: string
  date?: string
}) {
  return useQuery({
    queryKey: [...queryKeys.queue, departmentId, date],
    queryFn: () => api.queue.listAdmin({ departmentId, date }),
    enabled: !!departmentId,
    refetchInterval: 10000,
  })
}

export function useNextQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.queue.next,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.queue,
      })
    },
  })
}

export function useMoveQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.queue.move,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.queue,
      })
    },
  })
}