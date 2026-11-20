import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { availableEntries } from '@/core/session'
import type { ProgressRecord } from '@/core/types'
import {
  LEVEL_ITEMS,
  LEVEL_KEY,
  SHAPES,
  expand,
  reihen,
  reihenLevel,
  type ReihenData,
} from '@/exercises/rechnen/reihen'
import { getExercise } from '@/exercises/registry'
import type { LearnerContext } from '@/exercises/types'

const defaults = resolveDefaults('DE-BY', 1)
const ctxAt = (level?: number): LearnerContext => ({
  land: 'DE-BY',
  grade: 1,
  settings: { ...defaults, levels: level ? { [LEVEL_KEY]: level } : {} },
})
const RUNS = 40

const solid = (parts: string[]): Map<string, ProgressRecord> =>
  new Map(
    parts.map((p) => [
      `rechnen.reihen:${p}`,
      { profileId: 'p', itemKey: `rechnen.reihen:${p}`, box: 3, correct: 3, wrong: 0, lastSeen: 0 },
    ]),
  )

/** The rule behind a pattern: the element repeats every `unit.length` steps. */
function checkPattern(data: ReihenData, unit: string) {
  const answer = data.tokens[data.gap]!
  expect(data.correctKey).toBe(answer.key)
  // Same letter in the unit → same token, different letter → different token.
  const letters = expand(unit, data.tokens.length)
  for (let i = 0; i < data.tokens.length; i++) {
    for (let j = 0; j < data.tokens.length; j++) {
      expect(data.tokens[i]!.key === data.tokens[j]!.key).toBe(letters[i] === letters[j])
    }
  }
  expect(data.choices).toHaveLength(3)
  expect(new Set(data.choices.map((c) => c.key)).size).toBe(3)
  expect(data.choices.map((c) => c.key)).toContain(data.correctKey)
}

describe('Muster (Level 1–3)', () => {
  it.each(
    Object.entries(LEVEL_ITEMS)
      .filter(([l]) => Number(l) <= 3)
      .flatMap(([, items]) => items),
  )('%s ergibt eine richtige Reihe mit genau einer Lösung', (part) => {
    const rng = createRng(part.length)
    const unit = part.split('-')[1]!
    for (let i = 0; i < RUNS; i++) {
      const { data } = reihen.generate(ctxAt(), {}, `rechnen.reihen:${part}`, rng)
      checkPattern(data, unit)
      if (part.startsWith('1') || part.startsWith('2')) {
        expect(data.tokens.every((t) => t.kind === 'form')).toBe(true)
        expect(data.gap).toBe(data.tokens.length - 1)
      } else {
        expect(data.tokens.every((t) => t.kind === 'bild')).toBe(true)
      }
    }
  })

  it('legt die Lücke ab Level 3 auch in die Mitte', () => {
    const rng = createRng(7)
    const gaps = new Set<boolean>()
    for (let i = 0; i < RUNS; i++) {
      const { data } = reihen.generate(ctxAt(), {}, 'rechnen.reihen:3-AB', rng)
      gaps.add(data.gap === data.tokens.length - 1)
    }
    expect(gaps).toEqual(new Set([true, false]))
  })

  it('gibt jeder Form eine eigene Farbe (auch bei Farbsehschwäche lösbar)', () => {
    expect(new Set(SHAPES.map((s) => s.shape)).size).toBe(SHAPES.length)
    expect(new Set(SHAPES.map((s) => s.color)).size).toBe(SHAPES.length)
  })
})

describe('Zahlenfolgen (Level 4–5)', () => {
  it.each([...LEVEL_ITEMS[4]!, ...LEVEL_ITEMS[5]!])('%s bleibt zwischen 0 und 20', (part) => {
    const rng = createRng(part.length * 3)
    const step = Number(part.slice(part.indexOf('-') + 1))
    for (let i = 0; i < RUNS; i++) {
      const task = reihen.generate(ctxAt(), {}, `rechnen.reihen:${part}`, rng)
      const values = task.data.tokens.map((t) => (t.kind === 'zahl' ? t.value : NaN))
      for (let k = 1; k < values.length; k++) expect(values[k]! - values[k - 1]!).toBe(step)
      expect(values.every((v) => v >= 0 && v <= 20)).toBe(true)
      expect(task.data.correctKey).toBe(`zahl:${values.at(-1)}`)
      expect(new Set(task.data.choices.map((c) => c.key)).size).toBe(3)
    }
  })

  it('erklärt die Regel in der Lösung', () => {
    const task = reihen.generate(ctxAt(), {}, 'rechnen.reihen:4-+2', createRng(1))
    expect(task.solution).toMatch(/^Es geht immer zwei weiter\. Die Lösung ist/)
    const back = reihen.generate(ctxAt(), {}, 'rechnen.reihen:4--1', createRng(1))
    expect(back.solution).toMatch(/^Es geht immer eins zurück\./)
  })
})

describe('Level', () => {
  it('beginnt bei Level 1 und öffnet das nächste bei 80 % sicheren Mustern', () => {
    expect(reihenLevel({}, new Map())).toBe(1)
    expect(reihenLevel({}, solid(['1-AB']))).toBe(2)
    expect(reihenLevel({}, solid(['1-AB', '2-AAB', '2-ABB']))).toBe(2)
    expect(reihenLevel({}, solid(['1-AB', '2-AAB', '2-ABB', '2-ABC']))).toBe(3)
  })

  it('nimmt ein von Hand gesetztes Level', () => {
    expect(reihenLevel({ [LEVEL_KEY]: 4 }, new Map())).toBe(4)
    expect(reihen.items(ctxAt(4), {})).toContain('rechnen.reihen:4-+2')
    expect(reihen.items(ctxAt(), {})).toEqual(['rechnen.reihen:1-AB'])
  })

  it('ist mit den Startwerten von Klasse 1 verfügbar', () => {
    const entries = availableEntries(catalogFor('DE-BY', 1, 'rechnen'), ctxAt(), getExercise)
    expect(entries.map((e) => e.exercise)).toContain('rechnen.reihen')
  })
})
