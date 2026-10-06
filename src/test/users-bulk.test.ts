import { describe, it, expect } from 'vitest'
import {
  lastActiveLabel,
  toggleSelection,
  selectAllState,
  describeBulkAction,
} from '@/pages/users/bulk'

describe('last active', () => {
  const now = new Date('2026-10-06T12:00:00Z')

  it('says Never when the user has not logged in', () => {
    expect(lastActiveLabel(null, now)).toBe('Never')
  })

  it('reads as relative time', () => {
    expect(lastActiveLabel('2026-10-06T11:30:00Z', now)).toMatch(/minute/)
    expect(lastActiveLabel('2026-10-03T12:00:00Z', now)).toMatch(/3 days/)
  })

  it('handles today without saying 0 days', () => {
    expect(lastActiveLabel('2026-10-06T11:59:00Z', now).toLowerCase()).not.toMatch(/0 /)
  })
})

describe('selection', () => {
  it('adds and removes an id', () => {
    const once = toggleSelection(new Set<string>(), 'a')
    expect([...once]).toEqual(['a'])
    expect([...toggleSelection(once, 'a')]).toEqual([])
  })

  it('does not mutate the original set', () => {
    const original = new Set(['a'])
    toggleSelection(original, 'b')
    expect([...original]).toEqual(['a'])
  })
})

describe('select-all state', () => {
  const rows = ['a', 'b', 'c']

  it('is unchecked when nothing is selected', () => {
    expect(selectAllState(rows, new Set())).toBe('none')
  })

  it('is indeterminate on a partial selection', () => {
    expect(selectAllState(rows, new Set(['a']))).toBe('some')
  })

  it('is checked when every visible row is selected', () => {
    expect(selectAllState(rows, new Set(['a', 'b', 'c']))).toBe('all')
  })

  it('ignores selected ids that are not on this page', () => {
    // Selecting a row, paging away, then returning must not make the
    // header checkbox claim everything here is selected.
    expect(selectAllState(rows, new Set(['a', 'b', 'c', 'offpage']))).toBe('all')
    expect(selectAllState(rows, new Set(['offpage']))).toBe('none')
  })
})

describe('bulk action wording', () => {
  it('states the count and the effect', () => {
    const text = describeBulkAction('deactivate', 3)
    expect(text).toContain('3')
    expect(text.toLowerCase()).toContain('deactivate')
  })

  it('uses the singular for one user', () => {
    expect(describeBulkAction('deactivate', 1)).not.toMatch(/users/)
  })
})
