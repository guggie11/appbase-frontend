import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRegister } from '@/features/auth/queries'
import { useThemeStore } from '@/shared/config/theme'
import type { ApiErrorBody } from '@/shared/api/types'
import axios from 'axios'

const schema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Min 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[a-z]/, 'Must contain lowercase')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[^A-Za-z0-9]/, 'Must contain symbol'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  // Map 0-5 to 0-4 bars
  if (score === 0) return 0
  if (score <= 2) return 1
  if (score === 3) return 2
  if (score === 4) return 3
  return 4
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981']

export function RegisterPage() {
  const register_mutation = useRegister()
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const { appName, appSubtitle, logoUrl, primaryColor } = useThemeStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const passwordValue = watch('password') ?? ''
  const strengthLevel = getPasswordStrength(passwordValue)

  const onSubmit = async (values: FormValues) => {
    setApiError(null)
    try {
      await register_mutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      setSuccessEmail(values.email)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as ApiErrorBody | undefined
        const msg = body?.error?.message ?? 'Registration failed. Please try again.'
        setApiError(msg)
      }
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
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
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              {appName.charAt(0).toUpperCase()}
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
          Create your account<br />and get started
        </h1>

        {/* Feature bullets */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'Role-based access control',
            'Audit logging & monitoring',
            'Dynamic menu system',
          ].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <CheckCircle size={16} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
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
            maxWidth: 440,
            background: 'white',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
            padding: '40px 36px',
          }}
        >
          {successEmail ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle
                size={56}
                style={{ color: '#10B981', margin: '0 auto 20px' }}
              />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>
                Account Created!
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>
                Check your email at{' '}
                <strong style={{ color: '#1A1A1A' }}>{successEmail}</strong> to verify your account.
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  color: '#D94F3D',
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              {/* Mobile logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                {logoUrl ? (
                  <img src={logoUrl} alt={appName} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }} />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                    }}
                  >
                    {appName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {appName.toUpperCase()}
                </span>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
                Create Account
              </h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{ color: '#D94F3D', fontWeight: 500, textDecoration: 'none' }}
                >
                  Sign in
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    autoComplete="name"
                    className="form-input"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Email Address
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

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="new-password"
                    className="form-input"
                    placeholder="••••••••"
                  />
                  {/* Password strength bars */}
                  {passwordValue.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              background: bar <= strengthLevel ? strengthColors[strengthLevel] : '#E5E7EB',
                              transition: 'background 200ms',
                            }}
                          />
                        ))}
                      </div>
                      {strengthLevel > 0 && (
                        <p style={{ fontSize: 11, color: strengthColors[strengthLevel], fontWeight: 500 }}>
                          {strengthLabels[strengthLevel]}
                        </p>
                      )}
                    </div>
                  )}
                  {errors.password && (
                    <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    className="form-input"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* API error */}
                {apiError && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 6,
                      padding: '10px 14px',
                      fontSize: 13,
                      color: '#DC2626',
                    }}
                  >
                    {apiError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={register_mutation.isPending}
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
                    cursor: register_mutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: register_mutation.isPending ? 0.7 : 1,
                    transition: 'background 150ms',
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => {
                    if (!register_mutation.isPending)
                      (e.currentTarget as HTMLElement).style.background = '#C0392B'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = '#D94F3D'
                  }}
                >
                  {register_mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Account
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
