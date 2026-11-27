import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { TOPICS } from '@/core/types'
import { figure, flaeche } from '@/exercises/formen/flaeche'
import { koerper } from '@/exercises/formen/koerper'
import { halves, isSymmetric } from '@/exercises/formen/symmetrie'
import { geld, splitAmount, PIECES_100 } from '@/exercises/messen/geld'
import { lineal } from '@/exercises/messen/laenge'
import { getExercise } from '@/exercises/registry'
import { rechne, SACHAUFGABEN, sachaufgaben } from '@/exercises/rechnen/sachaufgaben'
import { zufall } from '@/exercises/rechnen/zufall'
import { uhrDigital } from '@/exercises/uhr/digital'
import { dauerText, zeitspanne } from '@/exercises/uhr/zeitspanne'

const settings = resolveDefaults('DE-BY', 2)
const ctx = { land: 'DE-BY', grade: 2, settings }

describe('Klasse 2: alle Bereiche', () => {
  it('jeder Katalog-Eintrag hat Aufgaben, die Lösung ist immer wählbar', () => {
    const withLernwoerter = { ...ctx, settings: { ...settings, lernwoerter: ['Fahrrad'] } }
    for (const topic of TOPICS)
      for (const e of catalogFor('DE-BY', 2, topic)) {
        const m = getExercise(e.exercise)!
        const keys = m.items(withLernwoerter, e.params as never)
        expect(keys.length, e.id).toBeGreaterThan(0)
        for (const key of keys.filter((_, i) => i % 11 === 0).slice(0, 12))
          for (let seed = 0; seed < 3; seed++) {
            const d = m.generate(withLernwoerter, e.params as never, key, createRng(seed)).data as {
              correctKey?: string
              choices?: { key: string }[]
            }
            if (d.choices && d.correctKey !== undefined && d.choices.length > 0) {
              const keysOf = d.choices.map((c) => c.key)
              expect(keysOf, `${e.id} ${key}`).toContain(d.correctKey)
              expect(new Set(keysOf).size, `${e.id} ${key}`).toBe(keysOf.length)
            }
          }
      }
  })
})

describe('Messen, Uhr, Sachaufgaben, Zufall, Formen', () => {
  it('Geld bis 100 €: die Stücke ergeben den Betrag', () => {
    for (let a = 3; a <= 100; a += 7) {
      const parts = splitAmount(a, createRng(a), PIECES_100)
      expect(parts.reduce((s, p) => s + p, 0)).toBe(a)
    }
    const w = geld.generate(
      ctx,
      { max: 100, mode: 'wechseln' },
      'messen.geld:wechseln:20-5',
      createRng(1),
    )
    expect(w.data.correctKey).toBe('4')
    const e = geld.generate(
      ctx,
      { max: 50, mode: 'einkaufen' },
      'messen.geld:einkaufen:10-6',
      createRng(1),
    )
    expect(e.data.amount).toBe(4)
  })

  it('Lineal: versetzt angelegt bleibt die Länge die Differenz', () => {
    const t = lineal.generate(ctx, { versetzt: true }, 'messen.lineal:3-7', createRng(1))
    expect(t.data.correctKey).toBe('7 cm')
    expect(t.data.choices.map((c) => c.key)).toContain('10 cm')
  })

  it('Uhr: 19:30 ist abends, Zeitspannen stimmen', () => {
    const d = uhrDigital.generate(
      ctx,
      { mode: 'tageszeit' },
      'uhr.digital:tageszeit:19-30',
      createRng(1),
    )
    expect(d.data.correctKey).toBe('19:30')
    expect(d.instruction).toContain('abends')
    const s = zeitspanne.generate(
      ctx,
      { mode: 'spaeter' },
      'uhr.zeitspanne:spaeter:11-0-3',
      createRng(1),
    )
    expect(s.data.correctKey).toBe('2:00')
    expect(dauerText(90)).toBe('1 Stunde und 30 Minuten')
  })

  it('Sachaufgaben rechnen sich nach (ganze Zahlen, nicht negativ, bis 100)', () => {
    for (const s of SACHAUFGABEN) {
      const r = rechne(s.op, s.a, s.b)
      expect(Number.isInteger(r), s.id).toBe(true)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(100)
    }
    const t = sachaufgaben.generate(
      ctx,
      { mode: 'rechnen' },
      'rechnen.sachaufgaben:rechnen:raeder',
      createRng(1),
    )
    expect(t.data.correctKey).toBe('2 · 9')
    expect(t.data.result).toBe(18)
  })

  it('Zufall: sicher heißt nur diese Farbe, unmöglich heißt keine', () => {
    for (let seed = 0; seed < 20; seed++)
      for (const kind of ['sicher', 'moeglich', 'unmoeglich']) {
        const t = zufall.generate(
          ctx,
          { mode: 'sicher' },
          `rechnen.zufall:sicher:${kind}-1`,
          createRng(seed),
        )
        const want = { rot: 'rot', blau: 'blau', gelb: 'gelb' }[
          t.instruction.match(/Sie ist (\w+)\./)![1]!
        ]
        const balls = t.data.boxes[0]!
        const has = balls.filter((b) => b === want).length
        if (kind === 'sicher') expect(has).toBe(balls.length)
        if (kind === 'unmoeglich') expect(has).toBe(0)
        if (kind === 'moeglich') expect(has > 0 && has < balls.length).toBe(true)
      }
  })

  it('Formen: Körper, Symmetrie ergänzen, Flächen', () => {
    const k = koerper.generate(ctx, { mode: 'ding' }, 'formen.koerper:ding:dose', createRng(1))
    expect(k.data.correctKey).toBe('zylinder')
    for (let seed = 0; seed < 30; seed++) {
      const h = halves(createRng(seed))
      expect(isSymmetric([...h.left, ...h.right])).toBe(true)
      for (const w of h.wrong) expect(isSymmetric([...h.left, ...w])).toBe(false)
    }
    for (let n = 4; n <= 12; n++) expect(figure(n, createRng(n))).toHaveLength(n)
    const v = flaeche.generate(
      ctx,
      { mode: 'vergleichen' },
      'formen.flaeche:vergleichen:a',
      createRng(3),
    ).data
    const [a, b] = v.figures.map((f) => f.cells.length) as [number, number]
    expect(v.correctKey).toBe(a === b ? 'gleich' : a > b ? 'A' : 'B')
  })
})
