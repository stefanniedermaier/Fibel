import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import {
  baseSentences,
  readableSentences,
  sentenceTokens,
  unknownWords,
  wordsOf,
} from '@/core/saetze'
import type { ProfileSettings } from '@/core/types'
import { LETTERS, lauttreu, resolveWords, wordsForSettings } from '@/core/words'
import { blitzlesen, blitzPool } from '@/exercises/lesen/blitzlesen'
import { lautposition, positionOf } from '@/exercises/lesen/lautposition'
import { confusable, satzBild, type SatzBildData } from '@/exercises/lesen/satz-bild'
import { abschreiben } from '@/exercises/schreiben/abschreiben'
import { cleanLernwoerter, diktat } from '@/exercises/schreiben/diktat'
import { writingPool } from '@/exercises/schreiben/shared'

const base = resolveDefaults('DE-BY', 1)
const withLetters = (n: number): ProfileSettings => ({
  ...base,
  letters: LETTERS.slice(0, n).map((l) => l.id),
})
const ctxFor = (settings: ProfileSettings) => ({ land: 'DE-BY', grade: 1, settings })
const all = ctxFor({ ...base, letterFilter: false })
const words = resolveWords('DE-BY', 1)

describe('Merkwörter', () => {
  it('stehen im Wörterbuch, aber nicht in den Übungen nach Gehör', () => {
    const merk = words.filter((w) => w.merkwort).map((w) => w.text)
    expect(merk).toEqual(expect.arrayContaining(['und', 'der', 'die', 'sie', 'wir', 'oder']))
    expect(writingPool(all, {}).some((w) => w.merkwort)).toBe(false)
    expect(lauttreu(words).some((w) => w.merkwort)).toBe(false)
  })

  it('brauchen nur ihre einzelnen Buchstaben (d, i, e für „die“), nicht das ie', () => {
    const settings = { ...base, letters: ['d', 'i', 'e', 's'] }
    const readable = wordsForSettings(words, settings).map((w) => w.text)
    expect(readable).toContain('die')
    expect(readable).toContain('sie')
  })
})

describe('Sätze', () => {
  it('bestehen nur aus bekannten Wörtern', () => {
    for (const s of baseSentences(1)) expect(unknownWords(s, words), s.text).toEqual([])
  })

  it('wachsen mit den Buchstaben', () => {
    const few = readableSentences('DE-BY', 1, withLetters(12)).length
    const more = readableSentences('DE-BY', 1, withLetters(20)).length
    expect(few).toBeGreaterThanOrEqual(1)
    expect(more).toBeGreaterThanOrEqual(20)
    expect(readableSentences('DE-BY', 1, { ...base, letterFilter: false }).length).toBe(
      baseSentences(1).length,
    )
  })

  it('zerlegen Wörter in Silben und behalten das Satzzeichen', () => {
    const s = baseSentences(1).find((x) => x.text === 'Da sind drei Tomaten.')!
    expect(wordsOf(s.text)).toEqual(['Da', 'sind', 'drei', 'Tomaten'])
    const tokens = sentenceTokens(s, words)
    expect(tokens.at(-1)!.syllables).toEqual(['To', 'ma', 'ten.'])
    expect(tokens[1]!.merkwort).toBe(true)
  })

  it('Satz lesen: drei verschiedene Bilder, eines passt', () => {
    const items = satzBild.items(all, { mode: 'waehlen' })
    expect(items.length).toBe(baseSentences(1).length)
    for (const key of items.slice(0, 40)) {
      const t = satzBild.generate(all, { mode: 'waehlen' }, key, createRng(1))
      const d = t.data as SatzBildData
      expect(d.choices).toHaveLength(3)
      expect(new Set(d.choices.map((c) => c.scene.join())).size).toBe(3)
      expect(d.choices.some((c) => c.key === d.correctKey)).toBe(true)
    }
  })

  it('stellt Papa und Opa (Mama und Oma) nie gegeneinander', () => {
    for (const key of satzBild.items(all, { mode: 'waehlen' })) {
      for (let seed = 0; seed < 3; seed++) {
        const d = satzBild.generate(all, { mode: 'waehlen' }, key, createRng(seed))
          .data as SatzBildData
        for (const a of d.choices)
          for (const b of d.choices) if (a !== b) expect(confusable(a.scene, b.scene)).toBe(false)
      }
    }
  })

  it('Passt der Satz? mal ja, mal nein', () => {
    const answers = new Set<string>()
    const key = satzBild.items(all, { mode: 'stimmt' })[0]!
    for (let seed = 0; seed < 20; seed++) {
      answers.add(satzBild.generate(all, { mode: 'stimmt' }, key, createRng(seed)).data.correctKey)
    }
    expect([...answers].sort()).toEqual(['ja', 'nein'])
  })

  it('erscheinen erst, wenn genug Sätze lesbar sind', () => {
    expect(satzBild.items(ctxFor(withLetters(7)), { mode: 'waehlen' })).toEqual([])
  })
})

describe('Blitzlesen', () => {
  it('nimmt Merkwörter und kurze Wörter, mit drei verschiedenen Wörtern zur Wahl', () => {
    const pool = blitzPool(all, {})
    expect(pool.some((w) => w.merkwort)).toBe(true)
    expect(pool.every((w) => w.merkwort || w.text.length <= 5)).toBe(true)
    const t = blitzlesen.generate(all, {}, 'lesen.blitzlesen:und', createRng(2))
    expect(t.data.choices).toHaveLength(3)
    expect(new Set(t.data.choices.map((c) => c.label)).size).toBe(3)
    expect(t.data.merkwort).toBe(true)
    expect(t.data.showMs).toBe(base.flashMs)
  })
})

describe('Lautposition', () => {
  it('bestimmt Anfang, Mitte und Ende', () => {
    const lama = words.find((w) => w.id === 'lama')!
    expect(positionOf(lama, 'l')).toBe('anfang')
    expect(positionOf(lama, 'm')).toBe('mitte')
    expect(positionOf(lama, 'a')).toBeUndefined() // zweimal im Wort
  })

  it('fragt nur eindeutige Fälle und nie nach dem e', () => {
    const items = lautposition.items(all, {})
    expect(items.length).toBeGreaterThan(50)
    expect(items.some((k) => k.endsWith('-e'))).toBe(false)
    const t = lautposition.generate(all, {}, items[0]!, createRng(1))
    expect(t.data.choices).toHaveLength(3)
  })
})

describe('Merkwörter schreiben', () => {
  it('Diktat spricht das Merkwort mit Beispiel', () => {
    const items = diktat.items(all, { source: 'merkwoerter' })
    expect(items).toContain('schreiben.diktat:merkwoerter:und')
    const t = diktat.generate(
      all,
      { source: 'merkwoerter' },
      'schreiben.diktat:merkwoerter:der',
      createRng(1),
    )
    expect(t.data.target).toBe('der')
    expect(t.data.spoken).toContain('der Hase')
  })

  it('Lernwörter kommen aus dem Elternbereich und werden bereinigt', () => {
    expect(cleanLernwoerter([' Hund ', 'hund', 'x', 'Katze!', ''])).toEqual(['Hund', 'Katze'])
    expect(diktat.items(all, { source: 'lernwoerter' })).toEqual([])
    const ctx = ctxFor({ ...base, letterFilter: false, lernwoerter: ['Hund', 'Ball'] })
    expect(diktat.items(ctx, { source: 'lernwoerter' })).toEqual([
      'schreiben.diktat:lernwoerter:hund',
      'schreiben.diktat:lernwoerter:ball',
    ])
    const t = diktat.generate(
      ctx,
      { source: 'lernwoerter' },
      'schreiben.diktat:lernwoerter:ball',
      createRng(1),
    )
    expect(t.data.target).toBe('Ball')
  })

  it('Abschreiben zeigt kein Bild', () => {
    const t = abschreiben.generate(all, {}, 'schreiben.abschreiben:und', createRng(1))
    expect(t.data.image).toBeUndefined()
    expect(t.data.merkwort).toBe(true)
  })
})
