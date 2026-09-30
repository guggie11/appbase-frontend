import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, XCircle } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { apiClient } from '@/shared/api/client'
import type { ApiSuccess, User } from '@/shared/api/types'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      return
    }

    if (!accessToken) {
      setError('No access token received. Please try again.')
      return
    }

    // Call /auth/me with the token to get user data
    apiClient
      .get<ApiSuccess<User>>('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        setAuth(res.data.data, accessToken)
        void navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        setError('Failed to retrieve user information. Please try again.')
      })
  }, [searchParams, setAuth, navigate])

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5F5F5',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
            padding: '40px 36px',
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <XCircle size={52} style={{ color: '#EF4444', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>
            Sign-in Failed
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>
            {error}
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 24px',
              background: '#D94F3D',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              borderRadius: 6,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F5F5',
        fontFamily: 'Inter, sans-serif',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Loader2 size={40} style={{ color: '#D94F3D', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: 15, color: '#6B7280', fontWeight: 500 }}>Completing sign in...</p>
    </div>
  )
}
