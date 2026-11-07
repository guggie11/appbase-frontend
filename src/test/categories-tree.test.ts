import { describe, expect, it } from 'vitest'
import {
  buildCategoryTree,
  canDeprecate,
  canRestore,
  describeUsage,
  isDeprecated,
  sortSiblings,
  visibleInPicker,
} from '@/pages/categories/tree'
import type { Category } from '@/shared/api/types'

function cat(partial: Partial<Category> & { id: string }): Category {
  return {
    group_id: 'g1',
    parent_id: null,
    code: partial.id,
    name: partial.id,
    description: null,
    icon: null,
    color: null,
    order_index: 0,
    is_system: false,
    status: 'active',
    deprecated_reason: null,
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-01-01T00:00:00',
    ...partial,
  } as Category
}

describe('buildCategoryTree', () => {
  it('nests children directly beneath their parent', () => {
    const rows = buildCategoryTree([
      cat({ id: 'child', parent_id: 'parent' }),
      cat({ id: 'parent' }),
    ])
    expect(rows.map((r) => r.category.id)).toEqual(['parent', 'child'])
    expect(rows.map((r) => r.depth)).toEqual([0, 1])
  })

  it('nests freely — depth is not capped', () => {
    const rows = buildCategoryTree([
      cat({ id: 'a' }),
      cat({ id: 'b', parent_id: 'a' }),
      cat({ id: 'c', parent_id: 'b' }),
      cat({ id: 'd', parent_id: 'c' }),
      cat({ id: 'e', parent_id: 'd' }),
      cat({ id: 'f', parent_id: 'e' }),
    ])
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('keeps an orphan visible rather than dropping it', () => {
    // A row whose parent is missing must still appear, or an admin would
    // have no way to see — let alone fix — it.
    const rows = buildCategoryTree([cat({ id: 'lost', parent_id: 'gone' })])
    expect(rows.map((r) => r.category.id)).toEqual(['lost'])
    expect(rows[0].depth).toBe(0)
  })

  it('does not hang on a cycle', () => {
    // The API refuses cycles, but a corrupt payload must not freeze the page.
    const rows = buildCategoryTree([
      cat({ id: 'a', parent_id: 'b' }),
      cat({ id: 'b', parent_id: 'a' }),
    ])
    expect(rows).toHaveLength(2)
  })

  it('orders siblings by order_index, then by name', () => {
    const rows = buildCategoryTree([
      cat({ id: 'z', order_index: 1 }),
      cat({ id: 'a', order_index: 2 }),
      cat({ id: 'm', order_index: 1 }),
    ])
    expect(rows.map((r) => r.category.id)).toEqual(['m', 'z', 'a'])
  })
})

describe('deprecation', () => {
  it('marks a deprecated row', () => {
    expect(isDeprecated(cat({ id: 'x', status: 'deprecated' }))).toBe(true)
    expect(isDeprecated(cat({ id: 'x' }))).toBe(false)
  })

  it('hides deprecated rows from a picker but not from management', () => {
    const items = [
      cat({ id: 'keep' }),
      cat({ id: 'drop', status: 'deprecated' }),
    ]
    expect(visibleInPicker(items).map((c) => c.id)).toEqual(['keep'])
    expect(buildCategoryTree(items)).toHaveLength(2)
  })

  it('offers deprecate for active rows and restore for deprecated ones', () => {
    const active = cat({ id: 'a' })
    const dead = cat({ id: 'b', status: 'deprecated' })
    expect(canDeprecate(active)).toBe(true)
    expect(canRestore(active)).toBe(false)
    expect(canDeprecate(dead)).toBe(false)
    expect(canRestore(dead)).toBe(true)
  })

  it('offers deprecate on system rows, which cannot be deleted', () => {
    // Deleting is refused with 403; deprecating is the way to retire one.
    const builtin = cat({ id: 'sys', is_system: true })
    expect(canDeprecate(builtin)).toBe(true)
  })
})

describe('describeUsage', () => {
  it('explains why a category cannot be deleted', () => {
    const msg = describeUsage(cat({ id: 'x' }), 3)
    expect(msg).toContain('3')
    expect(msg.toLowerCase()).toContain('deprecate')
  })

  it('speaks the interface language, not the backend one', () => {
    // A lone Indonesian string in an English UI is an i18n leak.
    const msg = describeUsage(cat({ id: 'x' }), 2)
    expect(msg).not.toMatch(/Kategori|turunan|dihapus/)
  })

  it('agrees in number', () => {
    expect(describeUsage(cat({ id: 'x' }), 1)).toContain('1 child')
    expect(describeUsage(cat({ id: 'x' }), 2)).toContain('2 children')
  })

  it('says nothing when the row has no children', () => {
    expect(describeUsage(cat({ id: 'x' }), 0)).toBe('')
  })
})

describe('sortSiblings', () => {
  it('is stable for equal order_index', () => {
    const a = cat({ id: 'a', name: 'Alpha' })
    const b = cat({ id: 'b', name: 'Beta' })
    expect(sortSiblings([b, a]).map((c) => c.id)).toEqual(['a', 'b'])
  })
})
