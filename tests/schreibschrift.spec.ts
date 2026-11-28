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
  type Segment,
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
        expect(glyphProblems(g, 0.6, script.neigung), word).toEqual([])
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
          expect(end.x, word).toBeLessThanOrEqual(g.w)
          expect(end.y, word).toBeCloseTo(script.glyphs[word.at(-1)!]!.aus!)
        }
      }
    })
  }

  it('SAS ist nach rechts geneigt wie auf dem Schulplakat, VA steht gerade', () => {
    expect(SCRIPTS.schulausgangsschrift!.neigung).toBeGreaterThan(0.2)
    expect(SCRIPTS['vereinfachte-ausgangsschrift']!.neigung).toBeUndefined()
    // The stem of the d leans right: its top is further right than its foot.
    const d = strokePoints(SCRIPTS.schulausgangsschrift!.glyphs.d!.strokes[0]!)
    const top = d.reduce((a, b) => (b.y < a.y ? b : a))
    const foot = d.filter((p) => p.y > 95).reduce((a, b) => (b.x > a.x ? b : a))
    expect(top.x).toBeGreaterThan(foot.x - 30 + 20)
  })

  it('SAS-Großbuchstaben in Schreibschrift-Form', () => {
    const g = SCRIPTS.schulausgangsschrift!.glyphs
    // A in one stroke plus the bar, M and N in one stroke, the poster's E is rounded.
    expect(g.A!.strokes).toHaveLength(2)
    expect(g.M!.strokes).toHaveLength(1)
    expect(g.N!.strokes).toHaveLength(1)
    expect(g.E!.strokes).toHaveLength(1)
  })

  it('Wörter fließen: an keiner Verbindung ein Knick', () => {
    // Direction of a segment where it starts or ends.
    const dir = (seg: Segment, end: boolean): [number, number] => {
      if ('c' in seg) {
        const c = seg.c
        return end ? [c[6] - c[4], c[7] - c[5]] : [c[2] - c[0], c[3] - c[1]]
      }
      if ('l' in seg) return [seg.l[2] - seg.l[0], seg.l[3] - seg.l[1]]
      const pts = segmentPoints(seg)
      const [p, q] = end ? [pts.at(-2)!, pts.at(-1)!] : [pts[0]!, pts[1]!]
      return [q.x - p.x, q.y - p.y]
    }
    const turn = (a: [number, number], b: [number, number]) => {
      const d = Math.abs(Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0])) * (180 / Math.PI)
      return Math.min(d, 360 - d)
    }
    for (const key of ['va', 'sas'] as const) {
      const script = SCRIPTS[SCHREIBSCHRIFTEN[key].id]!
      for (const word of ['eine', 'sieben', 'bin', 'ich', 'Garten', 'vor', 'wir', 'Bob', 'Wolke']) {
        const strokes = glyphFor(script, word)!.strokes
        // At every joint (one letter ends, the next begins) the line goes on smoothly.
        const isJoint = (seg: Segment, at: number, ch: string) => {
          const p = segmentPoints(seg)[0]!
          return Math.abs(p.x - at) < 0.6 && Math.abs(p.y - script.glyphs[ch]!.aus!) < 0.6
        }
        let x = word[0] === word[0]!.toLowerCase() ? 0 : script.glyphs[word[0]!]!.w + 16
        for (const ch of word.slice(word[0] === word[0]!.toLowerCase() ? 0 : 1, -1)) {
          x += script.glyphs[ch]!.w
          const main = strokes.find((st) => st.some((seg) => isJoint(seg, x, ch)))!
          const i = main ? main.findIndex((seg) => isJoint(seg, x, ch)) : -1
          expect(i, `${key} ${word}: Verbindung nach ${ch}`).toBeGreaterThan(0)
          expect(
            turn(dir(main[i - 1]!, true), dir(main[i]!, false)),
            `${key} ${word}: nach ${ch}`,
          ).toBeLessThan(5)
        }
      }
    }
  })

  it('die beiden Schriften unterscheiden sich in der Verbindung', () => {
    const va = SCRIPTS['vereinfachte-ausgangsschrift']!.glyphs.n!
    const sas = SCRIPTS.schulausgangsschrift!.glyphs.n!
    expect(va.ein).toBe(50)
    expect(sas.ein).toBe(90)
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
