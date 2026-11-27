import { describe, expect, it } from 'vitest'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { coreHint, einmaleins } from '@/exercises/rechnen/einmaleins'
import { hunderter } from '@/exercises/rechnen/hunderter'
import { paeckchen } from '@/exercises/rechnen/paeckchen'
import { crossesTens, plusMinus, tasksFor } from '@/exercises/rechnen/plus-minus'
import { reihen } from '@/exercises/rechnen/reihen'
import { vergleichen } from '@/exercises/rechnen/vergleichen'
import { zahlenhaus } from '@/exercises/rechnen/zahlenhaus'
import { section, zahlenstrahl } from '@/exercises/rechnen/zahlenstrahl'
import { getExercise } from '@/exercises/registry'

const settings = resolveDefaults('DE-BY', 2)
const ctx = { land: 'DE-BY', grade: 2, settings }

describe('Rechnen Klasse 2', () => {
  it('jede Übung der Klasse 2 hat Aufgaben', () => {
    for (const e of catalogFor('DE-BY', 2, 'rechnen')) {
      const m = getExercise(e.exercise)!
      expect(m.items(ctx, e.params as never).length, e.id).toBeGreaterThan(0)
      const key = m.items(ctx, e.params as never)[0]!
      expect(() => m.generate(ctx, e.params as never, key, createRng(1)), e.id).not.toThrow()
    }
  })

  it('Plus und Minus bis 100: Formen, Ergebnis bis 100, Übergang nach Einstellung', () => {
    const all = tasksFor({ max: 100, forms: ['ZE+ZE'] }, settings)
    expect(all.length).toBeGreaterThan(100)
    for (const t of all) {
      expect(t.result).toBeGreaterThan(0)
      expect(t.result).toBeLessThanOrEqual(100)
      expect(t.a % 10).not.toBe(0)
      expect(t.b % 10).not.toBe(0)
    }
    const ohne = tasksFor({ max: 100, forms: ['ZE+E'] }, { ...settings, tenCrossing: false })
    expect(ohne.some(crossesTens)).toBe(false)
    expect(crossesTens({ a: 37, op: '+', b: 5, result: 42 })).toBe(true)
    expect(crossesTens({ a: 35, op: '+', b: 5, result: 40 })).toBe(false)
    expect(crossesTens({ a: 34, op: '-', b: 6, result: 28 })).toBe(true)
    const t = plusMinus.generate(
      ctx,
      { max: 100, forms: ['ZZ'] },
      'rechnen.plus-minus:30+40',
      createRng(1),
    )
    expect(t.data.cells).toBe(0)
    expect(t.data.result).toBe(70)
  })

  it('Zahlenstrahl bis 100 zeigt einen Ausschnitt mit der Zahl', () => {
    for (const n of [1, 9, 34, 57, 95, 99]) {
      const from = section(n, 100)
      expect(n).toBeGreaterThanOrEqual(from)
      expect(n).toBeLessThanOrEqual(from + 20)
      expect(from + 20).toBeLessThanOrEqual(100)
    }
    const t = zahlenstrahl.generate(
      ctx,
      { max: 100, mode: 'nachbarn' },
      'rechnen.zahlenstrahl:nach:59',
      createRng(1),
    )
    expect(t.data.correctKey).toBe('60')
  })

  it('Vergleichen, Zerlegen und Reihen bleiben bis 100', () => {
    const pairs = vergleichen.items(ctx, { max: 100 })
    expect(pairs.length).toBeLessThan(1000)
    expect(pairs).toContain('rechnen.vergleichen:34-43')
    for (const key of zahlenhaus.items(ctx, { max: 100, zehner: true })) {
      const [total, known] = key.split(':')[1]!.split('-').map(Number) as [number, number]
      expect(known).toBeLessThan(total)
      expect(total).toBeLessThanOrEqual(100)
    }
    for (const key of reihen.items(ctx, { levels: [6] })) {
      for (let seed = 0; seed < 10; seed++) {
        const d = reihen.generate(ctx, { levels: [6] }, key, createRng(seed)).data
        for (const tok of d.tokens) {
          const v = Number(tok.name)
          if (!Number.isNaN(v)) expect(v >= 0 && v <= 100).toBe(true)
        }
      }
    }
  })

  it('Päckchen bis 100: analoge Aufgaben stimmen', () => {
    for (const key of paeckchen.items(ctx, { max: 100, mode: 'strategie' })) {
      const t = paeckchen.generate(ctx, { max: 100, mode: 'strategie' }, key, createRng(1))
      const task = t.data.task.replace('−', '-')
      const value = task.startsWith('Hälfte') ? Number(task.split(' ').at(-1)) / 2 : eval(task)
      expect(value, key).toBe(t.data.answer)
      expect(t.data.answer).toBeLessThanOrEqual(100)
    }
  })

  it('Einmaleins: Kernaufgaben, Umkehrung, Hilfe und Rest', () => {
    const keys = einmaleins.items(ctx, {
      mode: 'rechnen',
      reihen: [1, 2, 5, 10],
      quadrat: true,
      geteilt: true,
    })
    expect(keys).toContain('rechnen.einmaleins:7x5')
    expect(keys).toContain('rechnen.einmaleins:35d5')
    expect(keys).toContain('rechnen.einmaleins:6x6')
    for (const key of keys) {
      const d = einmaleins.generate(ctx, { mode: 'rechnen' }, key, createRng(1)).data
      const [x, y] = d.task.split(/ [·:] /).map(Number) as [number, number]
      expect(d.task.includes('·') ? x * y : x / y).toBe(d.answer)
    }
    expect(coreHint(9, 8)).toContain('zehn mal acht')
    expect(coreHint(5, 8)).toBeUndefined()
    const rest = einmaleins.generate(
      ctx,
      { mode: 'rest' },
      'rechnen.einmaleins:17r5',
      createRng(1),
    ).data
    expect(rest.correctKey).toBe('3 Rest 2')
    expect(new Set(rest.choices!.map((c) => c.key)).size).toBe(rest.choices!.length)
    const bild = einmaleins.generate(
      ctx,
      { mode: 'bild' },
      'rechnen.einmaleins:bild-3x4',
      createRng(1),
    ).data
    expect(bild.correctKey).toBe('3 · 4')
    expect(bild.choices!.filter((c) => c.key === '3 · 4')).toHaveLength(1)
  })

  it('Hundertertafel: die Mitte fehlt, Nachbarn stimmen', () => {
    const d = hunderter.generate(ctx, {}, 'rechnen.hunderter:tafel:47', createRng(1)).data
    expect(d.cells).toEqual([null, 37, null, 46, null, 48, null, 57, null])
    expect(d.choices.map((c) => c.key)).toContain('47')
    const g = hunderter.generate(ctx, {}, 'rechnen.hunderter:gerade:34', createRng(1)).data
    expect(g.correctKey).toBe('gerade')
  })
})
