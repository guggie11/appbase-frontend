import { useAuthStore } from '@/features/auth/store'

interface PermissionCarrier {
  permissions?: string[]
  roles?: Array<{ slug?: string; name?: string }>
}

/**
 * Decide a single permission.
 *
 * Pure so it can be tested without a store. Fails closed: a payload without a
 * `permissions` array grants nothing. The previous implementation treated any
 * active user as holding every permission, which made every check in the UI
 * decorative.
 */
export function evaluatePermission(user: unknown, slug: string): boolean {
  if (!user) return false

  const carrier = user as PermissionCarrier

  // Super admin keeps blanket access regardless of explicit grants.
  if (carrier.roles?.some((r) => r.slug === 'super-admin' || r.name === 'Super Admin')) {
    return true
  }

  return Array.isArray(carrier.permissions) && carrier.permissions.includes(slug)
}

export function usePermission(slug: string): boolean {
  const user = useAuthStore((s) => s.user)
  return evaluatePermission(user, slug)
}

/**
 * Shape a /auth/me payload for the auth store.
 *
 * Copying only id/name/email/status silently dropped `roles` and
 * `permissions`, so every permission check saw an empty set — super admin
 * ended up with no admin tabs at all.
 */
export function toAuthUser(me: Record<string, unknown>) {
  return {
    id: me.id as string,
    name: me.name as string,
    email: me.email as string,
    status: me.status as string,
    roles: (me.roles as PermissionCarrier['roles']) ?? [],
    permissions: (me.permissions as string[]) ?? [],
  }
}
