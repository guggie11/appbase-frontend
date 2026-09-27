import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { AuditLog, PaginatedResponse } from '@/shared/api/types'

export interface AuditLogFilters {
  page?: number
  per_page?: number
  module?: string
  action?: string
  date_from?: string
  date_to?: string
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', String(filters.page))
      if (filters.per_page) params.set('per_page', String(filters.per_page))
      if (filters.module) params.set('module', filters.module)
      if (filters.action) params.set('action', filters.action)
      if (filters.date_from) params.set('date_from', filters.date_from)
      if (filters.date_to) params.set('date_to', filters.date_to)
      const res = await apiClient.get<PaginatedResponse<AuditLog>>(
        `/audit-logs?${params.toString()}`,
      )
      return res.data
    },
  })
}
