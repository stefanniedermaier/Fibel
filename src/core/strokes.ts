/**
 * Stroke templates for tracing letters: geometry, composing letters into a
 * multigraph (Sch = S + c + h) and the tracing check. Pure functions, no DOM.
 */
import druckschrift from '@/data/schriften/druckschrift/strokes.json'

export interface Point {
  x: number
  y: number
}

export type Segment =
  | { l: [number, number, number, number] }
  | { a: [number, number, number, number, number, number] }
  | { p: [number, number] }

export type Stroke = Segment[]

export interface Glyph {
  w: number
  strokes: Stroke[]
}

export interface Script {
  id: string
  name: string
  glyphs: Record<string, Glyph>
}

/** The four school lines (top, middle, base line, bottom). */
export const LINES = { top: 0, middle: 50, base: 100, bottom: 140 } as const
/** Gap between letters of a multigraph. */
export const LETTER_GAP = 16

export const SCRIPTS: Record<string, Script> = {
  druckschrift: druckschrift as unknown as Script,
}

// --- Geometry ------------------------------------------------------------------

const rad = (deg: number) => (deg * Math.PI) / 180

/** Points along a segment, roughly every `step` units. */
export function segmentPoints(segment: Segment, step = 2): Point[] {
  if ('p' in segment) return [{ x: segment.p[0], y: segment.p[1] }]
  if ('l' in segment) {
    const [x1, y1, x2, y2] = segment.l
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step))
    return Array.from({ length: n + 1 }, (_, i) => ({
      x: x1 + ((x2 - x1) * i) / n,
      y: y1 + ((y2 - y1) * i) / n,
    }))
  }
  const [cx, cy, rx, ry, from, to] = segment.a
  const approxLength = (Math.abs(to - from) / 360) * Math.PI * (rx + ry)
  const n = Math.max(2, Math.ceil(approxLength / step))
  return Array.from({ length: n + 1 }, (_, i) => {
    const angle = rad(from + ((to - from) * i) / n)
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) }
  })
}

export function strokePoints(stroke: Stroke, step = 2): Point[] {
  const points: Point[] = []
  for (const segment of stroke) {
    const pts = segmentPoints(segment, step)
    // Skip the first point of a following segment (it is the previous end point).
    points.push(...(points.length > 0 ? pts.slice(1) : pts))
  }
  return points
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function polylineLength(points: readonly Point[]): number {
  let length = 0
  for (let i = 1; i < points.length; i++) length += distance(points[i - 1]!, points[i]!)
  return length
}

/** Evenly spaced checkpoints along a polyline (always including start and end). */
export function checkpoints(points: readonly Point[], spacing = 12): Point[] {
  if (points.length <= 1) return [...points]
  const total = polylineLength(points)
  const n = Math.max(1, Math.round(total / spacing))
  const result: Point[] = [points[0]!]
  let target = total / n
  let walked = 0
  for (let i = 1; i < points.length && result.length < n; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    const seg = distance(a, b)
    while (seg > 0 && walked + seg >= target && result.length < n) {
      const t = (target - walked) / seg
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
      target += total / n
    }
    walked += seg
  }
  result.push(points[points.length - 1]!)
  return result
}

/** Shortest distance from a point to a polyline. */
export function distanceToPolyline(p: Point, points: readonly Point[]): number {
  if (points.length === 1) return distance(p, points[0]!)
  let best = Infinity
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len2 = dx * dx + dy * dy
    const t =
      len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2))
    best = Math.min(best, distance(p, { x: a.x + dx * t, y: a.y + dy * t }))
  }
  return best
}

// --- Letters -------------------------------------------------------------------

function shift(segment: Segment, dx: number): Segment {
  if ('p' in segment) return { p: [segment.p[0] + dx, segment.p[1]] }
  if ('l' in segment) {
    const [x1, y1, x2, y2] = segment.l
    return { l: [x1 + dx, y1, x2 + dx, y2] }
  }
  const [cx, cy, rx, ry, from, to] = segment.a
  return { a: [cx + dx, cy, rx, ry, from, to] }
}

/**
 * The glyph for a written unit, e.g. "M", "m", "Sch", "ei": multigraphs are composed
 * from their letters, side by side. Returns undefined if a letter has no template.
 */
export function glyphFor(script: Script, text: string): Glyph | undefined {
  const glyphs = [...text].map((ch) => script.glyphs[ch])
  if (glyphs.some((g) => !g)) return undefined
  const strokes: Stroke[] = []
  let x = 0
  for (const g of glyphs as Glyph[]) {
    strokes.push(...g.strokes.map((s) => s.map((seg) => shift(seg, x))))
    x += g.w + LETTER_GAP
  }
  return { w: x - LETTER_GAP, strokes }
}

/** Upper-case form of a grapheme as it is written at the start of a word ("sch" → "Sch"). */
export function upperForm(grapheme: string): string {
  return grapheme.charAt(0).toUpperCase() + grapheme.slice(1)
}

/** All single letters a script must provide for the given graphemes. */
export function lettersNeeded(ids: readonly string[]): string[] {
  const chars = new Set<string>()
  for (const id of ids) {
    for (const form of [id, upperForm(id)]) for (const ch of form) chars.add(ch)
  }
  return [...chars]
}

/** Problems in a glyph: gaps inside a stroke or points outside the four lines. */
export function glyphProblems(glyph: Glyph, tolerance = 0.6): string[] {
  const problems: string[] = []
  glyph.strokes.forEach((stroke, i) => {
    if (stroke.length === 0) problems.push(`Strich ${i + 1} ist leer`)
    for (let s = 1; s < stroke.length; s++) {
      const end = segmentPoints(stroke[s - 1]!).at(-1)!
      const start = segmentPoints(stroke[s]!)[0]!
      if (distance(end, start) > tolerance) {
        problems.push(`Strich ${i + 1}: Lücke zwischen Teil ${s} und ${s + 1}`)
      }
    }
    for (const p of strokePoints(stroke)) {
      if (p.y < -25 || p.y > LINES.bottom + 5 || p.x < -6 || p.x > glyph.w + 6) {
        problems.push(`Strich ${i + 1}: Punkt (${p.x.toFixed(0)}, ${p.y.toFixed(0)}) außerhalb`)
        break
      }
    }
  })
  return problems
}

// --- Tracing -------------------------------------------------------------------

/** Base tolerance in template units (≈ 1/5 of the x-height); scaled by the setting. */
export const BASE_TOLERANCE = 11

export interface TraceStroke {
  points: Point[]
  checkpoints: Point[]
  isDot: boolean
}

export function prepareStrokes(glyph: Glyph): TraceStroke[] {
  return glyph.strokes.map((stroke) => {
    const points = strokePoints(stroke)
    const isDot = stroke.length === 1 && 'p' in stroke[0]!
    return { points, checkpoints: isDot ? points : checkpoints(points), isDot }
  })
}

export type TraceResult = 'continue' | 'off-path' | 'done'

/**
 * Follows one stroke: the finger must start near the start point, stay near the
 * line and pass all checkpoints in order. Going backwards does not count.
 */
export class StrokeTracer {
  private next = 1
  readonly trail: Point[] = []

  constructor(
    readonly stroke: TraceStroke,
    readonly tolerance: number,
  ) {}

  /** Finger down. False if it is not near the start point. */
  start(p: Point): boolean {
    const first = this.stroke.checkpoints[0]!
    const ok = distance(p, first) <= this.tolerance * 1.6
    if (ok) {
      this.trail.length = 0
      this.trail.push(p)
      this.next = 1
    }
    return ok
  }

  move(p: Point): TraceResult {
    this.trail.push(p)
    if (this.stroke.isDot) return 'done'
    if (distanceToPolyline(p, this.stroke.points) > this.tolerance * 1.8) return 'off-path'
    const cps = this.stroke.checkpoints
    // Advance over every checkpoint the finger is close to (fast fingers skip samples).
    while (this.next < cps.length && distance(p, cps[this.next]!) <= this.tolerance) this.next++
    return this.next >= cps.length ? 'done' : 'continue'
  }

  /** Finger up: done only if every checkpoint was reached. */
  end(): boolean {
    return this.stroke.isDot ? this.trail.length > 0 : this.next >= this.stroke.checkpoints.length
  }

  get progress(): number {
    return this.stroke.isDot ? 0 : (this.next - 1) / Math.max(1, this.stroke.checkpoints.length - 1)
  }
}
