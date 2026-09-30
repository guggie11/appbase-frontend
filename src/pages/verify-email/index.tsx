import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useVerifyEmail, useResendVerification } from '@/features/auth/queries'
import type { ApiErrorBody } from '@/shared/api/types'
import axios from 'axios'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [resendEmail, setResendEmail] = useState('')
  const [resendDone, setResendDone] = useState(false)

  const verifyEmail = useVerifyEmail()
  const resendVerification = useResendVerification()

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    verifyEmail
      .mutateAsync(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleResend = async () => {
    if (!resendEmail) return
    try {
      await resendVerification.mutateAsync({ email: resendEmail })
      setResendDone(true)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as ApiErrorBody | undefined
        console.error(body?.error?.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#D94F3D]" />
            <p className="text-gray-600">Memverifikasi email…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <p className="text-green-600 text-lg font-medium">
              Email berhasil diverifikasi!
            </p>
            <Link
              to="/login"
              className="inline-block text-[#D94F3D] hover:underline text-sm"
            >
              Masuk ke akun
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-red-500 text-lg font-medium">
              Token tidak valid atau sudah kadaluarsa.
            </p>
            {resendDone ? (
              <p className="text-sm text-green-600">
                Email verifikasi telah dikirim ulang.
              </p>
            ) : (
              <div className="space-y-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Masukkan email kamu"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D94F3D]"
                />
                <button
                  onClick={handleResend}
                  disabled={resendVerification.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#D94F3D] hover:bg-[#C0392B] disabled:opacity-60 text-white font-medium py-2.5 text-sm transition-colors"
                >
                  {resendVerification.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Kirim Ulang Verifikasi
                </button>
              </div>
            )}
            <Link to="/login" className="block text-[#D94F3D] hover:underline text-sm">
              Kembali ke Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
