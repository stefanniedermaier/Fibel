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
