import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useResetPassword } from '@/features/auth/queries'
import type { ApiErrorBody } from '@/shared/api/types'
import axios from 'axios'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus ada huruf kapital')
      .regex(/[a-z]/, 'Harus ada huruf kecil')
      .regex(/[0-9]/, 'Harus ada angka')
      .regex(/[^A-Za-z0-9]/, 'Harus ada karakter spesial'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPassword = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-red-500 mb-4">Token tidak valid atau sudah kadaluarsa.</p>
          <Link to="/forgot-password" className="text-[var(--color-primary)] hover:underline text-sm">
            Minta link reset baru
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPassword.mutateAsync({ token, password: values.password })
      toast.success('Password berhasil direset!')
      void navigate('/login')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as ApiErrorBody | undefined
        const msg = body?.error?.message ?? 'Gagal mereset password.'
        setError('root', { message: msg })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Reset Password
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Buat password baru untuk akunmu.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={resetPassword.isPending}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white font-medium py-2.5 text-sm transition-colors"
          >
            {resetPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}
