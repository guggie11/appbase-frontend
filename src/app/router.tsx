import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { usePermission } from '@/features/auth/usePermission'
import { AppLayout } from '@/shared/ui/AppLayout'

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

function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
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
    path: '/register',
    lazy: async () => {
      const { RegisterPage } = await import('../pages/register')
      return { Component: RegisterPage }
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
    path: '/accept-invitation',
    lazy: async () => {
      const { AcceptInvitationPage } = await import('../pages/accept-invitation')
      return { Component: AcceptInvitationPage }
    },
  },
  {
    path: '/oauth/callback',
    lazy: async () => {
      const { OAuthCallbackPage } = await import('../pages/oauth-callback')
      return { Component: OAuthCallbackPage }
    },
  },
  {
    path: '/oauth/error',
    lazy: async () => {
      const { OAuthErrorPage } = await import('../pages/oauth-error')
      return { Component: OAuthErrorPage }
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
          <WithLayout>
            <DashboardPage />
          </WithLayout>
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
          <WithLayout>
            <PermissionRoute permission="users.read">
              <UsersPage />
            </PermissionRoute>
          </WithLayout>
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
          <WithLayout>
            <PermissionRoute permission="roles.read">
              <RolesPage />
            </PermissionRoute>
          </WithLayout>
        ),
      }
    },
  },
  {
    path: '/menus',
    lazy: async () => {
      const { MenusPage } = await import('../pages/menus')
      return {
        Component: () => (
          <WithLayout>
            <MenusPage />
          </WithLayout>
        ),
      }
    },
  },
  {
    path: '/profile',
    lazy: async () => {
      const { ProfilePage } = await import('../pages/profile')
      return {
        Component: () => (
          <WithLayout>
            <ProfilePage />
          </WithLayout>
        ),
      }
    },
  },
  {
    path: '/audit-logs',
    lazy: async () => {
      const { AuditLogsPage } = await import('../pages/audit-logs')
      return {
        Component: () => (
          <WithLayout>
            <PermissionRoute permission="audit.read">
              <AuditLogsPage />
            </PermissionRoute>
          </WithLayout>
        ),
      }
    },
  },
  {
    path: '/settings',
    lazy: async () => {
      const { SettingsPage } = await import('../pages/settings')
      return {
        Component: () => (
          <WithLayout>
            <PermissionRoute permission="settings.read">
              <SettingsPage />
            </PermissionRoute>
          </WithLayout>
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
