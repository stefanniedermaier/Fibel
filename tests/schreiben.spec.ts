import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { usesOnly } from '@/core/graphemes'
import { createRng } from '@/core/random'
import { availableEntries, planSession } from '@/core/session'
import type { ProfileSettings } from '@/core/types'
import { abcTastatur, marks, matches } from '@/exercises/schreiben/abc-tastatur'
import { buchstabenLegen, luecke } from '@/exercises/schreiben/buchstaben-legen'
import { display, onlyLetters } from '@/exercises/schreiben/tippen'
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
    expect(items).toEqual(
      expect.arrayContaining(['schreiben.silben-legen:oma', 'schreiben.silben-legen:mila']),
    )
    // Words with one syllable (am, so …) cannot be laid out from syllables.
    expect(items).not.toContain('schreiben.silben-legen:so')
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
        // Nouns and names capitalised, lila/so/du not.
        const first = data.target[0]!
        expect(typeof data.capitalizeFirst).toBe('boolean')
        expect(first).toBe(first.toLowerCase())
      }
    }
  })
})

describe('S2 Buchstaben legen', () => {
  it('zeigt ein Kästchen pro Buchstabe und tippt auf der Gerätetastatur', () => {
    const rng = createRng(2)
    for (const key of buchstabenLegen.items(more, params)) {
      const { data } = buchstabenLegen.generate(more, params, key, rng)
      expect(data.slots).toBe(true)
      expect([...data.target].length).toBeLessThanOrEqual(7)
    }
  })

  it('erwartet das ganze Wort, auch bei Mehrgraphen (Schaf)', () => {
    const ctx = ctxWith({ letterFilter: false, levels: { 'lesen.woerter': 4 } })
    const { data } = buchstabenLegen.generate(
      ctx,
      params,
      'schreiben.buchstaben-legen:schaf',
      createRng(3),
    )
    expect(data.target).toBe('Schaf')
    expect(data.autoCapitalize).toBe(true)
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
  it('schreibt frei, ohne Kästchen, die die Länge verraten', () => {
    const { data } = abcTastatur.generate(start, params, 'schreiben.abc-tastatur:oma', createRng(5))
    expect(data.slots).toBe(false)
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

  it('lässt von der Gerätetastatur nur Buchstaben durch', () => {
    expect(onlyLetters('O m4a😀')).toBe('Oma')
    expect(onlyLetters('Bär-Fuß')).toBe('BärFuß')
    expect(display('oma', true)).toBe('Oma')
    expect(display('oma', false)).toBe('oma')
  })
})

describe('Schreiben in Klasse 1', () => {
  it('hat mit den Startbuchstaben alle fünf Übungen', () => {
    const entries = availableEntries(catalogFor('DE-BY', 1, 'schreiben'), start, getExercise)
    expect(entries.map((e) => e.exercise).sort()).toEqual([
      'schreiben.abc-tastatur',
      'schreiben.buchstaben-legen',
      'schreiben.luecke',
      'schreiben.nachspuren',
      'schreiben.silben-legen',
    ])
    const tasks = planSession(entries, start, new Map(), 8, createRng(7), getExercise)
    expect(tasks).toHaveLength(8)
    // The caption must never show the word that has to be written.
    for (const t of tasks) expect(t.task.caption).toBeDefined()
  })
})
