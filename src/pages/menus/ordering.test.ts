import { describe, it, expect } from 'vitest'
import type { Menu } from '@/shared/api/types'
import { buildDisplayRows, planReorder } from './ordering'

function menu(partial: Partial<Menu> & { id: string }): Menu {
  return {
    label: partial.id,
    icon: null,
    path: null,
    parent_id: null,
    order_index: 0,
    is_active: true,
    roles: [],
    created_at: '',
    updated_at: '',
    children: [],
    ...partial,
  } as Menu
}

// Mirrors the real production data, which contains duplicate order_index
// values (two roots at 1, two at 2, two at 5).
const PRODUCTION_SHAPE: Menu[] = [
  menu({ id: 'profile', order_index: 0 }),
  menu({ id: 'dashboard', order_index: 1 }),
  menu({ id: 'users', order_index: 1, parent_id: 'administration' }),
  menu({ id: 'menus', order_index: 1 }),
  menu({ id: 'roles', order_index: 2 }),
  menu({ id: 'audit', order_index: 2 }),
  menu({ id: 'settings', order_index: 5 }),
  menu({ id: 'administration', order_index: 5 }),
]

describe('buildDisplayRows', () => {
  it('renders each child directly beneath its parent', () => {
    const rows = buildDisplayRows(PRODUCTION_SHAPE)
    const ids = rows.map((r) => r.menu.id)
    expect(ids.indexOf('users')).toBe(ids.indexOf('administration') + 1)
  })

  it('marks depth so children can be indented', () => {
    const rows = buildDisplayRows(PRODUCTION_SHAPE)
    expect(rows.find((r) => r.menu.id === 'users')?.depth).toBe(1)
    expect(rows.find((r) => r.menu.id === 'administration')?.depth).toBe(0)
  })

  it('keeps ties stable instead of dropping rows', () => {
    const rows = buildDisplayRows(PRODUCTION_SHAPE)
    expect(rows).toHaveLength(PRODUCTION_SHAPE.length)
  })
})

describe('planReorder', () => {
  it('returns the complete sibling set in the new order', () => {
    const plan = planReorder(PRODUCTION_SHAPE, 'profile', 'menus')
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.parentId).toBeNull()
    // profile moves from first to the position menus occupied.
    expect(plan.menuIds).toEqual([
      'dashboard',
      'menus',
      'profile',
      'audit',
      'roles',
      'administration',
      'settings',
    ])
  })

  it('resolves duplicate order_index by stable rank, not by raw index', () => {
    // dashboard/menus both store order_index 1. Moving menus above dashboard
    // must still produce a full, correctly ordered set.
    const plan = planReorder(PRODUCTION_SHAPE, 'menus', 'dashboard')
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.menuIds).toEqual([
      'profile',
      'menus',
      'dashboard',
      'audit',
      'roles',
      'administration',
      'settings',
    ])
    expect(new Set(plan.menuIds).size).toBe(plan.menuIds.length)
  })

  it('never reparents: cross-parent drops are rejected', () => {
    const plan = planReorder(PRODUCTION_SHAPE, 'profile', 'users')
    expect(plan.ok).toBe(false)
    if (plan.ok) return
    expect(plan.reason).toBe('cross-parent')
  })

  it('reorders within a child group without touching roots', () => {
    const withTwoChildren = [
      ...PRODUCTION_SHAPE,
      menu({ id: 'settings-child', order_index: 2, parent_id: 'administration' }),
    ]
    const plan = planReorder(withTwoChildren, 'settings-child', 'users')
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.parentId).toBe('administration')
    expect(plan.menuIds).toEqual(['settings-child', 'users'])
  })

  it('is a no-op when dropped on itself', () => {
    const plan = planReorder(PRODUCTION_SHAPE, 'profile', 'profile')
    expect(plan.ok).toBe(false)
    if (plan.ok) return
    expect(plan.reason).toBe('noop')
  })
})
