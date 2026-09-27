import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useForgotPassword } from '@/features/auth/queries'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const forgotPassword = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword.mutateAsync(values)
    } finally {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
          Lupa Password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Masukkan email kamu untuk menerima link reset password.
        </p>

        {submitted ? (
          <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 rounded-lg px-4 py-3">
            Jika email terdaftar, link reset akan dikirim ke email kamu.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 text-sm transition-colors"
            >
              {forgotPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Kirim Link Reset
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}
