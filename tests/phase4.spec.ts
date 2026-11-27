import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import {
  activeFocus,
  planFocused,
  isStumble,
  planStumbles,
  practiceEntries,
  stumbleItems,
} from '@/core/practice'
import { createRng } from '@/core/random'
import type { ProgressRecord } from '@/core/types'
import { reihenfolge } from '@/exercises/lesen/reihenfolge'
import { TEXTE, textFragen } from '@/exercises/lesen/text-fragen'
import { geld, splitAmount } from '@/exercises/messen/geld'
import { laengenVergleichen } from '@/exercises/messen/vergleichen'
import { ordnungszahl } from '@/exercises/rechnen/ordnungszahl'
import { getExercise } from '@/exercises/registry'
import { grossKlein } from '@/exercises/sprache/gross-klein'
import { satzzeichen } from '@/exercises/sprache/satzzeichen'
import { vokale } from '@/exercises/sprache/vokale'
import { MONATE, WOCHENTAGE, kalender } from '@/exercises/uhr/kalender'

const base = resolveDefaults('DE-BY', 1)
const all = { land: 'DE-BY', grade: 1, settings: { ...base, letterFilter: false } }

describe('Schwerpunkt', () => {
  it('gilt nur bis zum Ablauf', () => {
    const settings = { focus: { rechnen: { unit: 'k1.rechnen.formen', until: 2000 } } }
    expect(activeFocus(settings, 'rechnen', 1000)).toBe('k1.rechnen.formen')
    expect(activeFocus(settings, 'rechnen', 3000)).toBeUndefined()
    expect(activeFocus(settings, 'lesen', 1000)).toBeUndefined()
  })

  it('bekommt etwa die Hälfte der Aufgaben', () => {
    const entries = practiceEntries(all, 'rechnen', getExercise)
    for (let seed = 0; seed < 10; seed++) {
      const tasks = planFocused(
        entries,
        'k1.rechnen.formen',
        all,
        new Map(),
        10,
        createRng(seed),
        getExercise,
      )
      expect(tasks).toHaveLength(10)
      expect(tasks.filter((t) => t.entry.unit === 'k1.rechnen.formen')).toHaveLength(5)
    }
  })
})

describe('Stolpersteine', () => {
  const record = (itemKey: string, wrong: number, box: number): ProgressRecord => ({
    profileId: 'p',
    itemKey,
    box,
    correct: 0,
    wrong,
    lastSeen: 0,
  })

  it('erkennt oft falsche Aufgaben, die noch nicht sitzen', () => {
    expect(isStumble(record('x', 2, 1))).toBe(true)
    expect(isStumble(record('x', 1, 1))).toBe(false)
    expect(isStumble(record('x', 3, 4))).toBe(false)
  })

  it('mischt Stolpersteine mit anderen Aufgaben, etwa zur Hälfte', () => {
    const keys = [
      'rechnen.plus-minus:3+4',
      'rechnen.plus-minus:7-2',
      'rechnen.plus-minus:5+5',
      'rechnen.plus-minus:9-6',
      'rechnen.plus-minus:2+6',
    ]
    const progress = new Map(keys.map((k) => [k, record(k, 3, 1)]))
    const entries = practiceEntries(all, 'rechnen', getExercise)
    expect(stumbleItems(all, entries, progress, getExercise)).toHaveLength(5)
    const tasks = planStumbles(entries, all, progress, 8, createRng(1), getExercise)
    expect(tasks).toHaveLength(8)
    const hard = tasks.filter((t) => keys.includes(t.itemKey)).length
    expect(hard).toBe(4)
  })
})

describe('Texte und Geschichten', () => {
  it('Lesetexte nur mit lesbaren Wörtern, Hörgeschichten immer', () => {
    const lesen = textFragen.items(all, { kind: 'lesen' })
    const hoeren = textFragen.items(all, { kind: 'hoeren' })
    expect(lesen.length).toBeGreaterThan(10)
    expect(hoeren.length).toBe(
      TEXTE.filter((t) => t.kind === 'hoeren').flatMap((t) => t.fragen).length,
    )
    const start = { ...all, settings: base }
    expect(textFragen.items(start, { kind: 'lesen' })).toEqual([])
    expect(textFragen.items(start, { kind: 'hoeren' }).length).toBe(hoeren.length)
  })

  it('die Hörgeschichte wird mit der Frage vorgelesen', () => {
    const t = textFragen.generate(all, { kind: 'hoeren' }, 'lesen.text-fragen:zoo:0', createRng(1))
    expect(t.instruction).toContain('Elefanten')
    expect(t.instruction).toContain('Wer trinkt Wasser?')
    expect(t.data.choices.map((c) => c.key)).toContain(t.data.correctKey)
  })
})

describe('Bildergeschichten', () => {
  it('nie schon in der richtigen Reihenfolge', () => {
    for (const key of reihenfolge.items(all, {})) {
      for (let seed = 0; seed < 10; seed++) {
        const d = reihenfolge.generate(all, {}, key, createRng(seed)).data
        expect(d.order.every((v, i) => v === i)).toBe(false)
        expect([...d.order].sort()).toEqual(d.images.map((_, i) => i))
      }
    }
  })
})

describe('Sprache', () => {
  it('Selbstlaute: nur a, e, i, o, u', () => {
    const items = vokale.items(all, {})
    expect(items.length).toBeGreaterThan(20)
    const d = vokale.generate(all, {}, 'sprache.vokale:lama', createRng(1)).data
    expect(d.vowels).toEqual([1, 3])
  })

  it('Punkt oder Fragezeichen: beide kommen vor', () => {
    const items = satzzeichen.items(all, {})
    const marks = new Set(
      items.map((k) => satzzeichen.generate(all, {}, k, createRng(1)).data.correctKey),
    )
    expect([...marks].sort()).toEqual(['.', '?'])
  })

  it('Groß oder klein: Satzanfang und Nomen', () => {
    const d = grossKlein.generate(
      all,
      {},
      'sprache.gross-klein:da-sind-zwei-enten',
      createRng(1),
    ).data
    expect(d.words).toEqual(['da', 'sind', 'zwei', 'enten.'])
    expect(d.capitals).toEqual([0, 3])
  })
})

describe('Ordnungszahlen, Geld, Längen, Kalender', () => {
  it('Ordnungszahl: das dritte Tier', () => {
    const t = ordnungszahl.generate(all, {}, 'rechnen.ordnungszahl:3', createRng(1))
    expect(t.instruction).toContain('dritte')
    expect(t.data.correctKey).toBe('3')
    expect(t.data.places).toHaveLength(5)
  })

  it('Geld: die Teile ergeben den Betrag, mit mindestens zwei Stücken', () => {
    for (let a = 3; a <= 20; a++) {
      for (let seed = 0; seed < 5; seed++) {
        const parts = splitAmount(a, createRng(seed))
        expect(parts.reduce((s, p) => s + p, 0)).toBe(a)
        expect(parts.length).toBeGreaterThanOrEqual(2)
      }
      const d = geld.generate(
        all,
        { max: 20, mode: 'erkennen' },
        `messen.geld:erkennen:${a}`,
        createRng(a),
      ).data
      expect(d.choices.map((c) => c.key)).toContain(String(a))
    }
  })

  it('Längen: die Antwort ist wirklich der längste oder kürzeste Stift', () => {
    for (const key of laengenVergleichen.items(all, {})) {
      const d = laengenVergleichen.generate(all, {}, key, createRng(3)).data
      const lengths = d.pencils.map((p) => p.length)
      const target = d.pencils.find((p) => p.key === d.correctKey)!.length
      expect(target).toBe(key.includes('laeng') ? Math.max(...lengths) : Math.min(...lengths))
    }
  })

  it('Kalender: Tag danach, Monat davor, über die Woche hinweg', () => {
    const nach = kalender.generate(
      all,
      { mode: 'wochentage' },
      'uhr.kalender:wochentage:nach:6',
      createRng(1),
    )
    expect(nach.data.correctKey).toBe(WOCHENTAGE[0])
    const vor = kalender.generate(
      all,
      { mode: 'monate' },
      'uhr.kalender:monate:vor:0',
      createRng(1),
    )
    expect(vor.data.correctKey).toBe(MONATE[11])
    const gestern = kalender.generate(
      all,
      { mode: 'gestern' },
      'uhr.kalender:gestern:gestern:2',
      createRng(1),
    )
    expect(gestern.data.correctKey).toBe('Dienstag')
    expect(new Set(gestern.data.choices.map((c) => c.key)).size).toBe(3)
  })
})
