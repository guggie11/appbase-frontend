/**
 * Guards the CSS cascade contract.
 *
 * The global reset must not out-rank Tailwind's utility layer. When it does,
 * every padding/margin utility in the app silently collapses to 0 — which is
 * how the Edit User modal lost all of its padding.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(__dirname, '../app/index.css'), 'utf8')

/** Strip comments so they can't satisfy a match. */
const code = css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('global CSS reset', () => {
  it('imports tailwind', () => {
    expect(code).toMatch(/@import\s+["']tailwindcss["']/)
  })

  it('wraps the universal reset in @layer base so utilities still win', () => {
    // Find the universal selector reset block.
    const reset = code.match(/\*\s*,\s*\*::before\s*,\s*\*::after\s*\{[^}]*\}/)
    expect(reset, 'universal reset block should exist').not.toBeNull()

    const index = code.indexOf(reset![0])
    const before = code.slice(0, index)

    // Count layer braces opened before the reset to prove it sits inside one.
    const opens = (before.match(/@layer\s+base\s*\{/g) || []).length
    expect(opens, 'reset must be inside @layer base').toBeGreaterThan(0)
  })

  it('does not zero padding outside a cascade layer', () => {
    // Everything before the first @layer declaration is unlayered and therefore
    // beats Tailwind utilities.
    const firstLayer = code.search(/@layer\s/)
    const unlayered = firstLayer === -1 ? code : code.slice(0, firstLayer)
    const universalReset = /\*\s*,\s*\*::before[^{]*\{[^}]*padding:\s*0/.test(unlayered)
    expect(universalReset, 'unlayered * { padding: 0 } breaks every p-* utility').toBe(false)
  })
})
