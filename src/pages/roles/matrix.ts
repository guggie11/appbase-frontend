/**
 * The RESOURCE x ACTION permission grid.
 *
 * The matrix shape comes from the backend catalogue, so a module added later
 * appears here without a frontend change.
 */

export const ACTION_COLUMNS = ['read', 'create', 'update', 'delete', 'approve'] as const

export type MatrixAction = (typeof ACTION_COLUMNS)[number]

export interface MatrixCell {
  available: boolean
  slug: string | null
  id: string | null
  name: string | null
  is_dangerous: boolean
  description: string | null
}

export interface MatrixRow {
  module: string
  label: string
  extra: string[]
  cells: Record<MatrixAction, MatrixCell>
}

/** "View" reads better than "Read" in a column header aimed at admins. */
const ACTION_LABELS: Record<MatrixAction, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
}

export function actionLabel(action: MatrixAction): string {
  return ACTION_LABELS[action]
}

/**
 * Three states, deliberately distinct:
 *  - granted     the role holds it
 *  - empty       the role could hold it, but does not
 *  - unavailable the action does not exist for this resource
 *
 * Collapsing the last two into one blank box would claim a permission was
 * withheld when in fact it was never offered.
 */
export type CellState = 'granted' | 'empty' | 'unavailable'

export function cellState(
  row: MatrixRow,
  action: MatrixAction,
  granted: Set<string>,
): CellState {
  const cell = row.cells[action]
  if (!cell || !cell.available || !cell.slug) return 'unavailable'
  return granted.has(cell.slug) ? 'granted' : 'empty'
}

export function toggleCell(granted: Set<string>, slug: string): Set<string> {
  const next = new Set(granted)
  if (next.has(slug)) next.delete(slug)
  else next.add(slug)
  return next
}

/** Slugs a row can actually offer. */
function rowSlugs(row: MatrixRow): string[] {
  return ACTION_COLUMNS.map((action) => row.cells[action])
    .filter((cell) => cell?.available && cell.slug)
    .map((cell) => cell.slug as string)
}

/**
 * Whether a row-level "select all" is meaningful.
 *
 * On a row with a single action the control would duplicate the cell next to
 * it and imply there is more to grant than there is.
 */
export function rowOffersChoice(row: MatrixRow): boolean {
  return rowSlugs(row).length > 1
}

export type RowState = 'none' | 'some' | 'all'

export function rowSelectionState(row: MatrixRow, granted: Set<string>): RowState {
  const slugs = rowSlugs(row)
  if (slugs.length === 0) return 'none'
  const held = slugs.filter((slug) => granted.has(slug)).length
  if (held === 0) return 'none'
  return held === slugs.length ? 'all' : 'some'
}

/** Tick a whole resource at once, or clear it if already complete. */
export function toggleRow(row: MatrixRow, granted: Set<string>): Set<string> {
  const slugs = rowSlugs(row)
  const next = new Set(granted)
  if (rowSelectionState(row, granted) === 'all') {
    slugs.forEach((slug) => next.delete(slug))
  } else {
    slugs.forEach((slug) => next.add(slug))
  }
  return next
}

/**
 * Count only what the matrix can actually show. A slug left over from an
 * older catalogue would otherwise inflate the number against a grid that
 * never displays it.
 */
export function countSelected(rows: MatrixRow[], granted: Set<string>): number {
  const known = new Set<string>()
  rows.forEach((row) => {
    rowSlugs(row).forEach((slug) => known.add(slug))
    row.extra.forEach((slug) => known.add(slug))
  })
  let total = 0
  granted.forEach((slug) => {
    if (known.has(slug)) total += 1
  })
  return total
}

export interface SelectionDiff {
  added: string[]
  removed: string[]
  dirty: boolean
}

export function diffSelection(
  original: Set<string>,
  current: Set<string>,
): SelectionDiff {
  const added = [...current].filter((slug) => !original.has(slug)).sort()
  const removed = [...original].filter((slug) => !current.has(slug)).sort()
  return { added, removed, dirty: added.length > 0 || removed.length > 0 }
}
