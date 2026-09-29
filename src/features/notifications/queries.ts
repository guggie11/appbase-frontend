import { apiClient } from '@/shared/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess, Notification, UnreadCount } from '@/shared/api/types'

interface NotificationsParams {
  unread?: boolean
  page?: number
  per_page?: number
}

export function useNotifications(params: NotificationsParams = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (params.unread !== undefined) p.set('unread', String(params.unread))
      if (params.page) p.set('page', String(params.page))
      if (params.per_page) p.set('per_page', String(params.per_page))
      const res = await apiClient.get<ApiSuccess<Notification[]>>(`/notifications?${p}`)
      return res.data.data
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<UnreadCount>>('/notifications/unread-count')
      return res.data.data
    },
    refetchInterval: 30000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch<ApiSuccess<Notification>>(`/notifications/${id}/read`)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch<ApiSuccess<{ updated: number }>>('/notifications/read-all')
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}
