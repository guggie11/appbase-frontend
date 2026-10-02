import { describe, it, expect, vi, beforeEach } from 'vitest'
import { evaluatePermission, toAuthUser } from '@/features/auth/usePermission'

/**
 * The stub this replaces treated every active user as all-powerful, so no
 * permission check in the UI ever denied anything.
 */

const base = { id: '1', name: 'A', email: 'a@b.c', status: 'active' }

describe('evaluatePermission', () => {
  it('grants a permission the user actually holds', () => {
    const user = { ...base, permissions: ['users.read', 'menu.read'] }
    expect(evaluatePermission(user, 'users.read')).toBe(true)
  })

  it('denies a permission the user does not hold', () => {
    const user = { ...base, permissions: ['users.read'] }
    expect(evaluatePermission(user, 'roles.read')).toBe(false)
  })

  it('denies an active user who holds nothing', () => {
    // The exact regression: "active" must not imply "everything".
    const user = { ...base, permissions: [] }
    expect(evaluatePermission(user, 'users.read')).toBe(false)
  })

  it('still lets super admin through', () => {
    const user = { ...base, permissions: [], roles: [{ slug: 'super-admin', name: 'Super Admin' }] }
    expect(evaluatePermission(user, 'anything.at.all')).toBe(true)
  })

  it('denies when there is no user', () => {
    expect(evaluatePermission(null, 'users.read')).toBe(false)
  })

  it('denies when permissions are missing from the payload', () => {
    // An older backend that does not send the field must fail closed, not open.
    expect(evaluatePermission({ ...base }, 'users.read')).toBe(false)
  })
})

describe('toAuthUser', () => {
  const me = {
    id: '1',
    name: 'A',
    email: 'a@b.c',
    status: 'active',
    roles: [{ id: 'r1', name: 'Super Admin', slug: 'super-admin' }],
    permissions: ['users.read'],
  }

  it('keeps roles and permissions when storing the session', () => {
    // AuthProvider used to copy only id/name/email/status, dropping both
    // fields — which left super admin with zero visible admin tabs.
    const stored = toAuthUser(me)
    expect(stored.permissions).toEqual(['users.read'])
    expect(stored.roles?.[0].slug).toBe('super-admin')
  })

  it('produces a value usable by evaluatePermission', () => {
    expect(evaluatePermission(toAuthUser(me), 'anything')).toBe(true)
  })

  it('tolerates a payload without roles or permissions', () => {
    const stored = toAuthUser({ id: '1', name: 'A', email: 'a@b.c', status: 'active' })
    expect(stored.permissions).toEqual([])
    expect(stored.roles).toEqual([])
  })
})
