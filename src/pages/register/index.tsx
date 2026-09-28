import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle } from 'lucide-react'
import { useRegister } from '@/features/auth/queries'
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
        <div
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
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#D94F3D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  A
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  APPBASE
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
