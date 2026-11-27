import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { alsoRight, formenErkennen, type ErkennenData } from '@/exercises/formen/erkennen'
import { lageBegriffe } from '@/exercises/formen/lage'
import { paeckchen } from '@/exercises/rechnen/paeckchen'
import { GESCHICHTEN, sachaufgabe, storyText } from '@/exercises/rechnen/sachaufgabe'
import { stellenwert } from '@/exercises/rechnen/stellenwert'
import { zahlenstrahl } from '@/exercises/rechnen/zahlenstrahl'
import { DIGITS, nachspuren } from '@/exercises/schreiben/nachspuren'

const settings = resolveDefaults('DE-BY', 1)
const ctx = { land: 'DE-BY', grade: 1, settings }
const ctx20 = { ...ctx, settings: { ...settings, numberRange: 20 } }

describe('Ziffern nachspuren', () => {
  it('hat Vorlagen für alle Ziffern', () => {
    expect(nachspuren.items(ctx, { zeichen: 'ziffern' })).toHaveLength(DIGITS.length)
    const t = nachspuren.generate(
      ctx,
      { zeichen: 'ziffern' },
      'schreiben.nachspuren:7',
      createRng(1),
    )
    expect(t.instruction).toContain('Sieben')
    expect(t.data.glyph.strokes.length).toBeGreaterThan(0)
  })
})

describe('Zehner und Einer', () => {
  it('zeigt Zehner und Einer und bietet die Zahl an', () => {
    for (const key of stellenwert.items(ctx, { max: 20, mode: 'bild' })) {
      const t = stellenwert.generate(ctx, { max: 20, mode: 'bild' }, key, createRng(4))
      expect(t.data.tens * 10 + t.data.ones).toBe(t.data.n)
      expect(t.data.choices.map((c) => c.key)).toContain(String(t.data.n))
      expect(new Set(t.data.choices.map((c) => c.key)).size).toBe(3)
    }
  })

  it('zerlegt 14 in 10 + 4', () => {
    const t = stellenwert.generate(
      ctx,
      { max: 20, mode: 'zerlegen' },
      'rechnen.stellenwert:zerlegen:14',
      createRng(1),
    )
    expect(t.data.correctKey).toBe('4')
  })
})

describe('Zahlenstrahl', () => {
  it('fragt keine beschrifteten Zahlen ab und hat immer die Lösung dabei', () => {
    const items = zahlenstrahl.items(ctx, { max: 20, mode: 'ablesen' })
    expect(items.some((k) => /:(5|10|15)$/.test(k))).toBe(false)
    for (const key of [...items, ...zahlenstrahl.items(ctx, { max: 20, mode: 'nachbarn' })]) {
      const mode = key.includes('ablesen') ? 'ablesen' : 'nachbarn'
      const t = zahlenstrahl.generate(ctx, { max: 20, mode }, key, createRng(2))
      const keys = t.data.choices.map((c) => c.key)
      expect(keys).toContain(t.data.correctKey)
      expect(new Set(keys).size).toBe(keys.length)
      expect(keys.every((k) => Number(k) >= 0 && Number(k) <= 20)).toBe(true)
    }
  })

  it('Vorgänger und Nachfolger', () => {
    const vor = zahlenstrahl.generate(
      ctx,
      { max: 20, mode: 'nachbarn' },
      'rechnen.zahlenstrahl:vor:13',
      createRng(1),
    )
    const nach = zahlenstrahl.generate(
      ctx,
      { max: 20, mode: 'nachbarn' },
      'rechnen.zahlenstrahl:nach:13',
      createRng(1),
    )
    expect(vor.data.correctKey).toBe('12')
    expect(nach.data.correctKey).toBe('14')
  })
})

describe('Päckchen', () => {
  it('rechnet jede Strategie richtig und bleibt bis 20', () => {
    for (const key of paeckchen.items(ctx, { max: 20, mode: 'strategie' })) {
      const t = paeckchen.generate(ctx, { max: 20, mode: 'strategie' }, key, createRng(1))
      const task = t.data.task.replace('−', '-')
      const value = task.startsWith('Hälfte') ? Number(task.split(' ').at(-1)) / 2 : eval(task)
      expect(value, key).toBe(t.data.answer)
      expect(t.data.answer).toBeGreaterThanOrEqual(0)
      expect(t.data.answer).toBeLessThanOrEqual(20)
    }
  })

  it('Stimmt die Rechnung? mal ja, mal nein, und die gezeigte Zahl stimmt dazu', () => {
    const answers = new Set<string>()
    for (let seed = 0; seed < 30; seed++) {
      const t = paeckchen.generate(
        ctx,
        { max: 20, mode: 'pruefen' },
        'rechnen.paeckchen:pruefen:7+5',
        createRng(seed),
      )
      const [left, shown] = t.data.task.replace('−', '-').split(' = ') as [string, string]
      expect(eval(left) === Number(shown) ? 'ja' : 'nein').toBe(t.data.correctKey)
      answers.add(t.data.correctKey)
    }
    expect([...answers].sort()).toEqual(['ja', 'nein'])
  })
})

describe('Rechengeschichten', () => {
  it('bleiben im Zahlenraum des Profils', () => {
    const max = (keys: string[]) =>
      Math.max(...keys.map((k) => eval(k.split(':')[2]!.replace('+', '+')) as number))
    expect(max(sachaufgabe.items(ctx, { max: 20 }))).toBeLessThanOrEqual(10)
    expect(max(sachaufgabe.items(ctx20, { max: 20 }))).toBeLessThanOrEqual(20)
  })

  it('bieten drei verschiedene Rechnungen an, ohne negative Ergebnisse', () => {
    for (const key of sachaufgabe.items(ctx, { max: 20 }).filter((_, i) => i % 7 === 0)) {
      const t = sachaufgabe.generate(ctx, { max: 20 }, key, createRng(5))
      const labels = t.data.choices.map((c) => c.key)
      expect(labels).toContain(t.data.correctKey)
      expect(new Set(labels).size).toBe(3)
      for (const l of labels) expect(eval(l.replace('−', '-'))).toBeGreaterThanOrEqual(0)
    }
  })

  it('setzen die Zahlwörter ein', () => {
    expect(storyText(GESCHICHTEN[0]!, '+', 3, 2)).toBe(
      'Drei Enten schwimmen im Teich. Zwei Enten kommen dazu. Wie viele Enten sind es jetzt?',
    )
  })
})

describe('Lagebegriffe', () => {
  it('die richtige Stelle passt zur Frage', () => {
    for (const mode of ['kreuz', 'reihe'] as const) {
      for (const key of lageBegriffe.items(ctx, { mode })) {
        for (let seed = 0; seed < 5; seed++) {
          const t = lageBegriffe.generate(ctx, { mode }, key, createRng(seed))
          expect(t.data.places.some((p) => p.key === t.data.correctKey)).toBe(true)
          expect(new Set(t.data.places.map((p) => p.image)).size).toBe(t.data.places.length)
        }
      }
    }
    const links = lageBegriffe.generate(
      ctx,
      { mode: 'kreuz' },
      'formen.lage:kreuz:links',
      createRng(1),
    )
    expect(links.instruction).toMatch(/links vom (Baum|Haus)/)
  })
})

describe('Formen erkennen', () => {
  it('nie zwei richtige Antworten (ein Quadrat ist auch ein Rechteck)', () => {
    for (const key of formenErkennen.items(ctx, { mode: 'name' })) {
      for (let seed = 0; seed < 10; seed++) {
        const d = formenErkennen.generate(ctx, { mode: 'name' }, key, createRng(seed))
          .data as ErkennenData
        const target = d.correctKey as Parameters<typeof alsoRight>[0]
        expect(d.shapes).toHaveLength(3)
        for (const s of d.shapes) expect(alsoRight(target)).not.toContain(s.kind)
      }
    }
  })

  it('zählt Ecken', () => {
    const d = formenErkennen.generate(
      ctx,
      { mode: 'ecken' },
      'formen.erkennen:ecken:fuenfeck',
      createRng(1),
    ).data as ErkennenData
    expect(d.correctKey).toBe('5')
    expect(d.choices.map((c) => c.key)).toContain('5')
  })
})
