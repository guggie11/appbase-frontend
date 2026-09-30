import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from './store'
import type { ApiSuccess, TokenData } from '@/shared/api/types'

// POST /auth/login
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiClient.post<ApiSuccess<TokenData>>('/auth/login', credentials)
      return res.data.data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
    },
  })
}

// POST /auth/logout
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout')
    },
    onSuccess: () => {
      clearAuth()
    },
  })
}

// POST /auth/forgot-password
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await apiClient.post<ApiSuccess<null>>('/auth/forgot-password', payload)
      return res.data
    },
  })
}

// POST /auth/reset-password
export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: { token: string; password: string }) => {
      const res = await apiClient.post<ApiSuccess<null>>('/auth/reset-password', payload)
      return res.data
    },
  })
}

// POST /auth/register
export function useRegister() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      apiClient.post('/auth/register', data).then((r) => r.data),
  })
}

// POST /auth/accept-invitation
export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      apiClient.post('/auth/accept-invitation', data).then((r) => r.data),
  })
}

// GET /auth/verify-email?token=TOKEN
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await apiClient.get<ApiSuccess<null>>('/auth/verify-email', {
        params: { token },
      })
      return res.data
    },
  })
}

// POST /auth/resend-verification
export function useResendVerification() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await apiClient.post<ApiSuccess<null>>('/auth/resend-verification', payload)
      return res.data
    },
  })
}
