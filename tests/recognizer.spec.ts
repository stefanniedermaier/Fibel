import { describe, expect, it } from 'vitest'
import { createRng, type Rng } from '@/core/random'
import {
  ACCEPT_DISTANCE,
  CLOUD_SIZE,
  glyphTemplate,
  judge,
  recognize,
  resample,
  toCloud,
} from '@/core/recognizer'
import { SCRIPTS, glyphFor, strokePoints, type Point } from '@/core/strokes'

const script = SCRIPTS.druckschrift!
const START = ['a', 'e', 'i', 'o', 'u', 'm', 'l']
const templatesFor = (chars: string[]) =>
  new Map(chars.map((c) => [c, glyphTemplate(glyphFor(script, c)!)]))
const strokesOf = (c: string) => glyphFor(script, c)!.strokes.map((s) => strokePoints(s))

/** Child-like writing: shifted, stretched, slanted, wobbly. */
function distort(strokes: Point[][], rng: Rng, amount: number): Point[][] {
  const sx = 0.7 + rng() * 0.6
  const sy = 0.7 + rng() * 0.6
  const slant = (rng() - 0.5) * 0.4 * amount
  const dx = (rng() - 0.5) * 40
  return strokes.map((s) =>
    s.map((p) => ({
      x: (p.x + p.y * slant) * sx + dx + (rng() - 0.5) * 8 * amount,
      y: p.y * sy + (rng() - 0.5) * 8 * amount,
    })),
  )
}

describe('Punktwolke', () => {
  it('hat immer gleich viele Punkte, auch mit i-Punkt', () => {
    expect(toCloud(strokesOf('m'))).toHaveLength(CLOUD_SIZE)
    expect(toCloud(strokesOf('i'))).toHaveLength(CLOUD_SIZE)
    expect(
      resample(
        [
          { x: 0, y: 0, id: 0 },
          { x: 10, y: 0, id: 0 },
        ],
        5,
      ),
    ).toHaveLength(5)
  })

  it('ist unabhängig von der Breite und der Stelle im Kästchen', () => {
    const wide = strokesOf('m').map((s) => s.map((p) => ({ x: p.x * 1.4 + 30, y: p.y })))
    const result = recognize(wide, templatesFor(START))
    expect(result[0]!.char).toBe('m')
  })

  it('achtet auf die Lage zwischen den Linien (a unten, l bis oben)', () => {
    // An a written from the top line to the base line no longer fits the template well.
    const stretched = strokesOf('a').map((s) => s.map((p) => ({ x: p.x, y: (p.y - 50) * 2 })))
    const normal = recognize(strokesOf('a'), templatesFor(START))[0]!
    const tall = recognize(stretched, templatesFor(START)).find((m) => m.char === 'a')!
    expect(tall.distance).toBeGreaterThan(normal.distance + 0.3)
  })
})

describe('Erkennung', () => {
  it('erkennt die Vorlagen selbst sicher', () => {
    const templates = templatesFor(START)
    for (const c of START) {
      const result = recognize(strokesOf(c), templates)
      expect(judge(result, c), c).toBe('erkannt')
    }
  })

  it('erkennt leicht verwackelte Start-Buchstaben in mindestens 90 % der Fälle', () => {
    const templates = templatesFor(START)
    const rng = createRng(7)
    let ok = 0
    let n = 0
    for (const c of START) {
      for (let k = 0; k < 30; k++) {
        n++
        if (judge(recognize(distort(strokesOf(c), rng, 0.5), templates), c) === 'erkannt') ok++
      }
    }
    expect(ok / n).toBeGreaterThanOrEqual(0.9)
  })

  it('unterscheidet i (mit Punkt) und l', () => {
    const templates = templatesFor(START)
    expect(recognize(strokesOf('i'), templates)[0]!.char).toBe('i')
    expect(recognize(strokesOf('l'), templates)[0]!.char).toBe('l')
  })

  it('nimmt einen falschen Buchstaben nicht an', () => {
    const templates = templatesFor(START)
    expect(judge(recognize(strokesOf('o'), templates), 'm')).toBe('unsicher')
  })

  it('lehnt einen Zickzack ab (Fund aus dem Browser-Test: wurde als U erkannt)', () => {
    const upper = ['M', 'A', 'I', 'O', 'L', 'E', 'U']
    const zigzag = [Array.from({ length: 21 }, (_, k) => ({ x: 10 + k * 4, y: k % 2 ? 120 : 20 }))]
    const matches = recognize(zigzag, templatesFor(upper))
    for (const c of upper) expect(judge(matches, c), c).toBe('unsicher')
  })

  it('lehnt Gekritzel ab', () => {
    const templates = templatesFor(START)
    const rng = createRng(3)
    const scribble = [Array.from({ length: 40 }, () => ({ x: rng() * 100, y: rng() * 100 }))]
    const verdicts = START.map((c) => judge(recognize(scribble, templates), c))
    expect(verdicts.filter((v) => v === 'erkannt').length).toBeLessThanOrEqual(1)
  })

  it('wird mit der Strenge-Einstellung lockerer oder genauer', () => {
    const matches = [{ char: 'm', distance: ACCEPT_DISTANCE * 1.1 }]
    expect(judge(matches, 'm', 1)).toBe('unsicher')
    expect(judge(matches, 'm', 1.25)).toBe('erkannt')
    expect(judge([{ char: 'm', distance: ACCEPT_DISTANCE * 0.9 }], 'm', 0.8)).toBe('unsicher')
  })
})
