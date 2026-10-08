import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiSuccess, Category, CategoryGroup } from '@/shared/api/types'

const KEY = 'categories'

// ── Queries ────────────────────────────────────────────────────────────────

export function useCategoryGroups() {
  return useQuery({
    queryKey: [KEY, 'groups'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<CategoryGroup[]>>(
        '/categories/groups',
      )
      return res.data.data
    },
  })
}

export function useCategoryTree(groupId: string | null) {
  return useQuery({
    // The group is part of the key, otherwise switching groups shows the
    // previous one's items from cache.
    queryKey: [KEY, 'tree', groupId],
    enabled: Boolean(groupId),
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Category[]>>(
        `/categories/groups/${groupId}/tree`,
      )
      return res.data.data
    },
  })
}

/**
 * What other features call: a classification by group code, active only.
 * Exported so a feature never has to know a category id.
 */
export function useCategoryOptions(groupCode: string | null) {
  return useQuery({
    queryKey: [KEY, 'by-group', groupCode],
    enabled: Boolean(groupCode),
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Category[]>>(
        `/categories/by-group/${groupCode}`,
      )
      return res.data.data
    },
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

function useInvalidate() {
  const qc = useQueryClient()
  // Returned, not fired and forgotten: the mutation must stay pending until
  // the refetch lands, or the screen briefly shows stale rows.
  return () => qc.invalidateQueries({ queryKey: [KEY] })
}

export function useCreateGroup() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (payload: {
      name: string
      code?: string
      description?: string | null
    }) => {
      const res = await apiClient.post<ApiSuccess<CategoryGroup>>(
        '/categories/groups',
        payload,
      )
      return res.data.data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateGroup() {
  const invalidate = useInvalidate()
  return useMutation({
    // `code` is absent on purpose: other tables reference it.
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string
      name?: string
      description?: string | null
      is_active?: boolean
    }) => {
      const res = await apiClient.patch<ApiSuccess<CategoryGroup>>(
        `/categories/groups/${id}`,
        payload,
      )
      return res.data.data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteGroup() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/groups/${id}`)
    },
    onSuccess: invalidate,
  })
}

export function useCreateCategory() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (payload: {
      group_id: string
      name: string
      code?: string
      parent_id?: string | null
      description?: string | null
      order_index?: number
    }) => {
      const res = await apiClient.post<ApiSuccess<Category>>(
        '/categories/',
        payload,
      )
      return res.data.data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string
      name?: string
      parent_id?: string | null
      description?: string | null
      order_index?: number
    }) => {
      const res = await apiClient.patch<ApiSuccess<Category>>(
        `/categories/${id}`,
        payload,
      )
      return res.data.data
    },
    onSuccess: invalidate,
  })
}

export function useDeprecateCategory() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.post<ApiSuccess<Category>>(
        `/categories/${id}/deprecate`,
        { reason },
      )
      return res.data.data
    },
    onSuccess: invalidate,
  })
}

export function useRestoreCategory() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiSuccess<Category>>(
        `/categories/${id}/restore`,
        {},
      )
      return res.data.data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`)
    },
    onSuccess: invalidate,
  })
}
