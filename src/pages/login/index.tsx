import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLogin } from '@/features/auth/queries'
import { useThemeStore } from '@/shared/config/theme'
import type { ApiErrorBody } from '@/shared/api/types'
import axios from 'axios'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const { appName, appSubtitle, logoUrl, primaryColor } = useThemeStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await login.mutateAsync(values)
      void navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as ApiErrorBody | undefined
        const msg = body?.error?.message ?? 'Login gagal. Coba lagi.'
        setError('root', { message: msg })
      }
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Geist', Helvetica, Arial, sans-serif" }}>
      {/* Left branding panel */}
      <div
        style={{
          flex: '0 0 45%',
          background: primaryColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          color: 'white',
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          {logoUrl ? (
            <img src={logoUrl} alt={appName} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {appName.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {appSubtitle}
            </div>
          </div>
        </div>

        {/* Tagline */}
        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
          Build faster.<br />Ship smarter.
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.7, maxWidth: 380 }}>
          Appbase gives you a production-ready foundation with authentication,
          roles, permissions, and audit logging — all in one template.
        </p>

        {/* Feature bullets */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['Role-based access control', 'Audit logging & monitoring', 'Dynamic menu system', 'User management'].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e9eaea',
          padding: '32px 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: 400,
            background: 'white',
            borderRadius: 16,
            border: '1px solid #dcdddd',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '36px 36px',
          }}
        >
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            {logoUrl ? (
              <img src={logoUrl} alt={appName} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #1b1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d8452a' }} />
              </div>
            )}
            <span style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{appName.toUpperCase()}</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1b1c1e', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Masuk ke {appName}
          </h2>
          <p style={{ fontSize: 13, color: '#6c6e70', marginBottom: 28 }}>
            Selamat datang kembali!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="form-input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 16px',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                border: 'none',
                borderRadius: 12,
                cursor: login.isPending ? 'not-allowed' : 'pointer',
                opacity: login.isPending ? 0.7 : 1,
                transition: 'background 150ms',
                marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!login.isPending) (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-hover)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#d8452a' }}
            >
              {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Masuk
            </button>
          </form>

          {/* Social login separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #E5E7EB' }} />
            <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>or continue with</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #E5E7EB' }} />
          </div>

          {/* Social login buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Google */}
            <button
              type="button"
              onClick={() => { window.location.href = '/api/v1/auth/oauth/google' }}
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                width: '100%',
                cursor: 'pointer',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => { window.location.href = '/api/v1/auth/oauth/microsoft' }}
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                width: '100%',
                cursor: 'pointer',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022"/>
                <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00"/>
                <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF"/>
                <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
              </svg>
              Continue with Microsoft
            </button>

            {/* Telkom SSO */}
            <button
              type="button"
              onClick={() => { window.location.href = '/api/v1/auth/oauth/tgsso' }}
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                width: '100%',
                cursor: 'pointer',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white' }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#CC0000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                T
              </div>
              Continue with Telkom SSO
            </button>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
            <Link
              to="/forgot-password"
              style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}
            >
              Lupa password?
            </Link>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 16 }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
