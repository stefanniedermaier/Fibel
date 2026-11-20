import { describe, expect, it } from 'vitest'
import { dayKey, exerciseTitle, hitRates, itemLabel, lastDays, stumbles } from '@/core/stats'
import type { ProgressRecord, SessionRecord, TaskResult } from '@/core/types'
import { APP_VERSION, isNewer } from '@/core/version'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date(2026, 10, 20, 18, 0).getTime()

const task = (star: boolean): TaskResult => ({
  entryId: 'e',
  itemKey: 'x',
  wrongAttempts: star ? 0 : 2,
  revealed: !star,
  star,
})

const session = (
  startedAt: number,
  topic: SessionRecord['topic'],
  stars: number,
  total: number,
  completed = true,
): SessionRecord => ({
  id: String(startedAt),
  profileId: 'p',
  land: 'DE-BY',
  grade: 1,
  topic,
  startedAt,
  durationMs: 5 * 60_000,
  total,
  tasks: Array.from({ length: total }, (_, i) => task(i < stars)),
  stars,
  crown: stars >= 6,
  completed,
})

describe('Tagesübersicht', () => {
  it('zählt fertige Einheiten und Minuten der letzten 14 Tage', () => {
    const days = lastDays(
      [
        session(NOW, 'lesen', 6, 8),
        session(NOW - 60_000, 'rechnen', 4, 8, false),
        session(NOW - 3 * DAY, 'lesen', 8, 8),
        session(NOW - 20 * DAY, 'lesen', 8, 8),
      ],
      14,
      NOW,
    )
    expect(days).toHaveLength(14)
    expect(days.at(-1)).toMatchObject({ day: dayKey(NOW), units: 1, minutes: 10, label: 'Fr' })
    expect(days.at(-4)?.units).toBe(1)
    expect(days.reduce((s, d) => s + d.units, 0)).toBe(2)
  })
})

describe('Trefferquote', () => {
  it('rechnet Sterne pro Aufgabe je Klasse und Fach', () => {
    const rates = hitRates([
      session(NOW, 'lesen', 6, 8),
      session(NOW, 'lesen', 2, 8),
      session(NOW, 'rechnen', 8, 8),
    ])
    expect(rates).toEqual([
      { grade: 1, topic: 'lesen', tasks: 16, stars: 8, rate: 0.5 },
      { grade: 1, topic: 'rechnen', tasks: 8, stars: 8, rate: 1 },
    ])
  })
})

describe('Stolpersteine', () => {
  const rec = (itemKey: string, wrong: number, box: number): ProgressRecord => ({
    profileId: 'p',
    itemKey,
    box,
    correct: 1,
    wrong,
    lastSeen: 0,
  })

  it('zeigt häufige Fehler, die noch nicht sicher sitzen, die schlimmsten zuerst', () => {
    const list = stumbles([
      rec('lesen.wort-bild:rose', 3, 1),
      rec('rechnen.plus-minus:7-2', 5, 2),
      rec('lesen.wort-bild:oma', 1, 1),
      rec('lesen.wort-bild:hase', 4, 5),
    ])
    expect(list.map((s) => s.itemKey)).toEqual(['rechnen.plus-minus:7-2', 'lesen.wort-bild:rose'])
  })

  it('übersetzt Item-Keys in lesbare Namen', () => {
    const words = (id: string) => ({ rose: 'Rose' })[id]
    expect(itemLabel('lesen.wort-bild:rose', words)).toBe('Rose')
    expect(itemLabel('rechnen.plus-minus:7-2', words)).toBe('7 − 2')
    expect(itemLabel('rechnen.plus-minus:3+4', words)).toBe('3 + 4')
    expect(itemLabel('rechnen.zahlenhaus:7-3', words)).toBe('7 = 3 + ?')
    expect(itemLabel('rechnen.vergleichen:3-5', words)).toBe('3 ○ 5')
    expect(itemLabel('lesen.silben-hoeren:mo', words)).toBe('mo')
    expect(itemLabel('schreiben.nachspuren:M', words)).toBe('M')
    expect(exerciseTitle('lesen.wort-bild')).toBe('Wort lesen, Bild finden')
  })
})

describe('Version', () => {
  it('vergleicht Versionsnummern richtig', () => {
    expect(isNewer('1.0.1', '1.0.0')).toBe(true)
    expect(isNewer('1.10.0', '1.9.9')).toBe(true)
    expect(isNewer('1.0.0', '1.0.0')).toBe(false)
    expect(isNewer('0.9.0', '1.0.0')).toBe(false)
  })

  it('kennt die eigene Version aus package.json', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+/)
  })
})
