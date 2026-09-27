import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiSuccess, DashboardStats, LoginActivity } from '@/shared/api/types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<DashboardStats>>('/dashboard/stats')
      return res.data.data
    },
    refetchInterval: 60_000,
  })
}

export function useLoginActivity() {
  return useQuery({
    queryKey: ['dashboard', 'login-activity'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<LoginActivity[]>>(
        '/dashboard/login-activity',
      )
      return res.data.data
    },
    refetchInterval: 60_000,
  })
}
