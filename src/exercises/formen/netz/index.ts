/**
 * F3-3 "Würfelnetze" (Mathematik 3/4, 2.1 and 2.2: gedankliches Falten von Netzen).
 * - `ist-netz`: Is this a cube net? (all 11 nets and shapes that overlap when folded)
 * - `gegenueber`: one square is coloured – tap the square that lies opposite.
 * Folding is computed by rolling a cube over the squares, so the answers are exact.
 */
import { pickOne, shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import NetzTask from './NetzTask.vue'

/** A net as rows of '#' (square) and '.' (empty). */
export type Netz = readonly string[]

export const NETZE: Record<string, Netz> = {
  // The 11 cube nets.
  n1: ['#...', '####', '#...'],
  n2: ['#...', '####', '.#..'],
  n3: ['#...', '####', '..#.'],
  n4: ['#...', '####', '...#'],
  n5: ['.#..', '####', '.#..'],
  n6: ['.#..', '####', '..#.'],
  n7: ['##..', '.###', '.#..'],
  n8: ['##..', '.###', '..#.'],
  n9: ['##..', '.###', '...#'],
  n10: ['##...', '.##..', '..##.'],
  n11: ['###..', '..###'],
  // Six squares that are no cube net.
  x1: ['######'],
  x2: ['####', '##..'],
  x3: ['###', '###'],
  x4: ['#....', '#####'],
  x5: ['.##.', '####'],
  x6: ['#.#.', '####'],
  x7: ['###', '#..', '#..', '#..'],
  x8: ['#...', '#...', '####'],
}

type Cell = [number, number]
const cells = (n: Netz): Cell[] =>
  n.flatMap((row, r) => [...row].flatMap((c, col) => (c === '#' ? [[r, col] as Cell] : [])))

type Face = 'unten' | 'oben' | 'nord' | 'sued' | 'ost' | 'west'
type Cube = Record<Face, number>

function roll(c: Cube, dr: number, dc: number): Cube {
  if (dc === 1) return { ...c, unten: c.ost, ost: c.oben, oben: c.west, west: c.unten }
  if (dc === -1) return { ...c, unten: c.west, west: c.oben, oben: c.ost, ost: c.unten }
  if (dr === 1) return { ...c, unten: c.sued, sued: c.oben, oben: c.nord, nord: c.unten }
  return { ...c, unten: c.nord, nord: c.oben, oben: c.sued, sued: c.unten }
}

/**
 * Folds the net: for every square the cube face (0–5) it becomes. Undefined when two
 * squares land on the same face – then it is no cube net.
 */
export function falten(n: Netz): Map<string, number> | undefined {
  const list = cells(n)
  if (list.length !== 6) return undefined
  const key = (r: number, c: number) => `${r},${c}`
  const has = new Set(list.map(([r, c]) => key(r, c)))
  const faceOf = new Map<string, number>()
  const start: Cube = { unten: 0, oben: 1, nord: 2, sued: 3, ost: 4, west: 5 }
  const queue: [number, number, Cube][] = [[list[0]![0], list[0]![1], start]]
  faceOf.set(key(list[0]![0], list[0]![1]), 0)
  while (queue.length) {
    const [r, c, cube] = queue.shift()!
    for (const [dr, dc] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      const k = key(r + dr, c + dc)
      if (!has.has(k) || faceOf.has(k)) continue
      const next = roll(cube, dr, dc)
      faceOf.set(k, next.unten)
      queue.push([r + dr, c + dc, next])
    }
  }
  return new Set(faceOf.values()).size === 6 ? faceOf : undefined
}

/** The face opposite to face f of the start cube (0↔1, 2↔3, 4↔5). */
const opposite = (f: number) => (f % 2 === 0 ? f + 1 : f - 1)

export interface NetzParams {
  mode: 'ist-netz' | 'gegenueber'
}

export interface NetzData {
  mode: NetzParams['mode']
  rows: string[]
  /** gegenueber: the coloured square "r,c"; choices are the other squares. */
  marked?: string
  correctKey: string
  choices: { key: string; label?: string }[]
}

export const netze = (valid: boolean) =>
  Object.entries(NETZE).filter(([, n]) => (falten(n) !== undefined) === valid)

export const netz: ExerciseModule<NetzParams, NetzData> = {
  id: 'formen.netz',
  topic: 'formen',

  items(_ctx, params) {
    const list = params.mode === 'ist-netz' ? Object.entries(NETZE) : netze(true)
    return list.map(([id]) => `formen.netz:${params.mode}:${id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const id = itemKey.split(':')[2]!
    const rows = [...NETZE[id]!]
    const folded = falten(rows)
    if (params.mode === 'ist-netz') {
      const ja = folded !== undefined
      return {
        instruction: 'Kann man aus diesem Netz einen Würfel falten?',
        hint: 'Falte in Gedanken: Kein Quadrat darf auf einem anderen landen, und keine Seite darf offen bleiben.',
        solution: ja
          ? 'Ja, das ist ein Würfelnetz.'
          : 'Nein, beim Falten liegen zwei Quadrate aufeinander.',
        data: {
          mode: 'ist-netz',
          rows,
          correctKey: ja ? 'ja' : 'nein',
          choices: [
            { key: 'ja', label: 'Ja 👍' },
            { key: 'nein', label: 'Nein 👎' },
          ],
        },
      }
    }
    const entries = [...folded!.entries()]
    const [marked, face] = pickOne(entries, rng)
    const right = entries.find(([, f]) => f === opposite(face))![0]
    return {
      instruction: 'Falte den Würfel in Gedanken. Welches Quadrat liegt dem bunten gegenüber?',
      hint: 'Zwei Quadrate, die sich berühren, liegen nie gegenüber. Oft liegt eins dazwischen.',
      solution: 'Dieses Quadrat liegt gegenüber.',
      data: {
        mode: 'gegenueber',
        rows,
        marked,
        correctKey: right,
        choices: shuffle(
          entries.filter(([k]) => k !== marked).map(([k]) => ({ key: k })),
          rng,
        ),
      },
    }
  },

  component: NetzTask,
}
