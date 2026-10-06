import type { Permission, Role } from '@/shared/api/types'

/**
 * Order the permission matrix top to bottom: what an admin touches most
 * often first, platform-level settings last. Groups the backend adds later
 * still appear — they fall to the end rather than vanishing.
 */
const GROUP_ORDER = ['Users', 'Roles', 'Navigation', 'Workspace', 'Platform']

/** Permissions whose group has not been backfilled yet. */
const UNGROUPED = 'Other'

export interface PermissionGroup {
  name: string
  permissions: Permission[]
}

export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const byGroup = new Map<string, Permission[]>()

  for (const p of permissions) {
    // Fall back rather than drop: a permission with no group yet must still
    // be visible, otherwise rights quietly disappear from the matrix.
    const key = p.group?.trim() || UNGROUPED
    const bucket = byGroup.get(key)
    if (bucket) bucket.push(p)
    else byGroup.set(key, [p])
  }

  return [...byGroup.entries()]
    .map(([name, perms]) => ({ name, permissions: perms }))
    .sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.name)
      const bi = GROUP_ORDER.indexOf(b.name)
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
}

/** "8 / 20" — selected counted against what actually exists. */
export function summarise(all: Permission[], selected: Set<string>) {
  return {
    // Count from the catalogue, so ids left over from a deleted permission
    // cannot inflate the figure.
    selected: all.filter((p) => selected.has(p.id)).length,
    total: all.length,
  }
}

export interface KindBadge {
  label: string
  color: string
  background: string
}

export function roleKindBadge(kind: string | undefined): KindBadge {
  switch (kind) {
    case 'platform':
      return { label: 'PLATFORM', color: '#9f2d20', background: '#fbe9e7' }
    case 'built-in':
      return { label: 'BUILT-IN', color: '#1d4e89', background: '#e8f0fb' }
    default:
      return { label: 'CUSTOM', color: '#6c6e70', background: '#efeff0' }
  }
}

/**
 * Platform roles own the system; the backend rejects changes to them with
 * 403. The UI disables the controls so the refusal is never a surprise.
 *
 * Deliberately not keyed on `is_system`: the "user" role is a system role
 * but must stay editable.
 */
export function isRoleLocked(role: Pick<Role, 'kind'>): boolean {
  return role.kind === 'platform'
}
