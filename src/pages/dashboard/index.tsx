import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { useLogout } from '@/features/auth/queries'
import { Loader2 } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  const handleLogout = async () => {
    await logout.mutateAsync()
    void navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Hello, {user?.name ?? 'User'}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-medium px-5 py-2.5 text-sm transition-colors"
        >
          {logout.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Logout
        </button>
      </div>
    </div>
  )
}
