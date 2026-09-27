import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { useLogout } from '@/features/auth/queries'
import { Loader2, Users, Shield } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  const handleLogout = async () => {
    await logout.mutateAsync()
    void navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/users"
            className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">User Management</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage users and their roles</p>
            </div>
          </Link>

          <Link
            to="/roles"
            className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Roles & Permissions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage roles and permission matrix</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
