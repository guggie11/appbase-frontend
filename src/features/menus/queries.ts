import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiSuccess, Menu, MenuTree } from '@/shared/api/types'

// ── Queries ────────────────────────────────────────────────────────────────

export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Menu[]>>('/menus')
      return res.data.data
    },
  })
}

export function useMyMenu() {
  return useQuery({
    queryKey: ['menus', 'my-menu'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<MenuTree[]>>('/menus/my-menu')
      return res.data.data
    },
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

interface MenuPayload {
  label?: string
  icon?: string | null
  path?: string | null
  parent_id?: string | null
  order_index?: number
  is_active?: boolean
  role_ids?: string[]
}

export function useCreateMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: MenuPayload) => {
      const res = await apiClient.post<ApiSuccess<Menu>>('/menus', payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function useUpdateMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: MenuPayload & { id: string }) => {
      const res = await apiClient.put<ApiSuccess<Menu>>(`/menus/${id}`, payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function useDeleteMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/menus/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function useUpdateMenuRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role_ids }: { id: string; role_ids: string[] }) => {
      const res = await apiClient.put<ApiSuccess<Menu>>(`/menus/${id}/roles`, {
        role_ids,
      })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function useUpdateMenuOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, order_index }: { id: string; order_index: number }) => {
      const res = await apiClient.put<ApiSuccess<Menu>>(`/menus/${id}/order`, {
        order_index,
      })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}
