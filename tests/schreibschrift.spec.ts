import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import {
  SCHREIBSCHRIFTEN,
  SCRIPTS,
  glyphFor,
  glyphProblems,
  segmentPoints,
  strokePoints,
} from '@/core/strokes'
import { VERBINDUNGEN, nachspuren } from '@/exercises/schreiben/nachspuren'

const KLEIN = [...'abcdefghijklmnopqrstuvwxyzäöüß']

describe('Verbundene Schrift (VA und SAS)', () => {
  for (const key of ['va', 'sas'] as const) {
    const script = SCRIPTS[SCHREIBSCHRIFTEN[key].id]!

    it(`${key}: jeder Kleinbuchstabe hat Ein- und Ausstieg am Rand`, () => {
      expect(script.verbunden).toBe(true)
      for (const ch of KLEIN) {
        const g = script.glyphs[ch]!
        expect(g.ein, ch).toBeDefined()
        expect(g.aus, ch).toBeDefined()
        const main = strokePoints(g.strokes[0]!)
        expect(main[0]!.x, ch).toBeCloseTo(0)
        expect(main[0]!.y, ch).toBeCloseTo(g.ein!)
        expect(main.at(-1)!.x, ch).toBeCloseTo(g.w)
        expect(main.at(-1)!.y, ch).toBeCloseTo(g.aus!)
      }
    })

    it(`${key}: Wörter werden in einem Zug geschrieben, ohne Lücken`, () => {
      for (const word of ['eine', 'sieben', 'Wolke', 'Bub', 'schön', 'Straße', ...VERBINDUNGEN]) {
        const g = glyphFor(script, word)!
        expect(glyphProblems(g), word).toEqual([])
        // Capitals stand alone, all small letters form one main stroke; the rest are
        // dots and crosses.
        const capitals = [...word].filter((c) => c !== c.toLowerCase()).length
        const mains = g.strokes.filter(
          (s) => strokePoints(s).length > 1 && s.length > 2 && !(s.length === 1 && 'p' in s[0]!),
        )
        expect(mains.length, word).toBeGreaterThanOrEqual(1)
        if (capitals === 0) {
          const first = g.strokes[0]!
          const end = segmentPoints(first.at(-1)!).at(-1)!
          expect(end.x, word).toBeCloseTo(g.w)
        }
      }
    })
  }

  it('die beiden Schriften unterscheiden sich in der Verbindung', () => {
    const va = SCRIPTS['vereinfachte-ausgangsschrift']!.glyphs.n!
    const sas = SCRIPTS.schulausgangsschrift!.glyphs.n!
    expect(va.ein).toBe(50)
    expect(sas.ein).toBe(100)
  })

  it('Nachspuren nimmt die Schrift aus dem Elternbereich', () => {
    for (const schrift of [null, 'va', 'sas'] as const) {
      const settings = { ...resolveDefaults('DE-BY', 2), schreibschrift: schrift }
      const ctx = { land: 'DE-BY', grade: 2, settings }
      for (const verbunden of ['klein', 'gross', 'verbindungen', 'woerter'] as const) {
        const keys = nachspuren.items(ctx, { verbunden })
        expect(keys.length, verbunden).toBeGreaterThan(5)
        const t = nachspuren.generate(ctx, { verbunden }, keys[0]!, createRng(1))
        expect(t.solution).toContain(schrift === 'sas' ? 'Schulausgangsschrift' : 'Vereinfachte')
      }
    }
  })
})
