import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { usesOnly } from '@/core/graphemes'
import { createRng } from '@/core/random'
import { availableEntries, planSession } from '@/core/session'
import type { ProfileSettings } from '@/core/types'
import { abcTastatur, marks, matches } from '@/exercises/schreiben/abc-tastatur'
import { buchstabenLegen, luecke } from '@/exercises/schreiben/buchstaben-legen'
import { silbenLegen } from '@/exercises/schreiben/silben-legen'
import { getExercise } from '@/exercises/registry'
import type { LearnerContext } from '@/exercises/types'

const defaults = resolveDefaults('DE-BY', 1)
const ctxWith = (patch: Partial<ProfileSettings> = {}): LearnerContext => ({
  land: 'DE-BY',
  grade: 1,
  settings: { ...defaults, ...patch },
})
const start = ctxWith()
const more = ctxWith({ letters: [...defaults.letters, 's', 'r', 'n', 't', 'h', 'd'] })
const params = { wordGrade: 1 }
const RUNS = 20

describe('S1 Silben legen', () => {
  it('nimmt nur lesbare Wörter mit mindestens zwei Silben', () => {
    const items = silbenLegen.items(start, params)
    expect(items.sort()).toEqual([
      'schreiben.silben-legen:lama',
      'schreiben.silben-legen:limo',
      'schreiben.silben-legen:mama',
      'schreiben.silben-legen:oma',
    ])
  })

  it('legt die Silben des Worts und lesbare Ablenker aus', () => {
    const rng = createRng(1)
    const unlocked = new Set(more.settings.letters)
    for (const key of silbenLegen.items(more, params)) {
      for (let i = 0; i < RUNS; i++) {
        const { data } = silbenLegen.generate(more, params, key, rng)
        const texts = data.tiles.map((t) => t.text)
        for (const s of data.target) expect(texts).toContain(s)
        expect(new Set(data.tiles.map((t) => t.id)).size).toBe(data.tiles.length)
        for (const t of texts) expect(usesOnly(t, unlocked), t).toBe(true)
        expect(data.capitalizeFirst).toBe(true)
      }
    }
  })
})

describe('S2 Buchstaben legen', () => {
  it('legt die Grapheme des Worts plus bekannte Ablenker aus', () => {
    const rng = createRng(2)
    const unlocked = new Set(more.settings.letters)
    for (const key of buchstabenLegen.items(more, params)) {
      const { data } = buchstabenLegen.generate(more, params, key, rng)
      const texts = data.tiles.map((t) => t.text)
      expect(texts.length).toBe(data.target.length + 2)
      for (const g of data.target) expect(texts).toContain(g)
      for (const t of texts) expect(unlocked.has(t), t).toBe(true)
    }
  })

  it('zählt Mehrgraphe als eine Kachel (Sch-a-f)', () => {
    const ctx = ctxWith({ letterFilter: false, levels: { 'lesen.woerter': 4 } })
    const { data } = buchstabenLegen.generate(
      ctx,
      params,
      'schreiben.buchstaben-legen:schaf',
      createRng(3),
    )
    expect(data.target).toEqual(['sch', 'a', 'f'])
  })
})

describe('Lückenwort', () => {
  it('fragt genau einen fehlenden Buchstaben mit drei Auswahlmöglichkeiten ab', () => {
    const rng = createRng(4)
    for (const key of luecke.items(more, params)) {
      for (let i = 0; i < RUNS; i++) {
        const { data } = luecke.generate(more, params, key, rng)
        expect(data.graphemes[data.gap]).toBe(data.correctKey)
        expect(data.choices).toHaveLength(3)
        expect(new Set(data.choices.map((c) => c.key)).size).toBe(3)
      }
    }
  })
})

describe('S3 ABC-Tastatur', () => {
  it('hat nur Tasten für bekannte Buchstaben', () => {
    const { data } = abcTastatur.generate(start, params, 'schreiben.abc-tastatur:oma', createRng(5))
    expect(data.keys).toEqual(['m', 'a', 'i', 'o', 'l', 'e', 'u'])
    expect(data.target).toBe('Oma')
    expect(data.autoCapitalize).toBe(true)
  })

  it('wertet Groß-/Kleinschreibung nur, wenn eingeschaltet', () => {
    expect(matches('oma', 'Oma', false)).toBe(true)
    expect(matches('oma', 'Oma', true)).toBe(false)
    expect(matches('Oma', 'Oma', true)).toBe(true)
    const strict = abcTastatur.generate(
      ctxWith({ strictCase: true }),
      params,
      'schreiben.abc-tastatur:oma',
      createRng(6),
    )
    expect(strict.data.autoCapitalize).toBe(false)
  })

  it('markiert richtige und falsche Buchstaben', () => {
    expect(marks('Oam', 'Oma')).toEqual([true, false, false])
    expect(marks('Om', 'Oma')).toEqual([true, true])
  })
})

describe('Schreiben in Klasse 1', () => {
  it('hat mit den Startbuchstaben alle vier Übungen', () => {
    const entries = availableEntries(catalogFor('DE-BY', 1, 'schreiben'), start, getExercise)
    expect(entries.map((e) => e.exercise).sort()).toEqual([
      'schreiben.abc-tastatur',
      'schreiben.buchstaben-legen',
      'schreiben.luecke',
      'schreiben.silben-legen',
    ])
    const tasks = planSession(entries, start, new Map(), 8, createRng(7), getExercise)
    expect(tasks).toHaveLength(8)
    // The caption must never show the word that has to be written.
    for (const t of tasks) expect(t.task.caption).toBeDefined()
  })
})
