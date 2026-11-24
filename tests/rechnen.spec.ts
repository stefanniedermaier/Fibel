import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberInput from '@/components/NumberInput.vue'
import { cleanNumber } from '@/core/numbers'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { availableEntries, planSession } from '@/core/session'
import { mengeLegen } from '@/exercises/rechnen/menge-legen'
import { plusMinus, tasksFor } from '@/exercises/rechnen/plus-minus'
import { crossesTen, parseArithmetic, spokenArithmetic } from '@/exercises/rechnen/shared'
import { relationOf, vergleichen } from '@/exercises/rechnen/vergleichen'
import { zahlenhaus } from '@/exercises/rechnen/zahlenhaus'
import { getExercise } from '@/exercises/registry'
import type { LearnerContext } from '@/exercises/types'

const defaults = resolveDefaults('DE-BY', 1)
const ctxWith = (patch: Partial<typeof defaults> = {}): LearnerContext => ({
  land: 'DE-BY',
  grade: 1,
  settings: { ...defaults, ...patch },
})
const rng = createRng(11)

describe('Zehnerübergang', () => {
  it.each([
    ['8+5', true],
    ['8+2', false],
    ['12+5', false],
    ['13-5', true],
    ['12-2', false],
    ['15-3', false],
  ])('%s → %s', (text, expected) => {
    expect(crossesTen(parseArithmetic(text))).toBe(expected)
  })

  it('spricht Aufgaben als Zahlwörter', () => {
    expect(spokenArithmetic(parseArithmetic('3+4'))).toBe('drei plus vier')
    expect(spokenArithmetic(parseArithmetic('17-9'))).toBe('siebzehn minus neun')
  })
})

describe('R4 Plus/Minus bis 10', () => {
  const settings = { numberRange: 10, allowMinus: true, tenCrossing: false }

  it('bleibt im Zahlenraum und wird nie negativ', () => {
    const tasks = tasksFor({ max: 10 }, settings)
    expect(tasks.length).toBeGreaterThan(50)
    for (const t of tasks) {
      expect(t.result).toBeGreaterThanOrEqual(0)
      expect(t.result).toBeLessThanOrEqual(10)
      expect(t.a).toBeGreaterThanOrEqual(1)
      expect(t.b).toBeGreaterThanOrEqual(1)
    }
  })

  it('lässt Minus weg, wenn es abgeschaltet ist', () => {
    const tasks = tasksFor({ max: 10 }, { ...settings, allowMinus: false })
    expect(tasks.every((t) => t.op === '+')).toBe(true)
  })

  it('erzeugt Anweisung, Lösung und Daten passend zur Aufgabe', () => {
    const task = plusMinus.generate(ctxWith(), { max: 10 }, 'rechnen.plus-minus:7-3', rng)
    expect(task.instruction).toBe('Wie viel ist sieben minus drei?')
    expect(task.solution).toBe('sieben minus drei ist vier.')
    expect(task.data).toMatchObject({ a: 7, op: '-', b: 3, result: 4, cells: 10 })
  })
})

describe('R5 Plus/Minus bis 20', () => {
  const params = { max: 20, above: 10 }

  it('ist nur verfügbar, wenn der Zahlenraum 20 freigeschaltet ist', () => {
    expect(plusMinus.items(ctxWith(), params)).toEqual([])
    expect(plusMinus.items(ctxWith({ numberRange: 20 }), params).length).toBeGreaterThan(0)
  })

  it('nimmt nur Aufgaben über 10, ohne Zehnerübergang solange abgeschaltet', () => {
    const tasks = tasksFor(params, { numberRange: 20, allowMinus: true, tenCrossing: false })
    for (const t of tasks) {
      expect(Math.max(t.a, t.result)).toBeGreaterThan(10)
      expect(t.result).toBeLessThanOrEqual(20)
      expect(t.b).toBeLessThanOrEqual(9)
      expect(crossesTen(t)).toBe(false)
    }
  })

  it('enthält mit Zehnerübergang z. B. 8 + 5 und 13 − 5', () => {
    const keys = tasksFor(params, { numberRange: 20, allowMinus: true, tenCrossing: true }).map(
      (t) => `${t.a}${t.op}${t.b}`,
    )
    expect(keys).toContain('8+5')
    expect(keys).toContain('13-5')
  })

  it('zeigt das Zwanzigerfeld', () => {
    const task = plusMinus.generate(
      ctxWith({ numberRange: 20 }),
      params,
      'rechnen.plus-minus:12+5',
      rng,
    )
    expect(task.data.cells).toBe(20)
  })
})

describe('R3 Zahlenhaus', () => {
  it('fragt die fehlende Zahl ab', () => {
    const items = zahlenhaus.items(ctxWith(), { max: 10 })
    expect(items).toContain('rechnen.zahlenhaus:7-3')
    for (const key of items) {
      const { data } = zahlenhaus.generate(ctxWith(), { max: 10 }, key, rng)
      expect(data.known + data.missing).toBe(data.total)
      expect(data.missing).toBeGreaterThanOrEqual(0)
      expect(data.total).toBeLessThanOrEqual(10)
    }
    const task = zahlenhaus.generate(ctxWith(), { max: 10 }, 'rechnen.zahlenhaus:7-3', rng)
    expect(task.instruction).toBe('Im Zahlenhaus wohnt die sieben. Drei und wie viel sind sieben?')
  })
})

describe('R2 Vergleichen', () => {
  it('kennt kleiner, gleich und größer', () => {
    expect(relationOf(3, 5)).toBe('<')
    expect(relationOf(5, 5)).toBe('=')
    expect(relationOf(8, 2)).toBe('>')
    const task = vergleichen.generate(ctxWith(), { max: 10 }, 'rechnen.vergleichen:3-5', rng)
    expect(task.data.correctKey).toBe('<')
    expect(task.solution).toBe('Drei ist kleiner als fünf.')
    expect(vergleichen.items(ctxWith(), { max: 10 })).toHaveLength(100)
  })
})

describe('R1 umgekehrt: Menge legen', () => {
  it('bietet die Zahlen 1 bis 10 an', () => {
    expect(mengeLegen.items(ctxWith(), { max: 10 })).toHaveLength(10)
    expect(
      mengeLegen.generate(ctxWith(), { max: 10 }, 'rechnen.menge-legen:1', rng).instruction,
    ).toContain('ein Plättchen')
  })
})

describe('Rechnen in Klasse 1', () => {
  it('hat mit den Startwerten acht Übungen (zwei zur Uhr), mit Zahlenraum 20 neun', () => {
    const entries = catalogFor('DE-BY', 1, 'rechnen')
    expect(availableEntries(entries, ctxWith(), getExercise)).toHaveLength(8)
    expect(availableEntries(entries, ctxWith({ numberRange: 20 }), getExercise)).toHaveLength(9)
  })

  it('plant eine Einheit, in der jede Aufgabe eine Anzeige-Zeile hat', () => {
    const entries = availableEntries(catalogFor('DE-BY', 1, 'rechnen'), ctxWith(), getExercise)
    const tasks = planSession(entries, ctxWith(), new Map(), 8, createRng(3), getExercise)
    expect(tasks).toHaveLength(8)
    for (const t of tasks) expect((t.task.caption ?? t.task.instruction).length).toBeGreaterThan(0)
  })
})

describe('Zahleneingabe mit der Gerätetastatur', () => {
  it('lässt nur Ziffern ohne führende Null durch', () => {
    expect(cleanNumber('07', 2)).toBe('7')
    expect(cleanNumber('1 2', 2)).toBe('12')
    expect(cleanNumber('-3,5', 2)).toBe('35')
    expect(cleanNumber('123', 2)).toBe('12')
    expect(cleanNumber('0', 2)).toBe('0')
    expect(cleanNumber('00', 2)).toBe('0')
  })

  it('öffnet die Zifferntastatur und prüft die Antwort', async () => {
    const wrapper = mount(NumberInput, {
      props: { answer: 7, revealed: false, locked: false },
      attachTo: document.body,
    })
    const input = wrapper.get('input')
    expect(input.attributes('inputmode')).toBe('numeric')
    await input.setValue('a7')
    expect(wrapper.text()).toContain('7')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('answer')).toEqual([[true]])
    wrapper.unmount()
  })

  it('meldet eine falsche Antwort', async () => {
    const wrapper = mount(NumberInput, { props: { answer: 7, revealed: false, locked: false } })
    await wrapper.get('input').setValue('8')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('answer')).toEqual([[false]])
  })
})
