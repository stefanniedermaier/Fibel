import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import {
  availableEntries,
  earnsCrown,
  earnsStar,
  outcomeOf,
  planSession,
  rewardTotals,
  starsNeeded,
} from '@/core/session'
import type { CatalogEntry, SessionRecord } from '@/core/types'
import { getExercise } from '@/exercises/registry'

const ctx = { land: 'DE-BY', grade: 1, settings: resolveDefaults('DE-BY', 1) }
const mengen: CatalogEntry = {
  id: 'k1.rechnen.mengen-10',
  grade: 1,
  topic: 'rechnen',
  category: 'rechnen.zahlen',
  unit: 'k1.rechnen.zahlen-10',
  exercise: 'rechnen.mengen',
  params: { max: 10 },
  title: 'Mengen',
}

describe('Sterne und Krone', () => {
  it('gibt einen Stern bei richtig im 1. oder 2. Versuch, nicht nach gezeigter Lösung', () => {
    expect(earnsStar(0, false)).toBe(true)
    expect(earnsStar(1, false)).toBe(true)
    expect(earnsStar(2, true)).toBe(false)
  })

  it('ordnet Versuche dem Lernstand zu', () => {
    expect(outcomeOf(0, false)).toBe('first-try')
    expect(outcomeOf(1, false)).toBe('second-try')
    expect(outcomeOf(2, true)).toBe('revealed')
  })

  it('vergibt die Krone ab 6 von 8 Sternen (Standard 75 %)', () => {
    expect(starsNeeded(8, 0.75)).toBe(6)
    expect(earnsCrown(6, 8, 0.75)).toBe(true)
    expect(earnsCrown(5, 8, 0.75)).toBe(false)
  })

  it('vergibt die Krone immer, wenn die Schwelle 0 ist', () => {
    expect(earnsCrown(0, 8, 0)).toBe(true)
  })

  it('rechnet Schwellen als Anteil um (z. B. 6/8 bei 10 Aufgaben → 8)', () => {
    expect(starsNeeded(10, 6 / 8)).toBe(8)
    expect(starsNeeded(7, 7 / 7)).toBe(7)
  })
})

describe('planSession', () => {
  it('plant die eingestellte Zahl an Aufgaben ohne Doppelte', () => {
    const tasks = planSession([mengen], ctx, new Map(), 8, createRng(1), getExercise)
    expect(tasks).toHaveLength(8)
    expect(new Set(tasks.map((t) => t.itemKey)).size).toBe(8)
    for (const t of tasks) {
      expect(t.task.instruction).toBeTruthy()
      expect(t.task.solution).toBeTruthy()
    }
  })

  it('ignoriert Einträge mit unbekannten Übungen', () => {
    const broken = { ...mengen, id: 'x', exercise: 'gibt.es.nicht' }
    expect(availableEntries([mengen, broken], ctx, getExercise)).toEqual([mengen])
  })
})

describe('rewardTotals', () => {
  const session = (
    topic: SessionRecord['topic'],
    stars: number,
    crown: boolean,
  ): SessionRecord => ({
    id: Math.random().toString(),
    profileId: 'p',
    land: 'DE-BY',
    grade: 1,
    topic,
    startedAt: 0,
    durationMs: 0,
    total: 8,
    tasks: [],
    stars,
    crown,
    completed: crown,
  })

  it('summiert Sterne und Kronen gesamt und pro Fach, auch aus abgebrochenen Einheiten', () => {
    const t = rewardTotals([
      session('rechnen', 7, true),
      session('rechnen', 3, false),
      session('lesen', 8, true),
    ])
    expect(t.stars).toBe(18)
    expect(t.crowns).toBe(2)
    expect(t.byTopic.rechnen).toEqual({ stars: 10, crowns: 1 })
    expect(t.byTopic.lesen).toEqual({ stars: 8, crowns: 1 })
  })
})
