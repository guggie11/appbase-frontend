import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiSuccess, Profile, Session } from '@/shared/api/types'

// ── Queries ────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Profile>>('/profile')
      return res.data.data
    },
  })
}

export function useSessions() {
  return useQuery({
    queryKey: ['profile', 'sessions'],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Session[]>>('/profile/sessions')
      return res.data.data
    },
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await apiClient.put<ApiSuccess<Profile>>('/profile', payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('avatar', file)
      const res = await apiClient.post<ApiSuccess<Profile>>('/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      current_password: string
      new_password: string
      confirm_password: string
    }) => {
      const res = await apiClient.put<ApiSuccess<null>>('/profile/password', payload)
      return res.data
    },
  })
}

export function useRevokeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/profile/sessions/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', 'sessions'] }),
  })
}

export function useRevokeAllSessions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/profile/sessions')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', 'sessions'] }),
  })
}
