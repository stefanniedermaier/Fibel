import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { halbschriftlich, stepsFor } from '@/exercises/rechnen/halbschriftlich'
import { addColumns, schriftlich, subtractColumns } from '@/exercises/rechnen/schriftlich'
import { stellenwert } from '@/exercises/rechnen/stellenwert'
import { ueberschlag } from '@/exercises/rechnen/ueberschlag'

const ctx = { land: 'DE-BY', grade: 3, settings: resolveDefaults('DE-BY', 3) }
const value = (cols: { digit: number }[]) => cols.reduce((s, c, i) => s + c.digit * 10 ** i, 0)

describe('Rechnen Klasse 3', () => {
  it('Stellenwert bis 1000: Hunderter, Zehner, Einer', () => {
    const t = stellenwert.generate(
      ctx,
      { max: 1000, mode: 'bild' },
      'rechnen.stellenwert:bild:734',
      createRng(1),
    )
    expect([t.data.hundreds, t.data.tens, t.data.ones]).toEqual([7, 3, 4])
    expect(t.data.choices.map((c) => c.key)).toContain('734')
  })

  it('Halbschriftlich: die Schritte ergeben das Ergebnis', () => {
    expect(stepsFor('+', 347, 235).map((s) => s.answer)).toEqual([500, 70, 12, 582])
    expect(stepsFor('-', 734, 258).map((s) => s.answer)).toEqual([534, 484, 476])
    expect(stepsFor('·', 7, 34).map((s) => s.answer)).toEqual([210, 28, 238])
    expect(stepsFor(':', 96, 4).map((s) => s.answer)).toEqual([20, 4, 24])
    for (const key of halbschriftlich.items(ctx, { ops: ['+', '-', '·', ':'] }))
      for (let seed = 0; seed < 20; seed++) {
        const d = halbschriftlich.generate(ctx, { ops: [] }, key, createRng(seed)).data
        const [a, op, b] = d.task.split(' ') as [string, string, string]
        const exact = { '+': +a + +b, '−': +a - +b, '·': +a * +b, ':': +a / +b }[op]!
        expect(d.result, d.task).toBe(exact)
        expect(Number.isInteger(d.result) && d.result >= 0 && d.result <= 1000).toBe(true)
        for (const s of d.steps)
          expect(Number.isInteger(s.answer) && s.answer >= 0, s.text).toBe(true)
      }
  })

  it('Schriftlich addieren: Spalten mit Übertrag', () => {
    const { columns } = addColumns([478, 256])
    expect(value(columns)).toBe(734)
    expect(columns.map((c) => c.carry)).toEqual([1, 1, 0])
    expect(columns[0]!.explanation).toContain('vierzehn')
  })

  it('Schriftlich subtrahieren: Entbündeln, auch über eine Null', () => {
    const a = subtractColumns(734, 258)
    expect(value(a.columns)).toBe(476)
    expect(a.columns[0]!.explanation).toContain('entbündeln einen Zehner')
    const z = subtractColumns(503, 128)
    expect(value(z.columns)).toBe(375)
    expect(z.columns[0]!.top).toEqual([13, 9, 4])
    expect(z.columns[0]!.explanation).toContain('Hunderter')
    expect(subtractColumns(612, 605).columns).toHaveLength(1)
  })

  it('Schriftlich: alle Aufgabenarten rechnen richtig', () => {
    for (const op of ['+', '-'] as const)
      for (const key of schriftlich.items(ctx, { op }))
        for (let seed = 0; seed < 30; seed++) {
          const d = schriftlich.generate(ctx, { op }, key, createRng(seed)).data
          const exact = op === '+' ? d.rows.reduce((s, r) => s + r, 0) : d.rows[0]! - d.rows[1]!
          expect(value(d.columns), `${key} ${d.rows}`).toBe(exact)
          expect(exact).toBeGreaterThan(0)
          expect(exact).toBeLessThanOrEqual(1000)
          if (key.includes('entbuendeln')) expect(d.columns[0]!.top, `${d.rows}`).toBeDefined()
          if (key.includes('null')) expect(d.columns[0]!.top, `${d.rows}`).toBeDefined()
        }
  })

  it('Überschlag: die Schätzung ist wählbar, kein negatives Ergebnis', () => {
    for (const key of ueberschlag.items(ctx, { mode: 'ungefaehr' }))
      for (let seed = 0; seed < 10; seed++) {
        const d = ueberschlag.generate(ctx, { mode: 'ungefaehr' }, key, createRng(seed)).data
        expect(d.choices.map((c) => c.key)).toContain(d.correctKey)
        expect(new Set(d.choices.map((c) => c.key)).size).toBe(d.choices.length)
      }
    for (let seed = 0; seed < 30; seed++) {
      const d = ueberschlag.generate(
        ctx,
        { mode: 'pruefen' },
        'rechnen.ueberschlag:pruefen-a',
        createRng(seed),
      ).data
      expect(Number(d.prompt!.split(' = ')[1])).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('Messen Klasse 3', () => {
  it('Umrechnen: jede Aufgabe hat drei verschiedene Antworten, die Lösung ist dabei', async () => {
    const { umrechnen } = await import('@/exercises/messen/laenge')
    const { UMRECHNUNGEN, sayUnits, solved } = await import('@/exercises/messen/groessen/tabelle')
    for (const art of Object.keys(UMRECHNUNGEN) as (keyof typeof UMRECHNUNGEN)[])
      for (const key of umrechnen.items(ctx, { art })) {
        const t = umrechnen.generate(ctx, { art }, key, createRng(1))
        const keys = t.data.choices.map((c) => c.key)
        expect(new Set(keys).size).toBe(3)
        expect(keys).toContain(t.data.correctKey)
        expect(t.solution).not.toMatch(/\d (ct|mm|cm|km|kg|g|ml|l|min|h|s|€)\b/)
      }
    expect(sayUnits(solved(UMRECHNUNGEN.geld[0]!))).toBe('3 Euro 50 sind 350 Cent')
    expect(sayUnits('½ h = 30 min')).toBe('eine halbe Stunde sind 30 Minuten')
  })

  it('Ablesen: Waage, Messbecher und Lineal', async () => {
    const { ablesen } = await import('@/exercises/messen/groessen')
    for (const instrument of ['lineal', 'waage', 'messbecher'] as const)
      for (const key of ablesen.items(ctx, { instrument })) {
        const t = ablesen.generate(ctx, { instrument }, key, createRng(2))
        expect(new Set(t.data.choices.map((c) => c.key)).size).toBe(3)
        expect(t.data.choices.map((c) => c.key)).toContain(t.data.correctKey)
      }
    const t = ablesen.generate(
      ctx,
      { instrument: 'lineal' },
      'messen.ablesen:lineal:47',
      createRng(1),
    )
    expect(t.data.correctKey).toBe('4 cm 7 mm')
  })
})

describe('Formen Klasse 3', () => {
  it('Würfelnetze: genau die 11 Netze lassen sich falten, Gegenüber stimmt', async () => {
    const { NETZE, falten, netz } = await import('@/exercises/formen/netz')
    const ok = Object.keys(NETZE).filter((k) => falten(NETZE[k]!) !== undefined)
    expect(ok).toEqual(['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11'])
    // In the cross-like net the square left of the row lies opposite the third one.
    const t = netz.generate(ctx, { mode: 'gegenueber' }, 'formen.netz:gegenueber:n5', createRng(3))
    expect(t.data.choices.map((c) => c.key)).toContain(t.data.correctKey)
    expect(t.data.correctKey).not.toBe(t.data.marked)
    const f = falten(['.#..', '####', '.#..'])!
    expect(f.get('1,0')! >> 1).toBe(f.get('1,2')! >> 1)
    expect(f.get('0,1')! >> 1).toBe(f.get('2,1')! >> 1)
  })

  it('Würfelgebäude: Anzahl und Baupläne', async () => {
    const { GEBAEUDE, anzahl, gebaeude } = await import('@/exercises/formen/gebaeude')
    expect(anzahl(GEBAEUDE.g5!)).toBe(8)
    for (const mode of ['zaehlen', 'bauplan'] as const)
      for (const key of gebaeude.items(ctx, { mode })) {
        const t = gebaeude.generate(ctx, { mode }, key, createRng(4))
        expect(t.data.choices).toHaveLength(3)
        const looks = t.data.choices.map((c) => c.label ?? JSON.stringify(c.plan))
        expect(new Set(looks).size).toBe(3)
      }
  })

  it('Rechter Winkel: genau ein rechter Winkel bzw. eine Figur mit rechten Winkeln', async () => {
    const { winkel } = await import('@/exercises/formen/winkel')
    for (const mode of ['winkel', 'figur'] as const)
      for (const key of winkel.items(ctx, { mode })) {
        const t = winkel.generate(ctx, { mode }, key, createRng(5))
        expect(t.data.choices.filter((c) => c.key === t.data.correctKey)).toHaveLength(1)
        for (const c of t.data.choices)
          for (const [x, y] of c.points)
            expect(Math.max(Math.abs(x - 50), Math.abs(y - 50))).toBeLessThanOrEqual(60)
      }
  })
})

describe('Uhr und Daten Klasse 3', () => {
  it('Zeitspannen mit Minuten über volle Stunden', async () => {
    const { zeitspanne, uhrzeit, dauerKurz } = await import('@/exercises/uhr/zeitspanne')
    expect(uhrzeit(8 * 60 + 65)).toBe('9:05')
    expect(dauerKurz(75)).toBe('1 h 15 min')
    expect(dauerKurz(40)).toBe('40 min')
    const t = zeitspanne.generate(
      ctx,
      { mode: 'spaeter', minuten: true },
      'uhr.zeitspanne:spaeter:m8:20-45',
      createRng(1),
    )
    expect(t.data.correctKey).toBe('9:05')
    for (const mode of ['spaeter', 'frueher', 'dauer'] as const)
      for (const key of zeitspanne.items(ctx, { mode, minuten: true })) {
        const g = zeitspanne.generate(ctx, { mode, minuten: true }, key, createRng(2))
        expect(new Set(g.data.choices.map((c) => c.key)).size).toBe(3)
        expect(g.data.choices.map((c) => c.key)).toContain(g.data.correctKey)
      }
  })

  it('Sachaufgaben mit zwei Schritten: ganze Zahlen, Klammern wo nötig', async () => {
    const { sachaufgaben, term } = await import('@/exercises/rechnen/sachaufgaben')
    expect(term(['+', ':'], 34, 26, 2)).toBe('(34 + 26) : 2')
    expect(term(['·', '+'], 8, 4, 9)).toBe('8 · 4 + 9')
    for (const key of sachaufgaben.items(ctx, { mode: 'zweischritt' })) {
      const t = sachaufgaben.generate(ctx, { mode: 'zweischritt' }, key, createRng(3))
      expect(Number.isInteger(t.data.result) && t.data.result >= 0).toBe(true)
      expect(t.data.choices.length).toBeGreaterThanOrEqual(2)
      expect(t.data.text).not.toMatch(/\{[abc]\}/)
    }
  })

  it('Diagramm mit Maßstab: Werte mal zehn', async () => {
    const { daten } = await import('@/exercises/rechnen/daten')
    const t = daten.generate(
      ctx,
      { mode: 'zaehlen', display: 'balken', faktor: 10 },
      'rechnen.daten:zaehlen:7',
      createRng(1),
    )
    expect(t.data.correctKey).toBe('70')
  })
})

describe('Bandornamente', () => {
  it('die Lösung folgt der Regel und ist unter drei verschiedenen Lagen', async () => {
    const { ornament, REGELN } = await import('@/exercises/formen/ornament')
    for (const key of ornament.items(ctx, {})) {
      const t = ornament.generate(ctx, {}, key, createRng(6))
      const regel = REGELN[key.split(':')[1]!.split('-')[0]!]!
      expect(t.data.correctKey).toBe(regel.lagen[t.data.band.length % regel.lagen.length])
      expect(new Set(t.data.choices.map((c) => c.key)).size).toBe(3)
      expect(t.data.choices.map((c) => c.key)).toContain(t.data.correctKey)
    }
  })
})

describe('Rechnen Klasse 4', () => {
  const ctx4 = { land: 'DE-BY', grade: 4, settings: resolveDefaults('DE-BY', 4) }
  it('Zahlwörter bis zur Million', async () => {
    const { numberWord } = await import('@/core/numbers')
    expect(numberWord(305040)).toBe('dreihundertfünftausendvierzig')
    expect(numberWord(21000)).toBe('einundzwanzigtausend')
    expect(numberWord(301001)).toBe('dreihunderteintausendeins')
    expect(numberWord(1000000)).toBe('eine Million')
  })

  it('Million: Tafel, Runden, Zahlenstrahl', async () => {
    const { million, zahl } = await import('@/exercises/rechnen/million')
    expect(zahl(305040)).toBe('305 040')
    const t = million.generate(
      ctx4,
      { mode: 'tafel' },
      'rechnen.million:tafel:305040',
      createRng(1),
    )
    expect(t.data.digits).toEqual([3, 0, 5, 0, 4, 0])
    for (const mode of ['tafel', 'hoeren', 'stelle', 'runden', 'strahl', 'ordnen'] as const)
      for (const key of million.items(ctx4, { mode }))
        for (let seed = 0; seed < 4; seed++) {
          const g = million.generate(ctx4, { mode }, key, createRng(seed))
          const keys = g.data.choices.map((c) => c.key)
          expect(new Set(keys).size, key).toBe(keys.length)
          expect(keys).toContain(g.data.correctKey)
        }
  })

  it('Schriftlich mit großen Zahlen bleibt richtig', async () => {
    const { schriftlich } = await import('@/exercises/rechnen/schriftlich')
    for (const op of ['+', '-'] as const)
      for (const key of schriftlich.items(ctx4, { op, gross: true }))
        for (let seed = 0; seed < 10; seed++) {
          const t = schriftlich.generate(ctx4, { op, gross: true }, key, createRng(seed))
          expect(value(t.data.columns)).toBe(t.data.result)
          expect(t.data.result).toBeGreaterThan(0)
        }
  })
})
