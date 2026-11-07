import type { Category } from '@/shared/api/types'

export interface CategoryRow {
  category: Category
  depth: number
}

/** order_index first, then name, then id — so the order never wobbles. */
export function sortSiblings(items: Category[]): Category[] {
  return [...items].sort(
    (a, b) =>
      a.order_index - b.order_index ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id),
  )
}

/**
 * Flatten the list depth-first so each child renders beneath its parent.
 *
 * Two things it refuses to do: drop a row whose parent is missing (an admin
 * could never find it again), and loop forever on a cycle the API should
 * have refused but a corrupt payload might still contain.
 */
export function buildCategoryTree(items: Category[]): CategoryRow[] {
  const rows: CategoryRow[] = []
  const visited = new Set<string>()

  const childrenOf = (parentId: string | null) =>
    sortSiblings(items.filter((c) => (c.parent_id ?? null) === parentId))

  const walk = (parentId: string | null, depth: number) => {
    for (const category of childrenOf(parentId)) {
      if (visited.has(category.id)) continue
      visited.add(category.id)
      rows.push({ category, depth })
      walk(category.id, depth + 1)
    }
  }

  walk(null, 0)

  // Anything left is either an orphan or part of a cycle; show it as a root
  // rather than letting it vanish.
  for (const category of sortSiblings(items)) {
    if (visited.has(category.id)) continue
    visited.add(category.id)
    rows.push({ category, depth: 0 })
  }

  return rows
}

export function isDeprecated(category: Category): boolean {
  return category.status === 'deprecated'
}

/**
 * What other features see. Deprecated values are withheld on purpose: a value
 * that should no longer be chosen must not appear in a picker.
 */
export function visibleInPicker(items: Category[]): Category[] {
  return sortSiblings(items.filter((c) => !isDeprecated(c)))
}

export function canDeprecate(category: Category): boolean {
  // Allowed on system rows too — it is how a built-in value is retired,
  // since deleting one is refused.
  return !isDeprecated(category)
}

export function canRestore(category: Category): boolean {
  return isDeprecated(category)
}

/** Why a delete will be refused, in words an admin can act on. */
export function describeUsage(_category: Category, childCount: number): string {
  if (childCount <= 0) return ''
  const noun = childCount === 1 ? 'child' : 'children'
  return (
    `This category has ${childCount} ${noun}, so it cannot be deleted. ` +
    `Deprecate it instead — existing references stay intact.`
  )
}

export function countChildren(items: Category[], id: string): number {
  return items.filter((c) => c.parent_id === id).length
}
