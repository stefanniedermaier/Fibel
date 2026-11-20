import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { glyphTemplate, judge, recognize } from '@/core/recognizer'
import { availableEntries } from '@/core/session'
import { strokePoints } from '@/core/strokes'
import type { ProfileSettings } from '@/core/types'
import { getExercise } from '@/exercises/registry'
import { MAX_LETTERS, kaestchen, knownChars } from '@/exercises/schreiben/kaestchen'
import type { LearnerContext } from '@/exercises/types'

const defaults = resolveDefaults('DE-BY', 1)
const ctxWith = (patch: Partial<ProfileSettings>): LearnerContext => ({
  land: 'DE-BY',
  grade: 1,
  settings: { ...defaults, ...patch },
})
const on = ctxWith({ kaestchen: true })
const params = { wordGrade: 1 }

describe('E6 Wort in Kästchen schreiben', () => {
  it('ist ohne Freischaltung im Elternbereich aus', () => {
    expect(defaults.kaestchen).toBe(false)
    expect(kaestchen.items(ctxWith({}), params)).toEqual([])
    const entries = availableEntries(catalogFor('DE-BY', 1, 'schreiben'), ctxWith({}), getExercise)
    expect(entries.map((e) => e.exercise)).not.toContain('schreiben.kaestchen')
  })

  it('nimmt eingeschaltet kurze Wörter aus bekannten Buchstaben', () => {
    const items = kaestchen.items(on, params)
    expect(items).toContain('schreiben.kaestchen:oma')
    const known = new Set(knownChars(on))
    for (const key of items) {
      const { data } = kaestchen.generate(on, params, key, createRng(1))
      expect(data.chars.length).toBeLessThanOrEqual(MAX_LETTERS)
      for (const c of data.chars) expect(known.has(c.toLowerCase()), c).toBe(true)
    }
  })

  it('vergleicht den ersten Buchstaben von Nomen mit Großbuchstaben, den Rest mit kleinen', () => {
    const { data } = kaestchen.generate(on, params, 'schreiben.kaestchen:oma', createRng(1))
    expect(data.chars).toEqual(['O', 'm', 'a'])
    expect(data.candidates[0]!.every((c) => c === c.toUpperCase())).toBe(true)
    expect(data.candidates[1]!.every((c) => c === c.toLowerCase())).toBe(true)
    expect(data.candidates[0]).toContain('O')
    for (const set of data.candidates) for (const c of set) expect(data.glyphs[c]).toBeDefined()
  })

  it('erkennt das Wort, wenn es nach Vorlage geschrieben wird', () => {
    const { data } = kaestchen.generate(on, params, 'schreiben.kaestchen:oma', createRng(1))
    data.chars.forEach((c, i) => {
      const templates = new Map(data.candidates[i]!.map((k) => [k, glyphTemplate(data.glyphs[k]!)]))
      const written = data.glyphs[c]!.strokes.map((s) => strokePoints(s))
      expect(judge(recognize(written, templates), c, data.tolerance), c).toBe('erkannt')
    })
  })

  it('übernimmt die Strenge aus den Einstellungen', () => {
    const easy = ctxWith({ kaestchen: true, recognitionTolerance: 1.25 })
    expect(
      kaestchen.generate(easy, params, 'schreiben.kaestchen:oma', createRng(1)).data.tolerance,
    ).toBe(1.25)
  })
})
