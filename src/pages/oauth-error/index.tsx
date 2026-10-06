import { useSearchParams } from 'react-router-dom'
import { XCircle } from 'lucide-react'

export function OAuthErrorPage() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error') ?? 'An unexpected error occurred during sign-in.'

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e9eaea',
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
          Authentication Error
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>
          {decodeURIComponent(error)}
        </p>
        <a
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 24px',
            background: 'var(--color-primary)',
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
