import { describe, it, expect } from 'vitest'
import * as Lucide from 'lucide-react'
import { iconExists, schema } from '@/pages/menus/components/MenuModal'

/**
 * A menu icon name that does not resolve silently degrades to a blank circle.
 * Every icon shipped in the default menu must exist in the installed Lucide.
 */
const SEEDED_ICONS = [
  'LayoutDashboard',
  'Menu',
  'Users',
  'User',
  'ShieldCheck',
  'Shield',
  'ClipboardList',
  'Settings',
]

function toPascal(name: string) {
  return name
    .split(/[-_\s]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

describe('menu icon names', () => {
  it.each(SEEDED_ICONS)('%s resolves to a real Lucide icon', (name) => {
    const icon = (Lucide as unknown as Record<string, unknown>)[toPascal(name)]
    expect(icon, `${name} is not exported by lucide-react`).toBeDefined()
  })

  it('rejects the broken lowercase name that shipped in the seed', () => {
    const icon = (Lucide as unknown as Record<string, unknown>)[toPascal('administration')]
    expect(icon, '"administration" is not a Lucide icon — it renders as a blank circle').toBeUndefined()
  })
})

describe('MenuModal icon validation', () => {
  it('accepts real Lucide names', () => {
    expect(iconExists('ShieldCheck')).toBe(true)
    expect(iconExists('Users')).toBe(true)
    // The form must also accept the kebab/snake spellings the sidebar maps.
    expect(iconExists('shield-check')).toBe(true)
  })

  it('rejects a name the sidebar would render as a blank circle', () => {
    expect(iconExists('administration')).toBe(false)
    expect(iconExists('not-a-real-icon')).toBe(false)
  })
})

describe('MenuModal schema', () => {
  const base = { label: 'Administration', path: '/administration', is_active: true, role_ids: [] }

  it('blocks saving a menu whose icon would render blank', () => {
    const result = schema.safeParse({ ...base, icon: 'administration' })
    expect(result.success, 'form accepted an icon the sidebar cannot render').toBe(false)
  })

  it('allows a valid icon through', () => {
    expect(schema.safeParse({ ...base, icon: 'ShieldCheck' }).success).toBe(true)
  })

  it('allows an empty icon', () => {
    expect(schema.safeParse({ ...base, icon: '' }).success).toBe(true)
  })
})
