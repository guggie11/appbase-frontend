import { apiClient } from '@/shared/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess, PaginatedResponse, Role, Permission } from '@/shared/api/types'

export function useRoles(page = 1, per_page = 10) {
  return useQuery({
    queryKey: ['roles', page, per_page],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<Role>>(`/roles?page=${page}&per_page=${per_page}`)
      return res.data
    },
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Role>>(`/roles/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiClient.post<ApiSuccess<Role>>('/roles', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      name?: string
      description?: string
      is_active?: boolean
    }) => {
      const res = await apiClient.put<ApiSuccess<Role>>(`/roles/${id}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/roles/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Permission[]>>(`/roles/${roleId}/permissions`)
      return res.data.data
    },
    enabled: !!roleId,
  })
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ roleId, permission_ids }: { roleId: string; permission_ids: string[] }) => {
      const res = await apiClient.put<ApiSuccess<Permission[]>>(`/roles/${roleId}/permissions`, {
        permission_ids,
      })
      return res.data.data
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['role-permissions', vars.roleId] })
    },
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Permission[]>>('/permissions')
      return res.data.data
    },
  })
}
