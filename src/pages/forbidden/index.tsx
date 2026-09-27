import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center">
          <ShieldOff className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Access Forbidden</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You don't have permission to access this page.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
