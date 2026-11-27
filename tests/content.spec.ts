import { describe, expect, it } from 'vitest'
import {
  BASE_CATALOG,
  DEFAULT_LAND,
  LAENDER,
  OVERLAYS,
  applyOverlay,
  resolveCatalog,
  resolveDefaults,
  visibleGrades,
} from '@/core/content'
import type { CatalogEntry, Profile } from '@/core/types'
import { getExercise } from '@/exercises/registry'

const entry = (id: string, grade = 1): CatalogEntry => ({
  id,
  grade,
  topic: 'rechnen',
  category: 'rechnen.zahlen',
  unit: 'k1.rechnen.zahlen-10',
  exercise: 'rechnen.mengen',
  params: { max: 10, extra: 1 },
  title: id,
})

describe('Länderliste', () => {
  it('enthält alle 16 Länder, aktiv ist in Version 1 nur Bayern', () => {
    expect(LAENDER).toHaveLength(16)
    expect(LAENDER.filter((l) => l.enabled).map((l) => l.code)).toEqual(['DE-BY'])
    expect(DEFAULT_LAND).toBe('DE-BY')
  })

  it('kennt die sechsjährige Grundschule in Berlin und Brandenburg', () => {
    expect(LAENDER.find((l) => l.code === 'DE-BE')?.grades).toHaveLength(6)
    expect(LAENDER.find((l) => l.code === 'DE-BB')?.grades).toHaveLength(6)
  })

  it('hat für jedes aktive Land eine gültige Anpassung', () => {
    for (const land of LAENDER.filter((l) => l.enabled)) {
      expect(OVERLAYS[land.code], land.code).toBeDefined()
      expect(() => resolveCatalog(land.code)).not.toThrow()
    }
  })
})

describe('applyOverlay', () => {
  const base = [entry('a'), entry('b'), entry('c')]

  it('entfernt, ändert und ergänzt Einträge', () => {
    const result = applyOverlay(base, {
      land: 'DE-XX',
      catalog: {
        remove: ['a'],
        patch: { b: { grade: 2, params: { max: 20 } } },
        add: [entry('d')],
      },
    })
    expect(result.map((e) => e.id)).toEqual(['b', 'c', 'd'])
    const b = result.find((e) => e.id === 'b')
    expect(b?.grade).toBe(2)
    // Params are merged, not replaced.
    expect(b?.params).toEqual({ max: 20, extra: 1 })
  })

  it('verändert den Basis-Katalog nicht', () => {
    applyOverlay(base, { land: 'DE-XX', catalog: { patch: { a: { grade: 3 } } } })
    expect(base[0]?.grade).toBe(1)
  })

  it('meldet Verweise ins Leere und doppelte IDs', () => {
    expect(() => applyOverlay(base, { land: 'DE-XX', catalog: { remove: ['zz'] } })).toThrow(/zz/)
    expect(() => applyOverlay(base, { land: 'DE-XX', catalog: { add: [entry('a')] } })).toThrow(
      /existiert/,
    )
  })
})

describe('Basis-Katalog', () => {
  it('verweist nur auf registrierte Übungen mit eindeutigen IDs', () => {
    const ids = new Set<string>()
    for (const e of BASE_CATALOG) {
      expect(getExercise(e.exercise), e.id).toBeDefined()
      expect(ids.has(e.id), `doppelt: ${e.id}`).toBe(false)
      ids.add(e.id)
    }
  })
})

describe('Startwerte', () => {
  it('setzt Klasse 1 mit Buchstaben-Filter und Zahlenraum 10 auf', () => {
    const s = resolveDefaults('DE-BY', 1)
    expect(s.letterFilter).toBe(true)
    expect(s.numberRange).toBe(10)
    expect(s.tasksPerUnit).toBe(8)
    expect(s.crownRatio).toBe(0.75)
  })

  it('setzt Klasse 2 mit allen Buchstaben und Zahlenraum 100 auf', () => {
    const s = resolveDefaults('DE-BY', 2)
    expect(s.letterFilter).toBe(false)
    expect(s.numberRange).toBe(100)
  })

  it('liefert unabhängige Kopien', () => {
    const a = resolveDefaults('DE-BY', 1)
    a.letters.push('x')
    expect(resolveDefaults('DE-BY', 1).letters).not.toContain('x')
  })
})

describe('visibleGrades', () => {
  const profile = (grade: number, land = 'DE-BY'): Profile => ({
    id: 'p',
    name: 'Kind',
    avatar: '1F98A',
    land,
    grade,
    createdAt: 0,
  })

  it('zeigt die Klassen darunter und nur freigeschaltete höhere', () => {
    const settings = { ...resolveDefaults('DE-BY', 3), unlockedGrades: [4] }
    expect(visibleGrades(profile(3), settings)).toEqual({ own: 3, lower: [1, 2], higher: [4] })
  })

  it('zeigt ohne Freischaltung keine höheren Klassen', () => {
    expect(visibleGrades(profile(1), resolveDefaults('DE-BY', 1))).toEqual({
      own: 1,
      lower: [],
      higher: [],
    })
  })

  it('ignoriert Klassen, die es im Land nicht gibt', () => {
    const settings = { ...resolveDefaults('DE-BY', 4), unlockedGrades: [5, 6] }
    expect(visibleGrades(profile(4), settings).higher).toEqual([])
    expect(visibleGrades(profile(4, 'DE-BE'), settings).higher).toEqual([5, 6])
  })
})
