import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { resolveWords } from '@/core/words'
import { getExercise } from '@/exercises/registry'
import { personalForms, wrongPlurals } from '@/exercises/sprache/woerter'
import { satzzeichen } from '@/exercises/sprache/satzzeichen'

const settings = resolveDefaults('DE-BY', 2)
const ctx = { land: 'DE-BY', grade: 2, settings }
const word = (id: string) => resolveWords('DE-BY', 2).find((w) => w.id === id)!

describe('Sprache Klasse 2', () => {
  it('jede Übung hat Aufgaben, und die Lösung ist immer unter den Antworten', () => {
    for (const e of catalogFor('DE-BY', 2, 'sprache')) {
      const m = getExercise(e.exercise)!
      const keys = m.items(ctx, e.params as never)
      expect(keys.length, e.id).toBeGreaterThan(5)
      for (const key of keys.filter((_, i) => i % 7 === 0)) {
        const d = m.generate(ctx, e.params as never, key, createRng(2)).data as {
          correctKey?: string
          choices?: { key: string }[]
        }
        if (d.choices) {
          expect(
            d.choices.map((c) => c.key),
            key,
          ).toContain(d.correctKey)
          expect(new Set(d.choices.map((c) => c.key)).size, key).toBe(d.choices.length)
        }
      }
    }
  })

  it('Personalformen: ich spiele, du spielst, er spielt – auch unregelmäßig', () => {
    expect(personalForms(word('spielen'))).toEqual({ ich: 'spiele', du: 'spielst', er: 'spielt' })
    expect(personalForms(word('sprechen'))).toEqual({
      ich: 'spreche',
      du: 'sprichst',
      er: 'spricht',
    })
    expect(personalForms(word('sitzen'))).toEqual({ ich: 'sitze', du: 'sitzt', er: 'sitzt' })
    expect(personalForms(word('arbeiten'))).toEqual({
      ich: 'arbeite',
      du: 'arbeitest',
      er: 'arbeitet',
    })
    expect(personalForms(word('koennen'))).toBeUndefined()
  })

  it('Mehrzahl: Fehler sind nie die richtige Form', () => {
    expect(wrongPlurals(word('haus'))).toContain('Hauser')
    for (const w of resolveWords('DE-BY', 2).filter((x) => x.plural))
      expect(wrongPlurals(w)).not.toContain(w.plural)
  })

  it('Satzzeichen in Klasse 2 auch mit Ausrufezeichen', () => {
    const marks = new Set(
      satzzeichen
        .items(ctx, {})
        .map((k) => satzzeichen.generate(ctx, {}, k, createRng(1)).data.correctKey),
    )
    expect([...marks].sort()).toEqual(['!', '.', '?'])
  })
})
