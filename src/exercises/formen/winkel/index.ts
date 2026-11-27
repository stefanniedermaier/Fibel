/**
 * F3-1 "Rechter Winkel" (Mathematik 3/4, 2.2).
 * - `winkel`: three angles, one of them a right angle – tap it.
 * - `figur`: which figure has only right angles (Rechteck, Quadrat) – among a
 *   parallelogram, a rhombus, a trapezoid and a kite.
 */
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import WinkelTask from './WinkelTask.vue'

export interface WinkelParams {
  mode: 'winkel' | 'figur'
}

/** A drawing: polyline points in a 100 × 100 box; closed for figures. */
export interface Zeichnung {
  key: string
  points: [number, number][]
  closed: boolean
}

export interface WinkelData {
  correctKey: string
  choices: Zeichnung[]
}

const rad = (deg: number) => (deg * Math.PI) / 180

/** An angle of `deg` degrees turned by `turn`; the vertex sits opposite the opening. */
function angle(key: string, deg: number, turn: number): Zeichnung {
  const mid = turn + deg / 2
  const v: [number, number] = [
    Math.round(50 - 28 * Math.cos(rad(mid))),
    Math.round(50 + 28 * Math.sin(rad(mid))),
  ]
  const arm = (a: number): [number, number] => [
    Math.round(v[0] + 58 * Math.cos(rad(a))),
    Math.round(v[1] - 58 * Math.sin(rad(a))),
  ]
  return { key, points: [arm(turn), v, arm(turn + deg)], closed: false }
}

const rotate = (pts: [number, number][], deg: number): [number, number][] =>
  pts.map(([x, y]) => {
    const c = Math.cos(rad(deg))
    const s = Math.sin(rad(deg))
    return [
      Math.round(50 + (x - 50) * c - (y - 50) * s),
      Math.round(50 + (x - 50) * s + (y - 50) * c),
    ]
  })

const FIGUREN: Record<string, { name: string; rechte: boolean; points: [number, number][] }> = {
  rechteck: {
    name: 'das Rechteck',
    rechte: true,
    points: [
      [10, 28],
      [90, 28],
      [90, 72],
      [10, 72],
    ],
  },
  quadrat: {
    name: 'das Quadrat',
    rechte: true,
    points: [
      [20, 20],
      [80, 20],
      [80, 80],
      [20, 80],
    ],
  },
  parallelogramm: {
    name: 'ein Parallelogramm',
    rechte: false,
    points: [
      [25, 28],
      [92, 28],
      [75, 72],
      [8, 72],
    ],
  },
  raute: {
    name: 'eine Raute',
    rechte: false,
    points: [
      [50, 8],
      [80, 50],
      [50, 92],
      [20, 50],
    ],
  },
  trapez: {
    name: 'ein Trapez',
    rechte: false,
    points: [
      [28, 25],
      [72, 25],
      [92, 75],
      [8, 75],
    ],
  },
  drachen: {
    name: 'ein Drachen',
    rechte: false,
    points: [
      [50, 8],
      [78, 38],
      [50, 92],
      [22, 38],
    ],
  },
}

function figur(key: string, rng: Rng): Zeichnung {
  const f = FIGUREN[key]!
  // Turned a little only when it has right angles, so no other figure looks like one.
  const turns = f.rechte ? [0, 0, 20, -20, 90] : [0, 90, 180]
  return { key, points: rotate(f.points, pickOne(turns, rng)), closed: true }
}

export const winkel: ExerciseModule<WinkelParams, WinkelData> = {
  id: 'formen.winkel',
  topic: 'formen',

  items(_ctx, params) {
    if (params.mode === 'figur')
      return ['rechteck', 'quadrat'].map((f) => `formen.winkel:figur:${f}`)
    return [0, 30, 45, 90, 120, 160, 200, 250, 300].map((t) => `formen.winkel:winkel:${t}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const id = itemKey.split(':')[2]!
    if (params.mode === 'figur') {
      const wrong = shuffle(
        Object.keys(FIGUREN).filter((k) => !FIGUREN[k]!.rechte),
        rng,
      ).slice(0, 2)
      return {
        instruction: 'Welche Figur hat nur rechte Winkel? Tippe sie an.',
        hint: 'Ein rechter Winkel sieht aus wie die Ecke von einem Blatt Papier.',
        solution: `Das ist ${FIGUREN[id]!.name}: Alle vier Ecken sind rechte Winkel.`,
        data: {
          correctKey: id,
          choices: shuffle([figur(id, rng), ...wrong.map((k) => figur(k, rng))], rng),
        },
      }
    }
    const turn = Number(id)
    const others = shuffle([40, 60, 125, 145], rng).slice(0, 2)
    return {
      instruction: 'Tippe auf den rechten Winkel.',
      hint: 'Ein rechter Winkel sieht aus wie die Ecke von einem Blatt Papier. Er ist nicht spitz und nicht stumpf.',
      solution: 'Das ist der rechte Winkel.',
      data: {
        correctKey: 'r',
        choices: shuffle(
          [
            angle('r', 90, turn),
            ...others.map((deg, i) => angle(`w${i}`, deg, turn + pickOne([-30, 0, 40], rng))),
          ],
          rng,
        ),
      },
    }
  },

  component: WinkelTask,
}
