/**
 * Offline letter recognition with the $P point-cloud recognizer
 * (Vatavu, Anthony & Wobbrock 2012). The finger trace is resampled, scaled and
 * centred, then compared with the stroke templates of our handwriting.
 * Stroke order and direction do not matter – good for children's writing.
 * Pure functions, no DOM.
 */
import { strokePoints, type Glyph, type Point } from './strokes'

export interface CloudPoint extends Point {
  /** Stroke number (for resampling; the matching itself ignores it). */
  id: number
}

/** Points per cloud – 32 is the recommended trade-off of the $P paper. */
export const CLOUD_SIZE = 32

function pathLength(points: readonly CloudPoint[]): number {
  let d = 0
  for (let i = 1; i < points.length; i++) {
    if (points[i]!.id === points[i - 1]!.id) {
      d += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y)
    }
  }
  return d
}

/** Evenly spaced points along all strokes (jumps between strokes are not walked). */
export function resample(points: readonly CloudPoint[], n = CLOUD_SIZE): CloudPoint[] {
  if (points.length === 0) return []
  const total = pathLength(points)
  // Only dots (e.g. a single tap): spread the points equally over them.
  if (total === 0) return Array.from({ length: n }, (_, i) => ({ ...points[i % points.length]! }))
  const step = total / (n - 1)
  const src = points.map((p) => ({ ...p }))
  const result: CloudPoint[] = [{ ...src[0]! }]
  let walked = 0
  for (let i = 1; i < src.length; i++) {
    const a = src[i - 1]!
    const b = src[i]!
    if (a.id !== b.id) continue
    const d = Math.hypot(b.x - a.x, b.y - a.y)
    if (walked + d >= step && d > 0) {
      const t = (step - walked) / d
      const q = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y), id: a.id }
      result.push(q)
      src.splice(i, 0, q) // q becomes the next start
      walked = 0
    } else {
      walked += d
    }
  }
  while (result.length < n) result.push({ ...src[src.length - 1]! })
  return result.slice(0, n)
}

/** Scale to the unit box (keeping proportions) and move the centroid to (0, 0). */
export function normalize(points: readonly CloudPoint[]): CloudPoint[] {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1
  const scaled = points.map((p) => ({
    ...p,
    x: (p.x - Math.min(...xs)) / size,
    y: (p.y - Math.min(...ys)) / size,
  }))
  const cx = scaled.reduce((s, p) => s + p.x, 0) / scaled.length
  const cy = scaled.reduce((s, p) => s + p.y, 0) / scaled.length
  return scaled.map((p) => ({ ...p, x: p.x - cx, y: p.y - cy }))
}

/** Points reserved for every dot (i-dot, umlaut dots, a quick tap). */
const DOT_POINTS = 3

const strokeLength = (stroke: readonly Point[]) => {
  let d = 0
  for (let i = 1; i < stroke.length; i++) {
    d += Math.hypot(stroke[i]!.x - stroke[i - 1]!.x, stroke[i]!.y - stroke[i - 1]!.y)
  }
  return d
}

/**
 * Point cloud of a letter. Dots and very short strokes (< 8 % of the total length)
 * get points of their own – otherwise resampling would skip them and "i" would look
 * like "l".
 */
export function toCloud(strokes: readonly (readonly Point[])[]): CloudPoint[] {
  const nonEmpty = strokes.filter((s) => s.length > 0)
  const total = nonEmpty.reduce((sum, s) => sum + strokeLength(s), 0)
  const isDot = (s: readonly Point[]) => total === 0 || strokeLength(s) < total * 0.08
  const dots = nonEmpty.filter(isDot)
  const lines = nonEmpty.filter((s) => !isDot(s))
  const linePoints = lines.flatMap((stroke, id) => stroke.map((p) => ({ x: p.x, y: p.y, id })))
  const dotPoints = dots.flatMap((stroke, k) => {
    const c = stroke[Math.floor(stroke.length / 2)]!
    return Array.from({ length: DOT_POINTS }, () => ({ x: c.x, y: c.y, id: lines.length + k }))
  })
  const budget = Math.max(CLOUD_SIZE - dotPoints.length, 8)
  return normalize([...(linePoints.length > 0 ? resample(linePoints, budget) : []), ...dotPoints])
}

function cloudDistance(a: readonly CloudPoint[], b: readonly CloudPoint[], start: number): number {
  const matched = new Array<boolean>(a.length).fill(false)
  let sum = 0
  let i = start
  do {
    let min = Infinity
    let index = -1
    for (let j = 0; j < b.length; j++) {
      if (matched[j]) continue
      const d = Math.hypot(a[i]!.x - b[j]!.x, a[i]!.y - b[j]!.y)
      if (d < min) {
        min = d
        index = j
      }
    }
    if (index >= 0) matched[index] = true
    // Early matches weigh more (as in $P).
    const weight = 1 - ((i - start + a.length) % a.length) / a.length
    sum += weight * min
    i = (i + 1) % a.length
  } while (i !== start)
  return sum
}

/** $P greedy cloud match: lower = more similar. */
export function greedyMatch(a: readonly CloudPoint[], b: readonly CloudPoint[]): number {
  const step = Math.floor(Math.sqrt(a.length))
  let min = Infinity
  for (let i = 0; i < a.length; i += step) {
    min = Math.min(min, cloudDistance(a, b, i), cloudDistance(b, a, i))
  }
  return min
}

/** A template: the point cloud plus where the letter sits on the school lines. */
export interface Template {
  cloud: CloudPoint[]
  top: number
  bottom: number
}

/** Vertical extent (top/bottom y) of strokes in line coordinates (top line 0, base line 100). */
function extent(strokes: readonly (readonly Point[])[]): { top: number; bottom: number } {
  const ys = strokes.flatMap((s) => s.map((p) => p.y))
  return { top: Math.min(...ys), bottom: Math.max(...ys) }
}

export function glyphTemplate(glyph: Glyph): Template {
  const strokes = glyph.strokes.map((s) => strokePoints(s))
  return { cloud: toCloud(strokes), ...extent(strokes) }
}

/**
 * Where a letter sits on the lines is the information $P throws away (it normalises
 * size): small a lives between middle and base line, l reaches the top line, g the
 * bottom line. Deviations up to ZONE_SLACK are free – children write wobbly.
 */
export const ZONE_SLACK = 15
export const ZONE_WEIGHT = 1.5

export function zonePenalty(input: { top: number; bottom: number }, t: Template): number {
  const off = (d: number) => Math.max(0, Math.abs(d) - ZONE_SLACK)
  return (ZONE_WEIGHT * (off(input.top - t.top) + off(input.bottom - t.bottom))) / 100
}

export interface Match {
  char: string
  distance: number
}

/** All candidates, best match first. Strokes must be in line coordinates. */
export function recognize(
  strokes: readonly (readonly Point[])[],
  templates: ReadonlyMap<string, Template>,
): Match[] {
  const cloud = toCloud(strokes)
  const zone = extent(strokes)
  return [...templates]
    .map(([char, t]) => ({ char, distance: greedyMatch(cloud, t.cloud) + zonePenalty(zone, t) }))
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Distance (point cloud + line position) below which a letter counts as written.
 * Calibrated with simulated handwriting vs. scribbles (zigzags, loops, random strokes):
 * about 90 % of wobbly real letters are accepted, a scribble only rarely – and only if
 * it looks most like exactly the requested letter. The parents' setting scales it
 * (1.25 easy, 0.8 strict).
 */
export const ACCEPT_DISTANCE = 1.6

export type Verdict = 'erkannt' | 'unsicher'

/** Recognised = the target is the best match and close enough. */
export function judge(matches: readonly Match[], target: string, tolerance = 1): Verdict {
  const best = matches[0]
  return best?.char === target && best.distance <= ACCEPT_DISTANCE * tolerance
    ? 'erkannt'
    : 'unsicher'
}
