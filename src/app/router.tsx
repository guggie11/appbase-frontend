import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { usePermission } from '@/features/auth/usePermission'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PermissionRoute({
  children,
  permission,
}: {
  children: React.ReactNode
  permission: string
}) {
  const allowed = usePermission(permission)
  if (!allowed) return <Navigate to="/forbidden" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import('../pages/login')
      return { Component: LoginPage }
    },
  },
  {
    path: '/forgot-password',
    lazy: async () => {
      const { ForgotPasswordPage } = await import('../pages/forgot-password')
      return { Component: ForgotPasswordPage }
    },
  },
  {
    path: '/reset-password',
    lazy: async () => {
      const { ResetPasswordPage } = await import('../pages/reset-password')
      return { Component: ResetPasswordPage }
    },
  },
  {
    path: '/verify-email',
    lazy: async () => {
      const { VerifyEmailPage } = await import('../pages/verify-email')
      return { Component: VerifyEmailPage }
    },
  },
  {
    path: '/forbidden',
    lazy: async () => {
      const { ForbiddenPage } = await import('../pages/forbidden')
      return { Component: ForbiddenPage }
    },
  },
  {
    path: '/dashboard',
    lazy: async () => {
      const { DashboardPage } = await import('../pages/dashboard')
      return {
        Component: () => (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      }
    },
  },
  {
    path: '/users',
    lazy: async () => {
      const { UsersPage } = await import('../pages/users')
      return {
        Component: () => (
          <ProtectedRoute>
            <PermissionRoute permission="users.read">
              <UsersPage />
            </PermissionRoute>
          </ProtectedRoute>
        ),
      }
    },
  },
  {
    path: '/roles',
    lazy: async () => {
      const { RolesPage } = await import('../pages/roles')
      return {
        Component: () => (
          <ProtectedRoute>
            <PermissionRoute permission="roles.read">
              <RolesPage />
            </PermissionRoute>
          </ProtectedRoute>
        ),
      }
    },
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFoundPage } = await import('../pages/not-found')
      return { Component: NotFoundPage }
    },
  },
])
