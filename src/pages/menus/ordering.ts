import type { Menu } from '@/shared/api/types'

export interface DisplayRow {
  menu: Menu
  depth: number
}

/** Stable sibling comparison: order_index first, then id to break ties. */
function compareSiblings(a: Menu, b: Menu): number {
  return a.order_index - b.order_index || a.id.localeCompare(b.id)
}

function siblingsOf(menus: Menu[], parentId: string | null): Menu[] {
  return menus
    .filter((m) => (m.parent_id ?? null) === parentId)
    .sort(compareSiblings)
}

/**
 * Flatten the menu list depth-first so each child renders directly beneath
 * its parent. Orphans (parent missing from the list) are kept as roots so no
 * row silently disappears.
 */
export function buildDisplayRows(menus: Menu[]): DisplayRow[] {
  const known = new Set(menus.map((m) => m.id))
  const rows: DisplayRow[] = []
  const visited = new Set<string>()

  const walk = (parentId: string | null, depth: number) => {
    for (const menu of siblingsOf(menus, parentId)) {
      if (visited.has(menu.id)) continue
      visited.add(menu.id)
      rows.push({ menu, depth })
      walk(menu.id, depth + 1)
    }
  }

  walk(null, 0)

  // Orphans: parent_id points at a menu we never received.
  for (const menu of menus) {
    if (visited.has(menu.id)) continue
    if (menu.parent_id && known.has(menu.parent_id)) continue
    visited.add(menu.id)
    rows.push({ menu, depth: 0 })
  }

  return rows
}

export type ReorderPlan =
  | { ok: true; parentId: string | null; menuIds: string[] }
  | { ok: false; reason: 'noop' | 'cross-parent' | 'unknown-menu' }

/**
 * Build the complete ordered sibling set produced by dropping `dragId` onto
 * `dropId`. Reordering is sibling-only — a cross-parent drop is rejected
 * rather than silently reparenting the menu.
 */
export function planReorder(
  menus: Menu[],
  dragId: string,
  dropId: string,
): ReorderPlan {
  if (dragId === dropId) return { ok: false, reason: 'noop' }

  const dragged = menus.find((m) => m.id === dragId)
  const target = menus.find((m) => m.id === dropId)
  if (!dragged || !target) return { ok: false, reason: 'unknown-menu' }

  const parentId = dragged.parent_id ?? null
  if (parentId !== (target.parent_id ?? null)) {
    return { ok: false, reason: 'cross-parent' }
  }

  // Rank by the stable comparator, never by the raw order_index, which may
  // contain duplicates or gaps in stored data.
  const ordered = siblingsOf(menus, parentId).map((m) => m.id)
  const from = ordered.indexOf(dragId)
  const to = ordered.indexOf(dropId)
  if (from === -1 || to === -1) return { ok: false, reason: 'unknown-menu' }

  const menuIds = [...ordered]
  menuIds.splice(from, 1)
  menuIds.splice(to, 0, dragId)

  return { ok: true, parentId, menuIds }
}
