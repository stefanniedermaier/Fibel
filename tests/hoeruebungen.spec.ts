import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { resolveListenWords } from '@/core/hoeren'
import { createRng } from '@/core/random'
import { availableEntries } from '@/core/session'
import { anlautFremd, anlautGleich } from '@/exercises/lesen/anlaute'
import { reimen } from '@/exercises/lesen/reimen'
import { getExercise } from '@/exercises/registry'
import type { LearnerContext } from '@/exercises/types'

const ctx: LearnerContext = { land: 'DE-BY', grade: 1, settings: resolveDefaults('DE-BY', 1) }
const params = { wordGrade: 1 }
const byId = new Map(resolveListenWords('DE-BY', 1).map((w) => [w.id, w]))
const word = (id: string) => byId.get(id)!
const RUNS = 5

describe('E3 Was reimt sich?', () => {
  it('bietet genau einen Reim und zwei Wörter, die sich nicht reimen', () => {
    const rng = createRng(1)
    const items = reimen.items(ctx, params)
    expect(items.length).toBeGreaterThanOrEqual(50)
    for (const key of items) {
      for (let i = 0; i < RUNS; i++) {
        const { data } = reimen.generate(ctx, params, key, rng)
        const target = word(key.split(':')[1]!)
        expect(data.choices).toHaveLength(3)
        expect(new Set(data.choices.map((c) => c.image)).size).toBe(3)
        expect(data.choices.some((c) => c.image === target.image)).toBe(false)
        for (const c of data.choices) {
          const rhymes = word(c.key).reim === target.reim
          expect(rhymes, `${target.text} / ${c.label}`).toBe(c.key === data.correctKey)
        }
      }
    }
  })

  it('liest die Auswahl in Bildschirm-Reihenfolge vor', () => {
    const task = reimen.generate(ctx, params, 'lesen.reimen:hase', createRng(2))
    const names = task.data.choices.map((c) => c.label)
    expect(task.instruction).toBe(
      `Was reimt sich auf Hase? ${names[0]}, ${names[1]} oder ${names[2]}?`,
    )
    expect(task.caption).not.toContain('Hase')
  })
})

describe('E4 Gleiche Anlaute', () => {
  it('A: genau ein Bild fängt wie das Zielwort an', () => {
    const rng = createRng(3)
    for (const key of anlautGleich.items(ctx, params)) {
      const { data } = anlautGleich.generate(ctx, params, key, rng)
      const target = word(key.split(':')[1]!)
      expect(data.choices).toHaveLength(3)
      const same = data.choices.filter((c) => word(c.key).anlaut === target.anlaut)
      expect(same.map((c) => c.key)).toEqual([data.correctKey])
      // The two distractors start differently from each other, too.
      const sounds = data.choices.map((c) => word(c.key).anlaut)
      expect(new Set(sounds).size).toBe(3)
    }
  })

  it('B: drei fangen gleich an, eins passt nicht', () => {
    const rng = createRng(4)
    const items = anlautFremd.items(ctx, params)
    expect(items.length).toBeGreaterThanOrEqual(12)
    expect(items).toContain('lesen.anlaut-fremd:sch')
    for (const key of items) {
      for (let i = 0; i < RUNS; i++) {
        const { data } = anlautFremd.generate(ctx, params, key, rng)
        const sound = key.split(':')[1]
        expect(data.target).toBeUndefined()
        expect(data.choices).toHaveLength(4)
        expect(new Set(data.choices.map((c) => c.image)).size).toBe(4)
        const odd = data.choices.filter((c) => word(c.key).anlaut !== sound)
        expect(odd.map((c) => c.key)).toEqual([data.correctKey])
      }
    }
  })

  it('ordnet nach Klang: Vogel gehört zu f', () => {
    const vogel = anlautGleich.generate(ctx, params, 'lesen.anlaut-gleich:vogel', createRng(5))
    expect(word(vogel.data.correctKey).anlaut).toBe('f')
  })
})

describe('Lesen in Klasse 1', () => {
  it('hat die Hörübungen schon mit den Startbuchstaben', () => {
    const entries = availableEntries(catalogFor('DE-BY', 1, 'lesen'), ctx, getExercise)
    const ids = entries.map((e) => e.exercise)
    expect(ids).toEqual(
      expect.arrayContaining(['lesen.reimen', 'lesen.anlaut-gleich', 'lesen.anlaut-fremd']),
    )
  })
})
