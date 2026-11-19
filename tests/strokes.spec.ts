import { describe, expect, it } from 'vitest'
import {
  BASE_TOLERANCE,
  SCRIPTS,
  StrokeTracer,
  checkpoints,
  distance,
  distanceToPolyline,
  glyphFor,
  glyphProblems,
  lettersNeeded,
  polylineLength,
  prepareStrokes,
  segmentPoints,
  strokePoints,
  type Point,
} from '@/core/strokes'
import { LETTERS } from '@/core/words'

const script = SCRIPTS.druckschrift!

describe('Geometrie', () => {
  it('tastet Linien und Bögen ab', () => {
    const line = segmentPoints({ l: [0, 0, 0, 100] })
    expect(line[0]).toEqual({ x: 0, y: 0 })
    expect(line.at(-1)).toEqual({ x: 0, y: 100 })
    const half = segmentPoints({ a: [0, 0, 10, 10, 180, 360] })
    expect(half[0]!.x).toBeCloseTo(-10)
    expect(half.at(-1)!.x).toBeCloseTo(10)
    // 180 → 360 runs through 270 = top (y = -10)
    expect(Math.min(...half.map((p) => p.y))).toBeCloseTo(-10, 0)
  })

  it('verteilt Kontrollpunkte gleichmäßig inklusive Anfang und Ende', () => {
    const pts = strokePoints([{ l: [0, 0, 0, 120] }])
    const cps = checkpoints(pts, 12)
    expect(cps).toHaveLength(11)
    expect(cps[0]).toEqual({ x: 0, y: 0 })
    expect(cps.at(-1)).toEqual({ x: 0, y: 120 })
    for (let i = 1; i < cps.length; i++) expect(distance(cps[i - 1]!, cps[i]!)).toBeCloseTo(12, 0)
  })

  it('misst Abstände zu einer Linie', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]
    expect(distanceToPolyline({ x: 50, y: 7 }, pts)).toBeCloseTo(7)
    expect(distanceToPolyline({ x: -3, y: 4 }, pts)).toBeCloseTo(5)
    expect(polylineLength(pts)).toBe(100)
  })
})

describe('Druckschrift-Vorlagen', () => {
  it('hat jeden Buchstaben aus letters.json groß und klein', () => {
    for (const ch of lettersNeeded(LETTERS.map((l) => l.id))) {
      expect(script.glyphs[ch], ch).toBeDefined()
    }
  })

  it('hat zusammenhängende Striche innerhalb der Lineatur', () => {
    for (const [ch, glyph] of Object.entries(script.glyphs)) {
      expect(glyphProblems(glyph), ch).toEqual([])
    }
  })

  it('setzt Mehrgraphe aus Einzelbuchstaben zusammen', () => {
    const sch = glyphFor(script, 'Sch')!
    const s = script.glyphs.S!
    const c = script.glyphs.c!
    const h = script.glyphs.h!
    expect(sch.strokes).toHaveLength(s.strokes.length + c.strokes.length + h.strokes.length)
    expect(sch.w).toBeGreaterThan(s.w + c.w + h.w)
    expect(glyphProblems(sch)).toEqual([])
  })
})

/** Moves a finger along the stroke points; returns what the tracer says. */
function trace(tracer: StrokeTracer, path: Point[]): string {
  if (!tracer.start(path[0]!)) return 'no-start'
  for (const p of path.slice(1)) {
    const r = tracer.move(p)
    if (r !== 'continue') return r
  }
  return tracer.end() ? 'done' : 'incomplete'
}

describe('Nachspuren', () => {
  const [stem] = prepareStrokes(script.glyphs.l!)
  const tolerance = BASE_TOLERANCE

  it('erkennt einen sauber nachgefahrenen Strich', () => {
    expect(trace(new StrokeTracer(stem!, tolerance), stem!.points)).toBe('done')
  })

  it('verzeiht kleines Wackeln', () => {
    const wobbly = stem!.points.map((p, i) => ({ x: p.x + (i % 2 ? 5 : -5), y: p.y }))
    expect(trace(new StrokeTracer(stem!, tolerance), wobbly)).toBe('done')
  })

  it('lehnt die falsche Richtung ab (Start am Ende)', () => {
    const backwards = [...stem!.points].reverse()
    expect(trace(new StrokeTracer(stem!, tolerance), backwards)).toBe('no-start')
  })

  it('bricht ab, wenn der Finger die Linie verlässt', () => {
    const away = [...stem!.points.slice(0, 10), { x: 60, y: 30 }]
    expect(trace(new StrokeTracer(stem!, tolerance), away)).toBe('off-path')
  })

  it('zählt einen halben Strich nicht', () => {
    const half = stem!.points.slice(0, Math.floor(stem!.points.length / 2))
    expect(trace(new StrokeTracer(stem!, tolerance), half)).toBe('incomplete')
  })

  it('verlangt beim O die Richtung gegen den Uhrzeigersinn', () => {
    const [ring] = prepareStrokes(script.glyphs.O!)
    expect(trace(new StrokeTracer(ring!, tolerance), ring!.points)).toBe('done')
    // Same start point, but clockwise: the second checkpoint is never reached in order.
    const clockwise = [ring!.points[0]!, ...[...ring!.points].reverse()]
    expect(trace(new StrokeTracer(ring!, tolerance), clockwise)).not.toBe('done')
  })

  it('braucht für den i-Punkt nur einen Tipp', () => {
    const strokes = prepareStrokes(script.glyphs.i!)
    const dot = strokes[1]!
    expect(dot.isDot).toBe(true)
    const tracer = new StrokeTracer(dot, tolerance)
    expect(tracer.start(dot.points[0]!)).toBe(true)
    expect(tracer.end()).toBe(true)
  })
})
