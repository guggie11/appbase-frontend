import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLogin } from '@/features/auth/queries'
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left branding panel */}
      <div
        style={{
          flex: '0 0 45%',
          background: '#D94F3D',
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
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              APPBASE
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              App Template
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
          background: '#F5F5F5',
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
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
            padding: '40px 36px',
          }}
        >
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#D94F3D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
              A
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>APPBASE</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
            Masuk ke Appbase
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>
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
                background: '#D94F3D',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                border: 'none',
                borderRadius: 6,
                cursor: login.isPending ? 'not-allowed' : 'pointer',
                opacity: login.isPending ? 0.7 : 1,
                transition: 'background 150ms',
                marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!login.isPending) (e.currentTarget as HTMLElement).style.background = '#C0392B' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#D94F3D' }}
            >
              {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Masuk
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
            <Link
              to="/forgot-password"
              style={{ color: '#D94F3D', textDecoration: 'none', fontWeight: 500 }}
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
              style={{ color: '#D94F3D', fontWeight: 500, textDecoration: 'none' }}
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
