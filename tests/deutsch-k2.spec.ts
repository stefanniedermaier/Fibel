import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { derivePhenomena } from '@/core/phenomena'
import { createRng } from '@/core/random'
import { resolveWords } from '@/core/words'
import { satzLuecke } from '@/exercises/lesen/satz-luecke'
import { textFragen } from '@/exercises/lesen/text-fragen'
import { getExercise } from '@/exercises/registry'
import { abc } from '@/exercises/schreiben/abc'
import { ableiten, lueckeOf } from '@/exercises/schreiben/ableiten'
import { misspellings, schreibung } from '@/exercises/schreiben/schreibung'

// A profile moved up from grade 1 keeps its letter filter – grade 2 must ignore it.
const settings = { ...resolveDefaults('DE-BY', 2), letterFilter: true, letters: ['a', 'm'] }
const ctx = { land: 'DE-BY', grade: 2, settings }
const words = resolveWords('DE-BY', 2)
const word = (id: string) => words.find((w) => w.id === id)!

describe('Deutsch Klasse 2', () => {
  it('jede Übung in Lesen und Schreiben hat Aufgaben', () => {
    const withLernwoerter = { ...ctx, settings: { ...settings, lernwoerter: ['Fahrrad'] } }
    for (const topic of ['lesen', 'schreiben'] as const)
      for (const e of catalogFor('DE-BY', 2, topic)) {
        const m = getExercise(e.exercise)!
        const keys = m.items(withLernwoerter, e.params as never)
        expect(keys.length, e.id).toBeGreaterThan(0)
        expect(() =>
          m.generate(withLernwoerter, e.params as never, keys[0]!, createRng(1)),
        ).not.toThrow()
      }
  })

  it('Phänomene werden aus der Schreibung erkannt', () => {
    expect(derivePhenomena('Garten', ['Gar', 'ten'])).toEqual(expect.arrayContaining(['r', 'en']))
    expect(derivePhenomena('Bruder', ['Bru', 'der'])).toContain('er')
    expect(derivePhenomena('Bruder', ['Bru', 'der'])).not.toContain('r')
    expect(derivePhenomena('Sonne', ['Son', 'ne'])).toContain('doppel')
    expect(derivePhenomena('Zahl', ['Zahl'])).toContain('h')
    expect(derivePhenomena('Tisch', ['Tisch'])).not.toContain('h')
    expect(word('hund').phenomena).toContain('verhaertung')
  })

  it('Schreibung: typische Fehler, nie ein echtes Wort, das richtige ist dabei', () => {
    expect(misspellings(word('biene'))).toContain('Bine')
    expect(misspellings(word('sonne'))).toContain('Sone')
    const real = new Set(words.map((w) => w.text.toLowerCase()))
    expect(misspellings(word('buch'), real)).not.toContain('Busch')
    for (const key of schreibung.items(ctx, { wordGrade: 2 })) {
      const d = schreibung.generate(ctx, { wordGrade: 2 }, key, createRng(2)).data
      const keys = d.choices.map((c) => c.key)
      expect(keys).toContain(d.correctKey)
      expect(new Set(keys).size).toBe(3)
      for (const k of keys)
        if (k !== d.correctKey)
          expect(real.has(k.toLowerCase()) && k.toLowerCase() !== d.correctKey.toLowerCase()).toBe(
            false,
          )
    }
  })

  it('Ableiten: d oder t wegen Hunde, äu wegen Baum', () => {
    expect(lueckeOf(word('hund'))).toEqual({ before: 'Hun', right: 'd', wrong: 't', after: '' })
    expect(lueckeOf(word('baum'))).toMatchObject({ right: 'äu', wrong: 'eu' })
    expect(lueckeOf(word('fragen'))).toMatchObject({ before: 'fra', right: 'g', wrong: 'k' })
    const t = ableiten.generate(
      ctx,
      { wordGrade: 2, phenomena: ['verhaertung'] },
      'schreiben.ableiten:hund',
      createRng(1),
    )
    expect(t.data.prompt).toBe('Hun_')
    expect(ableiten.items(ctx, { wordGrade: 2, phenomena: ['umlaut'] }).length).toBeGreaterThan(10)
  })

  it('ABC: Nachbarbuchstaben und welches Wort zuerst', () => {
    expect(
      abc.generate(ctx, { mode: 'nach' }, 'schreiben.abc:nach:M', createRng(1)).data.correctKey,
    ).toBe('N')
    expect(
      abc.generate(ctx, { mode: 'vor' }, 'schreiben.abc:vor:B', createRng(1)).data.correctKey,
    ).toBe('A')
    for (const key of abc.items(ctx, { mode: 'zuerst', wordGrade: 2 }).slice(0, 40)) {
      const d = abc.generate(ctx, { mode: 'zuerst', wordGrade: 2 }, key, createRng(3)).data
      const sorted = d.choices.map((c) => c.key).sort((a, b) => a.localeCompare(b, 'de'))
      expect(sorted[0]).toBe(d.correctKey)
      expect(d.choices).toHaveLength(3)
    }
  })

  it('Lückensätze und Texte mit Textantworten', () => {
    const l = satzLuecke.generate(ctx, {}, 'lesen.satz-luecke:l1', createRng(1)).data
    expect(l.correctKey).toBe('trinkt')
    const t = textFragen.generate(
      ctx,
      { kind: 'lesen' },
      'lesen.text-fragen:igel:0',
      createRng(1),
    ).data
    expect(t.choices.find((c) => c.key === t.correctKey)?.text).toBe('am Tag')
    expect(t.sentences.length).toBeGreaterThan(3)
  })
})
