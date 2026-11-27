import { describe, expect, it } from 'vitest'
import {
  BASE_CATALOG,
  activeCatalog,
  categoriesOf,
  resolveDefaults,
  unitEnabled,
  unitsFor,
} from '@/core/content'
import { checkCatalogStructure } from '@/core/datacheck'
import { practiceCategories, practiceEntries, showsCategories, topicRoute } from '@/core/practice'
import { createRng } from '@/core/random'
import { planSession, sharesOf, weightedShares } from '@/core/session'
import { categoryRates } from '@/core/stats'
import type { CatalogEntry, SessionRecord } from '@/core/types'
import { getExercise } from '@/exercises/registry'

const settings = resolveDefaults('DE-BY', 1)
const ctx = { land: 'DE-BY', grade: 1, settings }

describe('Einheiten', () => {
  it('sind im 1. Halbjahr von selbst an, im 2. aus', () => {
    const term2 = { id: 'x', grade: 1, topic: 'rechnen' as const, title: 'x', term: 2 as const }
    expect(unitEnabled('k1.rechnen.zahlen-10', settings)).toBe(true)
    // Unknown units count as 1st half-year.
    expect(unitEnabled(term2.id, settings)).toBe(true)
  })

  it('folgen der Einstellung der Eltern', () => {
    const off = { units: { 'k1.rechnen.zahlen-10': false } }
    expect(unitEnabled('k1.rechnen.zahlen-10', off)).toBe(false)
    const entries = activeCatalog('DE-BY', 1, off, 'rechnen')
    expect(entries.some((e) => e.unit === 'k1.rechnen.zahlen-10')).toBe(false)
    expect(entries.length).toBeGreaterThan(0)
  })

  it('sind beim Wiederholen einer niedrigeren Klasse alle an, außer ausdrücklich aus', () => {
    expect(unitEnabled('k1.rechnen.zahlen-10', { units: {} }, true)).toBe(true)
    expect(
      unitEnabled('k1.rechnen.zahlen-10', { units: { 'k1.rechnen.zahlen-10': false } }, true),
    ).toBe(false)
  })

  it('gibt es pro Klasse und Fach in fester Reihenfolge', () => {
    expect(unitsFor(1, 'lesen').map((u) => u.id)[0]).toBe('k1.lesen.silben')
    expect(unitsFor(1, 'lesen').every((u) => u.grade === 1 && u.topic === 'lesen')).toBe(true)
  })
})

describe('Kategorien', () => {
  it('jeder Katalog-Eintrag hat eine passende Kategorie und Einheit', () => {
    expect(checkCatalogStructure()).toEqual([])
  })

  it('meldet falsche Zuordnungen', () => {
    const bad: CatalogEntry = { ...BASE_CATALOG[0]!, category: 'rechnen.zahlen', unit: 'zz' }
    const problems = checkCatalogStructure([...BASE_CATALOG, { ...bad, id: 'bad' }])
    expect(problems.join('\n')).toMatch(/bad: Kategorie/)
    expect(problems.join('\n')).toMatch(/bad: unbekannte Einheit/)
  })

  it('Lesen zeigt in Klasse 1 Hören und Wörter lesen', () => {
    const ids = practiceCategories(ctx, 'lesen', getExercise).map((c) => c.id)
    expect(ids).toContain('lesen.hoeren')
    expect(ids).toContain('lesen.woerter')
    expect(showsCategories(ctx, 'lesen', getExercise)).toBe(true)
    expect(topicRoute(ctx, 'lesen', getExercise).name).toBe('topic')
  })

  it('eine Kategorie enthält nur ihre Übungen', () => {
    const hoeren = practiceEntries(ctx, 'lesen', getExercise, 'lesen.hoeren')
    expect(hoeren.length).toBeGreaterThan(1)
    expect(hoeren.every((e) => e.category === 'lesen.hoeren')).toBe(true)
  })

  it('ein Fach mit nur einer Kategorie startet direkt eine Einheit', () => {
    const uhr = categoriesOf(practiceEntries(ctx, 'uhr', getExercise))
    if (uhr.length < 2) expect(topicRoute(ctx, 'uhr', getExercise).name).toBe('session')
  })
})

describe('Gewichtung', () => {
  it('teilt nach Gewicht auf', () => {
    expect(weightedShares(8, [1, 1, 2], createRng(1))).toEqual([2, 2, 4])
    expect(weightedShares(10, [1, 4], createRng(1))).toEqual([2, 8])
    expect(weightedShares(7, [3, 1, 1, 1, 1, 1, 1], createRng(2)).reduce((a, b) => a + b)).toBe(7)
  })

  it('gleiche Gewichte wie gleichmäßig verteilt', () => {
    for (let seed = 0; seed < 20; seed++) {
      const shares = weightedShares(8, [1, 1, 1], createRng(seed))
      expect(shares.reduce((a, b) => a + b)).toBe(8)
      expect(Math.max(...shares) - Math.min(...shares)).toBeLessThanOrEqual(1)
      expect([...shares].sort()).toEqual([...sharesOf(8, 3, createRng(seed))].sort())
    }
  })

  it('eine Einheit hält das Gewicht ein', () => {
    const entries = practiceEntries(ctx, 'rechnen', getExercise).slice(0, 2)
    const weighted = [{ ...entries[0]!, weight: 3 }, entries[1]!]
    const tasks = planSession(weighted, ctx, new Map(), 8, createRng(3), getExercise)
    expect(tasks.filter((t) => t.entry.id === entries[0]!.id).length).toBe(6)
  })
})

describe('Statistik nach Kategorie', () => {
  it('zählt Aufgaben auch aus gemischten Einheiten', () => {
    const session = (tasks: { entryId: string; star: boolean }[]): SessionRecord => ({
      id: 's',
      profileId: 'p',
      land: 'DE-BY',
      grade: 1,
      topic: 'lesen',
      startedAt: 0,
      durationMs: 0,
      total: tasks.length,
      tasks: tasks.map((t) => ({ ...t, itemKey: 'x', wrongAttempts: 0, revealed: false })),
      stars: 0,
      crown: false,
      completed: true,
    })
    const rates = categoryRates([
      session([
        { entryId: 'k1.lesen.reimen', star: true },
        { entryId: 'k1.lesen.silben-hoeren', star: false },
        { entryId: 'k1.lesen.wort-bild', star: true },
      ]),
    ])
    expect(rates.find((r) => r.category === 'lesen.hoeren')).toMatchObject({ tasks: 2, rate: 0.5 })
    expect(rates.find((r) => r.category === 'lesen.woerter')).toMatchObject({ tasks: 1, rate: 1 })
  })
})
