import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiSuccess, Setting } from '@/shared/api/types'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Setting[]>>('/settings')
      return res.data.data
    },
  })
}

export function useUpdateSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiClient.put<ApiSuccess<Setting>>(`/settings/${key}`, { value })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
