import { describe, it, expect, beforeEach } from 'vitest'
import { schema } from '@/pages/menus/components/MenuModal'
import {
  previewLabel,
  describeRequirement,
  setPermissionCatalogue,
} from '@/pages/menus/permissions'

beforeEach(() => {
  // Without a catalogue the validator stays permissive, so the rejection
  // test below would pass for the wrong reason.
  setPermissionCatalogue(['audit.read', 'users.read', 'settings.read'])
})

const base = {
  label: 'Audit',
  icon: 'ShieldCheck',
  path: '/audit',
  parent_id: '',
  is_active: true,
  role_ids: [] as string[],
}

describe('menu permission field', () => {
  it('accepts a known permission slug', () => {
    const r = schema.safeParse({ ...base, required_permission: 'audit.read' })
    expect(r.success).toBe(true)
  })

  it('accepts an empty value — a menu may be public', () => {
    const r = schema.safeParse({ ...base, required_permission: '' })
    expect(r.success).toBe(true)
  })

  it('rejects a slug that does not exist', () => {
    // A typo here silently hides the menu from everyone, with no error
    // anywhere: the gate just never matches.
    const r = schema.safeParse({ ...base, required_permission: 'audit.raed' })
    expect(r.success).toBe(false)
  })

  it('stays permissive when the catalogue failed to load', () => {
    // A failed fetch must not block the admin from saving anything.
    setPermissionCatalogue([])
    const r = schema.safeParse({ ...base, required_permission: 'anything.at.all' })
    expect(r.success).toBe(true)
  })
})

describe('requirement description', () => {
  it('states the permission when one is set', () => {
    expect(describeRequirement('users.read')).toContain('users.read')
  })

  it('says public when nothing is required', () => {
    expect(describeRequirement(null).toLowerCase()).toContain('everyone')
    expect(describeRequirement('').toLowerCase()).toContain('everyone')
  })
})

describe('preview label', () => {
  it('names the role being previewed', () => {
    expect(previewLabel('editor')).toContain('editor')
  })

  it('falls back to the real menu when no role is selected', () => {
    expect(previewLabel(null).toLowerCase()).toContain('your')
  })
})
