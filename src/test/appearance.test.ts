import { describe, it, expect } from 'vitest'
import {
  contrastRatio,
  checkBrandColor,
  PRESETS,
  isDirty,
  normaliseHex,
} from '@/pages/appearance/model'

describe('contrast ratio', () => {
  it('is 21 for black on white', () => {
    expect(Math.round(contrastRatio('#000000', '#ffffff'))).toBe(21)
  })

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#d8452a', '#d8452a')).toBeCloseTo(1, 2)
  })

  it('is symmetric', () => {
    const a = contrastRatio('#d8452a', '#ffffff')
    const b = contrastRatio('#ffffff', '#d8452a')
    expect(a).toBeCloseTo(b, 6)
  })
})

describe('brand colour check', () => {
  it('accepts the Archie primary but flags it', () => {
    // #d8452a measures 4.37:1 — just under WCAG AA. It ships as the default,
    // so it must be usable, yet the admin deserves to be told.
    const result = checkBrandColor('#d8452a')
    expect(result.ok).toBe(true)
    expect(result.warn).toBe(true)
    expect(result.ratio).toBeLessThan(4.5)
  })

  it('passes a clearly readable colour with no warning', () => {
    const result = checkBrandColor('#1d4e89')
    expect(result.ok).toBe(true)
    expect(result.warn).toBe(false)
    expect(result.reason).toBe('')
  })

  it('rejects a washed-out yellow that hides white button text', () => {
    const result = checkBrandColor('#ffe600')
    expect(result.ok).toBe(false)
    // The admin needs to know why, not just that it failed.
    expect(result.reason.toLowerCase()).toContain('white')
  })

  it('reports the measured ratio so the number is checkable', () => {
    expect(checkBrandColor('#ffe600').ratio).toBeGreaterThan(1)
    expect(checkBrandColor('#ffe600').ratio).toBeLessThan(4.5)
  })

  it('rejects malformed input instead of silently passing', () => {
    expect(checkBrandColor('nonsense').ok).toBe(false)
    // Shorthand is valid hex, but #fff on white is invisible — still refused.
    expect(checkBrandColor('#fff').ok).toBe(false)
    expect(checkBrandColor('#036').ok).toBe(true)
  })
})

describe('presets', () => {
  it('ships five options', () => {
    expect(PRESETS).toHaveLength(5)
  })

  it('every preset is at least usable', () => {
    // Offering a preset that our own validator refuses would be absurd.
    const bad = PRESETS.filter((p) => !checkBrandColor(p.value).ok)
    expect(bad.map((p) => p.name)).toEqual([])
  })

  it('offers alternatives that fully clear AA', () => {
    // The default is flagged, so the presets must include better options.
    const clean = PRESETS.filter((p) => !checkBrandColor(p.value).warn)
    expect(clean.length).toBeGreaterThanOrEqual(4)
  })

  it('includes the current Archie primary', () => {
    expect(PRESETS.some((p) => p.value.toLowerCase() === '#d8452a')).toBe(true)
  })
})

describe('hex normalisation', () => {
  it('adds the missing hash', () => {
    expect(normaliseHex('d8452a')).toBe('#d8452a')
  })

  it('lowercases for comparison', () => {
    expect(normaliseHex('#D8452A')).toBe('#d8452a')
  })
})

describe('dirty state', () => {
  const saved = { app_name: 'Appbase', app_subtitle: 'Template', primary_color: '#d8452a' }

  it('is clean when nothing changed', () => {
    expect(isDirty(saved, { ...saved })).toBe(false)
  })

  it('notices a changed colour', () => {
    expect(isDirty(saved, { ...saved, primary_color: '#1d4e89' })).toBe(true)
  })

  it('ignores hex casing differences', () => {
    // Re-picking the same colour from a swatch must not arm the Save button.
    expect(isDirty(saved, { ...saved, primary_color: '#D8452A' })).toBe(false)
  })

  it('notices a changed name', () => {
    expect(isDirty(saved, { ...saved, app_name: 'Basesso' })).toBe(true)
  })
})
