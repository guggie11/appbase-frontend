import { useEffect } from 'react'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from './store'
import type { ApiSuccess, TokenData, UserDetail } from '@/shared/api/types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const refreshRes = await apiClient.post<ApiSuccess<{ access_token: string }>>(
          '/auth/refresh',
        )
        const token = refreshRes.data.data.access_token

        const meRes = await apiClient.get<ApiSuccess<UserDetail>>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const me = meRes.data.data
        setAuth(
          { id: me.id, name: me.name, email: me.email, status: me.status },
          token,
        )
      } catch {
        // Not logged in — no-op
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [setAuth, setLoading])

  return <>{children}</>
}

// Re-export TokenData so it can be used elsewhere if needed
export type { TokenData }
