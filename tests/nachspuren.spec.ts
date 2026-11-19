import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { availableEntries } from '@/core/session'
import { nachspuren } from '@/exercises/schreiben/nachspuren'
import { getExercise } from '@/exercises/registry'
import type { LearnerContext } from '@/exercises/types'

const defaults = resolveDefaults('DE-BY', 1)
const ctx: LearnerContext = { land: 'DE-BY', grade: 1, settings: defaults }

describe('S4 Nachspuren', () => {
  it('bietet jeden bekannten Buchstaben groß und klein an', () => {
    const items = nachspuren.items(ctx, {})
    expect(items).toHaveLength(defaults.letters.length * 2)
    expect(items).toContain('schreiben.nachspuren:M')
    expect(items).toContain('schreiben.nachspuren:m')
  })

  it('setzt Mehrgraphe aus ihren Buchstaben zusammen', () => {
    const all: LearnerContext = { ...ctx, settings: { ...defaults, letterFilter: false } }
    expect(nachspuren.items(all, {})).toContain('schreiben.nachspuren:Sch')
    const { data } = nachspuren.generate(all, {}, 'schreiben.nachspuren:Sch', createRng(1))
    expect(data.glyph.strokes.length).toBeGreaterThanOrEqual(3)
  })

  it('nennt groß/klein und das Beispielwort in der Anweisung', () => {
    const big = nachspuren.generate(ctx, {}, 'schreiben.nachspuren:M', createRng(1))
    expect(big.instruction).toBe('Spure das große M nach, wie in Maus. Fang beim grünen Punkt an.')
    const small = nachspuren.generate(ctx, {}, 'schreiben.nachspuren:m', createRng(1))
    expect(small.instruction).toContain('kleine m')
  })

  it('übernimmt die Genauigkeit aus den Einstellungen', () => {
    const easy = { ...ctx, settings: { ...defaults, traceTolerance: 1.4 } }
    expect(
      nachspuren.generate(easy, {}, 'schreiben.nachspuren:a', createRng(1)).data.tolerance,
    ).toBe(1.4)
  })

  it('gehört zu den Schreib-Übungen der Klasse 1', () => {
    const entries = availableEntries(catalogFor('DE-BY', 1, 'schreiben'), ctx, getExercise)
    expect(entries.map((e) => e.exercise)).toContain('schreiben.nachspuren')
  })
})
