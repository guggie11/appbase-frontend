import { describe, expect, it } from 'vitest'

import {
  ACTION_COLUMNS,
  actionLabel,
  cellState,
  countSelected,
  diffSelection,
  rowOffersChoice,
  rowSelectionState,
  toggleCell,
  toggleRow,
} from '../pages/roles/matrix'
import type { MatrixRow } from '../pages/roles/matrix'

const rows: MatrixRow[] = [
  {
    module: 'users',
    label: 'User Management',
    extra: [],
    cells: {
      read: { available: true, slug: 'users.read', id: '1', name: 'View users', is_dangerous: false, description: 'See the user list.' },
      create: { available: true, slug: 'users.create', id: '2', name: 'Create users', is_dangerous: false, description: 'Add users.' },
      update: { available: true, slug: 'users.update', id: '3', name: 'Edit users', is_dangerous: false, description: 'Change users.' },
      delete: { available: true, slug: 'users.delete', id: '4', name: 'Delete users', is_dangerous: true, description: 'Remove users.' },
      approve: { available: true, slug: 'users.approve', id: '5', name: 'Approve', is_dangerous: false, description: 'Approve requests.' },
    },
  },
  {
    module: 'dashboard',
    label: 'Dashboard',
    extra: [],
    cells: {
      read: { available: true, slug: 'dashboard.read', id: '6', name: 'View dashboard', is_dangerous: false, description: 'See the dashboard.' },
      create: { available: false, slug: null, id: null, name: null, is_dangerous: false, description: null },
      update: { available: false, slug: null, id: null, name: null, is_dangerous: false, description: null },
      delete: { available: false, slug: null, id: null, name: null, is_dangerous: false, description: null },
      approve: { available: false, slug: null, id: null, name: null, is_dangerous: false, description: null },
    },
  },
]

describe('matrix columns', () => {
  it('matches the design order', () => {
    expect(ACTION_COLUMNS).toEqual(['read', 'create', 'update', 'delete', 'approve'])
  })

  it('labels read as VIEW, not READ', () => {
    expect(actionLabel('read')).toBe('View')
    expect(actionLabel('delete')).toBe('Delete')
  })
})

describe('cellState', () => {
  it('reports a granted cell', () => {
    expect(cellState(rows[0], 'read', new Set(['users.read']))).toBe('granted')
  })

  it('reports an available but ungranted cell', () => {
    expect(cellState(rows[0], 'create', new Set(['users.read']))).toBe('empty')
  })

  it('distinguishes "does not apply" from "not ticked"', () => {
    // A blank box would claim the permission exists and was withheld.
    expect(cellState(rows[1], 'delete', new Set())).toBe('unavailable')
  })
})

describe('toggleCell', () => {
  it('adds a slug that was not granted', () => {
    const next = toggleCell(new Set(['users.read']), 'users.create')
    expect(next.has('users.create')).toBe(true)
    expect(next.has('users.read')).toBe(true)
  })

  it('removes a slug that was granted', () => {
    const next = toggleCell(new Set(['users.read', 'users.create']), 'users.read')
    expect(next.has('users.read')).toBe(false)
  })

  it('never mutates the set it was given', () => {
    const before = new Set(['users.read'])
    toggleCell(before, 'users.create')
    expect([...before]).toEqual(['users.read'])
  })
})

describe('toggleRow', () => {
  it('grants every available action in the row', () => {
    const next = toggleRow(rows[0], new Set())
    expect(next.has('users.read')).toBe(true)
    expect(next.has('users.delete')).toBe(true)
    expect(next.size).toBe(5)
  })

  it('clears the row when it is already full', () => {
    const full = new Set(['users.read', 'users.create', 'users.update', 'users.delete', 'users.approve'])
    expect(toggleRow(rows[0], full).size).toBe(0)
  })

  it('ignores cells that do not apply', () => {
    const next = toggleRow(rows[1], new Set())
    expect(next.size).toBe(1)
    expect(next.has('dashboard.read')).toBe(true)
  })
})

describe('rowSelectionState', () => {
  it('is none, some, or all', () => {
    expect(rowSelectionState(rows[0], new Set())).toBe('none')
    expect(rowSelectionState(rows[0], new Set(['users.read']))).toBe('some')
    expect(
      rowSelectionState(rows[0], new Set(['users.read', 'users.create', 'users.update', 'users.delete', 'users.approve'])),
    ).toBe('all')
  })

  it('counts a read-only row as full when its one action is granted', () => {
    expect(rowSelectionState(rows[1], new Set(['dashboard.read']))).toBe('all')
  })
})

describe('rowOffersChoice', () => {
  it('is true when a row has more than one action', () => {
    expect(rowOffersChoice(rows[0])).toBe(true)
  })

  it('is false when a row has a single action', () => {
    // "Select all" on a one-action row duplicates the cell beside it and
    // implies there is more to grant than there is.
    expect(rowOffersChoice(rows[1])).toBe(false)
  })
})

describe('countSelected', () => {
  it('counts only slugs that exist in the matrix', () => {
    // A stale slug from a previous catalogue must not inflate the count.
    const granted = new Set(['users.read', 'ghost.permission'])
    expect(countSelected(rows, granted)).toBe(1)
  })

  it('counts extras that have no column of their own', () => {
    const withExtra: MatrixRow[] = [{ ...rows[0], extra: ['users.assign_role'] }]
    expect(countSelected(withExtra, new Set(['users.read', 'users.assign_role']))).toBe(2)
  })
})

describe('diffSelection', () => {
  it('reports nothing when unchanged', () => {
    const d = diffSelection(new Set(['users.read']), new Set(['users.read']))
    expect(d.added).toEqual([])
    expect(d.removed).toEqual([])
    expect(d.dirty).toBe(false)
  })

  it('reports what was added and removed', () => {
    const d = diffSelection(new Set(['users.read']), new Set(['users.create']))
    expect(d.added).toEqual(['users.create'])
    expect(d.removed).toEqual(['users.read'])
    expect(d.dirty).toBe(true)
  })
})
