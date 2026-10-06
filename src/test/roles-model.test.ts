import { describe, it, expect } from 'vitest'
import {
  groupPermissions,
  roleKindBadge,
  isRoleLocked,
  summarise,
} from '@/pages/roles/model'
import type { Permission, Role } from '@/shared/api/types'

function perm(over: Partial<Permission> = {}): Permission {
  return {
    id: over.slug ?? 'id',
    name: 'Read Users',
    slug: 'users.read',
    module: 'users',
    action: 'read',
    description: 'View the user list.',
    group: 'Users',
    is_dangerous: false,
    ...over,
  } as Permission
}

function role(over: Partial<Role> = {}): Role {
  return {
    id: 'r1',
    name: 'Custom',
    slug: 'custom',
    description: null,
    is_system: false,
    is_active: true,
    kind: 'custom',
    user_count: 0,
    ...over,
  } as Role
}

describe('grouping', () => {
  it('groups by the group field, not the raw module', () => {
    // "roles" and "permissions" are different modules but one area to an admin.
    const groups = groupPermissions([
      perm({ slug: 'roles.read', module: 'roles', group: 'Roles' }),
      perm({ slug: 'permissions.read', module: 'permissions', group: 'Roles' }),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('Roles')
    expect(groups[0].permissions).toHaveLength(2)
  })

  it('keeps a stable, meaningful group order', () => {
    const groups = groupPermissions([
      perm({ slug: 'settings.read', group: 'Platform' }),
      perm({ slug: 'users.read', group: 'Users' }),
      perm({ slug: 'menu.read', group: 'Navigation' }),
    ])

    expect(groups.map((g) => g.name)).toEqual(['Users', 'Navigation', 'Platform'])
  })

  it('does not drop permissions that have no group yet', () => {
    // Older rows exist until the backfill runs; silently hiding them would
    // make permissions disappear from the matrix.
    const groups = groupPermissions([perm({ slug: 'legacy.thing', group: null })])

    expect(groups.flatMap((g) => g.permissions)).toHaveLength(1)
  })
})

describe('summary', () => {
  it('counts selected against the total', () => {
    const all = [perm({ slug: 'a' }), perm({ slug: 'b' }), perm({ slug: 'c' })]
    expect(summarise(all, new Set(['a', 'c']))).toEqual({ selected: 2, total: 3 })
  })

  it('ignores stale ids that no longer exist', () => {
    const all = [perm({ slug: 'a' })]
    expect(summarise(all, new Set(['a', 'deleted']))).toEqual({ selected: 1, total: 1 })
  })
})

describe('role kind', () => {
  it('labels each kind distinctly', () => {
    expect(roleKindBadge('platform').label).toBe('PLATFORM')
    expect(roleKindBadge('built-in').label).toBe('BUILT-IN')
    expect(roleKindBadge('custom').label).toBe('CUSTOM')
  })

  it('gives each kind its own colour', () => {
    const colours = new Set(
      ['platform', 'built-in', 'custom'].map((k) => roleKindBadge(k).color),
    )
    expect(colours.size).toBe(3)
  })

  it('treats an unknown kind as custom rather than crashing', () => {
    expect(roleKindBadge('weird').label).toBe('CUSTOM')
  })
})

describe('lock', () => {
  it('locks platform roles', () => {
    expect(isRoleLocked(role({ kind: 'platform' }))).toBe(true)
  })

  it('leaves built-in and custom roles editable', () => {
    expect(isRoleLocked(role({ kind: 'built-in' }))).toBe(false)
    expect(isRoleLocked(role({ kind: 'custom' }))).toBe(false)
  })

  it('does not lock on is_system alone', () => {
    // The "user" role is a system role but must stay editable.
    expect(isRoleLocked(role({ kind: 'built-in', is_system: true }))).toBe(false)
  })
})
