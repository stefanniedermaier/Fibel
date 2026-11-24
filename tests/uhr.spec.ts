import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ClockFace from '@/components/ClockFace.vue'
import { catalogFor, resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { availableEntries } from '@/core/session'
import { getExercise } from '@/exercises/registry'
import { CLOCK_CHOICE_COUNT, uhrLesen } from '@/exercises/rechnen/uhr-lesen'
import UhrStellenTask from '@/exercises/rechnen/uhr-stellen/UhrStellenTask.vue'
import { startTotal, uhrStellen } from '@/exercises/rechnen/uhr-stellen'
import {
  CLOCK_LEVEL_KEY,
  CLOCK_STEPS,
  clockLevel,
  digital,
  fromTotal,
  levelOf,
  parseTime,
  spokenTime,
  timeKey,
  timesFor,
  toTotal,
  typicalMistakes,
} from '@/exercises/rechnen/uhr/time'

const ctxFor = (grade: number) => ({
  land: 'DE-BY',
  grade,
  settings: resolveDefaults('DE-BY', grade),
})

describe('Uhrzeiten', () => {
  it.each([
    ['3-0', 'drei Uhr', '3:00'],
    ['1-0', 'ein Uhr', '1:00'],
    ['12-0', 'zwölf Uhr', '12:00'],
    ['3-30', 'halb vier', '3:30'],
    ['12-30', 'halb eins', '12:30'],
    ['3-15', 'Viertel nach drei', '3:15'],
    ['3-45', 'Viertel vor vier', '3:45'],
    ['12-45', 'Viertel vor eins', '12:45'],
    ['3-5', 'fünf nach drei', '3:05'],
    ['3-20', 'zwanzig nach drei', '3:20'],
    ['3-25', 'fünf vor halb vier', '3:25'],
    ['3-35', 'fünf nach halb vier', '3:35'],
    ['3-40', 'zwanzig vor vier', '3:40'],
    ['11-55', 'fünf vor zwölf', '11:55'],
    ['3-17', 'drei Uhr siebzehn', '3:17'],
    ['1-8', 'ein Uhr acht', '1:08'],
  ])('%s → „%s“ (%s)', (key, spoken, shown) => {
    const time = parseTime(key)
    expect(spokenTime(time)).toBe(spoken)
    expect(digital(time)).toBe(shown)
  })

  it('rechnet zwischen Uhrzeit und Minuten seit zwölf um', () => {
    expect(toTotal({ h: 12, m: 0 })).toBe(0)
    expect(toTotal({ h: 3, m: 30 })).toBe(210)
    expect(fromTotal(210)).toEqual({ h: 3, m: 30 })
    expect(fromTotal(-30)).toEqual({ h: 11, m: 30 })
    expect(fromTotal(720)).toEqual({ h: 12, m: 0 })
  })

  it('ordnet jede Uhrzeit genau einer Stufe zu', () => {
    const all = CLOCK_STEPS.flatMap((s) => timesFor([s]))
    expect(all).toHaveLength(12 * 60)
    expect(timesFor([60])).toHaveLength(12)
    expect(timesFor([30])).toHaveLength(12)
    expect(timesFor([15])).toHaveLength(24)
    expect(timesFor([5])).toHaveLength(96)
    expect(levelOf(45)).toBe(15)
  })

  it('lehnt ungültige Uhrzeiten ab', () => {
    expect(() => parseTime('13-0')).toThrow()
    expect(() => parseTime('0-0')).toThrow()
    expect(() => parseTime('3-60')).toThrow()
  })

  it('nimmt als typischen Fehler bei „halb“ die falsche Stunde zuerst', () => {
    expect(typicalMistakes({ h: 3, m: 30 }, [30])[0]).toEqual({ h: 4, m: 30 })
    expect(typicalMistakes({ h: 3, m: 15 }, [15])).toContainEqual({ h: 3, m: 45 })
  })
})

const progressWith = (keys: string[], box = 2) =>
  new Map(
    keys.map((itemKey) => [
      itemKey,
      { profileId: 'p', itemKey, box, correct: box, wrong: 0, lastSeen: 1 },
    ]),
  )

describe('Uhr-Level', () => {
  const none = new Map()

  it('beginnt in Klasse 1 bei vollen Stunden und geht höchstens bis halb', () => {
    expect(clockLevel({}, none, { maxLevel: 2 })).toBe(1)
    const fullHours = timesFor([60]).map((t) => `rechnen.uhr-lesen:${timeKey(t)}`)
    expect(clockLevel({}, progressWith(fullHours.slice(0, 5)), { maxLevel: 2 })).toBe(1)
    expect(clockLevel({}, progressWith(fullHours.slice(0, 6)), { maxLevel: 2 })).toBe(2)
    expect(clockLevel({}, progressWith(fullHours), { maxLevel: 2 })).toBe(2)
  })

  it('beginnt in Klasse 2 bei Viertelstunden und wiederholt die Stufen davor', () => {
    expect(clockLevel({}, none, { minLevel: 3 })).toBe(3)
    const ctx = { ...ctxFor(2), progress: none }
    const keys = uhrLesen.items(ctx, { minLevel: 3 })
    expect(keys).toHaveLength(12 + 12 + 24)
    expect(keys).toContain('rechnen.uhr-lesen:3-0')
    expect(keys).toContain('rechnen.uhr-lesen:3-45')
  })

  it('nimmt das im Elternbereich gesetzte Level, aber nicht über das Maximum', () => {
    expect(clockLevel({ [CLOCK_LEVEL_KEY]: 4 }, none, {})).toBe(4)
    expect(clockLevel({ [CLOCK_LEVEL_KEY]: 4 }, none, { maxLevel: 2 })).toBe(2)
  })

  it('bietet nichts an, wenn die Uhr abgeschaltet ist', () => {
    const ctx = ctxFor(1)
    const off = { ...ctx, settings: { ...ctx.settings, clock: false } }
    expect(uhrLesen.items(off, {})).toEqual([])
    expect(uhrStellen.items(off, {})).toEqual([])
  })
})

describe('R7 Uhr lesen', () => {
  it('bietet drei verschiedene Uhrzeiten an, deren Minuten zur Stufe passen', () => {
    const rng = createRng(5)
    const ctx = ctxFor(2)
    const all = { ...ctx, settings: { ...ctx.settings, levels: { [CLOCK_LEVEL_KEY]: 5 } } }
    const items = uhrLesen.items(all, {})
    expect(items).toHaveLength(720)
    for (const item of items) {
      const { data } = uhrLesen.generate(all, {}, item, rng)
      expect(data.choices).toHaveLength(CLOCK_CHOICE_COUNT)
      expect(new Set(data.choices.map((c) => c.key)).size).toBe(CLOCK_CHOICE_COUNT)
      expect(data.choices.map((c) => c.key)).toContain(data.correctKey)
      const step = levelOf(parseTime(data.correctKey).m)
      for (const c of data.choices) expect(parseTime(c.key).m % step).toBe(0)
    }
  })

  it('spricht Frage und Lösung', () => {
    const task = uhrLesen.generate(ctxFor(1), {}, 'rechnen.uhr-lesen:3-30', createRng(1))
    expect(task.instruction).toBe('Wie spät ist es?')
    expect(task.solution).toBe('Es ist halb vier.')
    expect(task.data.total).toBe(210)
    expect(task.data.choices.find((c) => c.key === '3-30')).toMatchObject({
      spoken: 'Halb vier',
      digital: '3:30',
    })
  })
})

describe('R8 Uhr stellen', () => {
  it('übt in Klasse 1 volle und halbe Stunden, aber nie einzelne Minuten', () => {
    expect(uhrStellen.items({ ...ctxFor(1), progress: new Map() }, { maxLevel: 2 })).toHaveLength(
      12,
    )
    const ctx = ctxFor(2)
    const five = { ...ctx, settings: { ...ctx.settings, levels: { [CLOCK_LEVEL_KEY]: 5 } } }
    expect(uhrStellen.items(five, {})).toHaveLength(12 + 12 + 24 + 96)
  })

  it('startet nie bei der Lösung', () => {
    for (const t of timesFor([60, 30, 15, 5])) {
      expect(startTotal(toTotal(t))).not.toBe(toTotal(t))
    }
  })

  it('wertet die gestellte Uhr aus', async () => {
    const { data } = uhrStellen.generate(ctxFor(1), {}, 'rechnen.uhr-stellen:3-30', createRng(1))
    expect(data.target).toBe(210)
    const wrapper = mount(UhrStellenTask, { props: { data, revealed: false, locked: false } })
    const check = wrapper.get('button.check')
    expect(check.attributes('disabled')).toBeDefined()

    const minute = wrapper.get('[aria-label="Minutenzeiger"]')
    const hour = wrapper.get('[aria-label="Stundenzeiger"]')
    // Two hours ahead with the hour hand, then 30 minutes with the minute hand: 2:30.
    await hour.trigger('keydown', { key: 'ArrowRight' })
    await hour.trigger('keydown', { key: 'ArrowRight' })
    for (let i = 0; i < 6; i++) await minute.trigger('keydown', { key: 'ArrowRight' })
    expect(minute.attributes('aria-valuetext')).toBe('2:30')
    await check.trigger('click')
    expect(wrapper.emitted('answer')).toEqual([[false]])

    // One more hour: halb vier.
    await wrapper.get('[aria-label="Stundenzeiger"]').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.get('button.check').trigger('click')
    expect(wrapper.emitted('answer')).toEqual([[false], [true]])
  })

  it('dreht den Stundenzeiger mit, wenn der Minutenzeiger über die Zwölf geht', async () => {
    const wrapper = mount(ClockFace, { props: { total: 55, settable: true, snap: 5 } })
    await wrapper.get('[aria-label="Minutenzeiger"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:total')).toEqual([[60]])
  })
})

describe('Uhr im Katalog', () => {
  it('ist in Klasse 1 und 2 verfügbar', () => {
    for (const grade of [1, 2]) {
      const ctx = ctxFor(grade)
      const ids = availableEntries(catalogFor('DE-BY', grade, 'rechnen'), ctx, getExercise).map(
        (e) => e.id,
      )
      expect(ids.filter((id) => id.includes('.uhr-'))).toEqual([
        `k${grade}.rechnen.uhr-lesen`,
        `k${grade}.rechnen.uhr-stellen`,
      ])
    }
  })
})
