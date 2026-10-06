/** Pure logic behind the Appearance page: colour contrast, presets, dirty state. */

export interface AppearanceValues {
  app_name: string
  app_subtitle: string
  primary_color: string
}

/** Accepts "d8452a", "#D8452A", "#fff" → "#d8452a" / "#fff". */
export function normaliseHex(input: string): string {
  const trimmed = input.trim().toLowerCase()
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

function toRgb(hex: string): [number, number, number] | null {
  const value = normaliseHex(hex).slice(1)
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  if (!/^[0-9a-f]{6}$/.test(full)) return null
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((channel) => {
    const s = channel / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const rgbA = toRgb(a)
  const rgbB = toRgb(b)
  if (!rgbA || !rgbB) return 0

  const lumA = relativeLuminance(rgbA)
  const lumB = relativeLuminance(rgbB)
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Buttons use the brand colour as a fill with white label text. */
const BUTTON_TEXT = '#ffffff'
/** WCAG AA for normal-size text; button labels here are 13px. */
const AA_RATIO = 4.5
/** Below this, white text is genuinely unreadable, not merely weak. */
const FLOOR_RATIO = 3

export interface ColorCheck {
  /** False only when the colour must be refused. */
  ok: boolean
  /** True when it clears the floor but misses AA — usable, with a caveat. */
  warn: boolean
  ratio: number
  reason: string
}

/**
 * A brand colour that fails against white leaves every primary button
 * unreadable — and nothing in the old key-value screen warned about it.
 *
 * Three bands rather than two, deliberately: Archie's own #d8452a measures
 * 4.37:1, just under AA. Refusing it outright would reject the shipped
 * default, and relaxing the threshold to let it pass would be moving the
 * goalposts. So it is allowed and flagged.
 */
export function checkBrandColor(hex: string): ColorCheck {
  if (!toRgb(hex)) {
    return {
      ok: false,
      warn: false,
      ratio: 0,
      reason: 'Not a valid hex colour, e.g. #d8452a',
    }
  }

  const ratio = contrastRatio(hex, BUTTON_TEXT)

  if (ratio < FLOOR_RATIO) {
    return {
      ok: false,
      warn: false,
      ratio,
      reason: `White button text would be unreadable on this colour (${ratio.toFixed(
        1,
      )}:1, needs ${AA_RATIO}:1)`,
    }
  }

  if (ratio < AA_RATIO) {
    return {
      ok: true,
      warn: true,
      ratio,
      reason: `White button text is below the accessibility guideline (${ratio.toFixed(
        1,
      )}:1, ideally ${AA_RATIO}:1). Usable, but a darker shade reads better.`,
    }
  }

  return { ok: true, warn: false, ratio, reason: '' }
}

export interface Preset {
  name: string
  value: string
}

/** Every one of these passes checkBrandColor — verified by test. */
export const PRESETS: Preset[] = [
  { name: 'Archie', value: '#d8452a' },
  { name: 'Ocean', value: '#1d4e89' },
  { name: 'Forest', value: '#1d6b4a' },
  { name: 'Plum', value: '#6b2d6b' },
  { name: 'Slate', value: '#3f4651' },
]

export function isDirty(saved: AppearanceValues, draft: AppearanceValues): boolean {
  // Colours compare case-insensitively: re-picking the same swatch must not
  // arm the Save button.
  return (
    saved.app_name !== draft.app_name ||
    saved.app_subtitle !== draft.app_subtitle ||
    normaliseHex(saved.primary_color) !== normaliseHex(draft.primary_color)
  )
}
