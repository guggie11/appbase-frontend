/** Pure helpers for the user table's selection and bulk actions. */

/** "3 days ago", or "Never" when the user has never signed in. */
export function lastActiveLabel(
  iso: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!iso) return 'Never'

  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return 'Never'

  const seconds = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000))
  if (seconds < 60) return 'Just now'

  const units: [number, string][] = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [2592000, 'month'],
    [31536000, 'year'],
  ]

  // Walk down from the largest unit that still yields a whole number, so a
  // 59-minute gap reads "59 minutes ago" rather than "0 hours ago".
  let label = 'Just now'
  for (const [size, name] of units) {
    const value = Math.floor(seconds / size)
    if (value >= 1) label = `${value} ${name}${value === 1 ? '' : 's'} ago`
  }
  return label
}

export function toggleSelection(selected: Set<string>, id: string): Set<string> {
  // Returns a new set: mutating the one held in state would not re-render.
  const next = new Set(selected)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

export type SelectAllState = 'none' | 'some' | 'all'

/**
 * Header checkbox state for the rows currently on screen.
 *
 * Measured against visible rows only — ids left over from another page must
 * not make the header claim everything here is selected.
 */
export function selectAllState(
  visibleIds: string[],
  selected: Set<string>,
): SelectAllState {
  if (visibleIds.length === 0) return 'none'
  const hits = visibleIds.filter((id) => selected.has(id)).length
  if (hits === 0) return 'none'
  return hits === visibleIds.length ? 'all' : 'some'
}

export function describeBulkAction(action: string, count: number): string {
  const noun = count === 1 ? 'user' : 'users'
  return `${action} ${count} ${noun}`
}
