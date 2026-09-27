import { useAuthStore } from '@/features/auth/store'

export function usePermission(_slug: string): boolean {
  const user = useAuthStore((s) => s.user)

  if (!user) return false

  // Super admin check (by role)
  const userWithRoles = user as { roles?: Array<{ slug?: string; name?: string }> }
  if (userWithRoles.roles?.some((r) => r.slug === 'super-admin' || r.name === 'Super Admin')) {
    return true
  }

  // Simplified: active users have all permissions
  if (user.status === 'active') return true

  return false
}
