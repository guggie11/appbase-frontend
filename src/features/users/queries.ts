import { apiClient } from '@/shared/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess, PaginatedResponse, UserWithRoles, Role } from '@/shared/api/types'

interface UsersFilters {
  page?: number
  per_page?: number
  search?: string
  status?: string
  role_id?: string
}

export function useUsers(filters: UsersFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', String(filters.page))
      if (filters.per_page) params.set('per_page', String(filters.per_page))
      if (filters.search) params.set('search', filters.search)
      if (filters.status) params.set('status', filters.status)
      if (filters.role_id) params.set('role_id', filters.role_id)
      const res = await apiClient.get<PaginatedResponse<UserWithRoles>>(`/users?${params}`)
      return res.data
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; email: string; role_ids: string[] }) => {
      const res = await apiClient.post<ApiSuccess<UserWithRoles>>('/users', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; email?: string }) => {
      const res = await apiClient.put<ApiSuccess<UserWithRoles>>(`/users/${id}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.patch<ApiSuccess<UserWithRoles>>(`/users/${id}/status`, { status })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useAssignRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role_ids }: { id: string; role_ids: string[] }) => {
      const res = await apiClient.post<ApiSuccess<UserWithRoles>>(`/users/${id}/roles`, { role_ids })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useRolesForSelect() {
  return useQuery({
    queryKey: ['roles-select'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<Role>>('/roles?per_page=100')
      return res.data.data
    },
  })
}
