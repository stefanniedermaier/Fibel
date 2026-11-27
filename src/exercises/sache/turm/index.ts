/**
 * S7 "Welcher Turm steht sicherer?" (HSU 1/2, 6.2 Standfestigkeit): two towers of
 * blocks, one built sturdier (wide base, straight, low). Afterwards the rule is spoken.
 */
import type { ExerciseModule } from '../../types'
import TurmTask from './TurmTask.vue'

/** A block or a ball in a 120 × 160 box, ground at y = 150. */
export interface TurmTeil {
  kind: 'block' | 'ball'
  x: number
  y: number
  w: number
  h: number
}

export interface TurmData {
  correctKey: string
  choices: { key: string; parts: TurmTeil[] }[]
}

const GROUND = 150
/** Blocks stacked from the ground: [x, width, height] from bottom to top. */
function stack(rows: [number, number, number][]): TurmTeil[] {
  let y = GROUND
  return rows.map(([x, w, h]) => {
    y -= h
    return { kind: 'block', x, y, w, h }
  })
}

export const TUERME: Record<string, { sicher: TurmTeil[]; wackelig: TurmTeil[]; regel: string }> = {
  pyramide: {
    sicher: stack([
      [15, 90, 30],
      [30, 60, 30],
      [45, 30, 30],
    ]),
    wackelig: stack([
      [45, 30, 30],
      [30, 60, 30],
      [15, 90, 30],
    ]),
    regel: 'Unten breit und oben schmal: So steht ein Turm sicher.',
  },
  gerade: {
    sicher: stack([
      [40, 40, 28],
      [40, 40, 28],
      [40, 40, 28],
      [40, 40, 28],
    ]),
    wackelig: stack([
      [15, 40, 28],
      [31, 40, 28],
      [47, 40, 28],
      [63, 40, 28],
    ]),
    regel: 'Steine genau übereinander stehen sicherer als ein schiefer Turm.',
  },
  breit: {
    sicher: [
      ...stack([[20, 40, 30]]),
      ...stack([[60, 40, 30]]),
      { kind: 'block', x: 20, y: GROUND - 60, w: 40, h: 30 },
      { kind: 'block', x: 60, y: GROUND - 60, w: 40, h: 30 },
    ],
    wackelig: stack([
      [50, 20, 34],
      [50, 20, 34],
      [50, 20, 34],
      [50, 20, 34],
    ]),
    regel: 'Ein niedriger, breiter Turm wackelt weniger als ein hoher, dünner Turm.',
  },
  kugel: {
    sicher: stack([
      [30, 60, 40],
      [40, 40, 40],
    ]),
    wackelig: [
      { kind: 'ball', x: 40, y: GROUND - 40, w: 40, h: 40 },
      { kind: 'block', x: 30, y: GROUND - 80, w: 60, h: 40 },
    ],
    regel: 'Auf einer Kugel rollt alles weg. Ein flacher Stein unten ist sicherer.',
  },
}

export const turm: ExerciseModule<Record<string, never>, TurmData> = {
  id: 'sache.turm',
  topic: 'sache',

  items() {
    return Object.keys(TUERME).map((id) => `sache.turm:${id}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const id = itemKey.split(':')[1]!
    const t = TUERME[id]
    if (!t) throw new Error(`Unbekannter Turm: ${itemKey}`)
    const sicher = { key: 'sicher', parts: t.sicher }
    const wackelig = { key: 'wackelig', parts: t.wackelig }
    return {
      instruction: 'Welcher Turm steht sicherer?',
      hint: 'Schau, wie breit der Turm unten ist.',
      solution: t.regel,
      afterword: t.regel,
      data: {
        correctKey: 'sicher',
        choices: rng() < 0.5 ? [sicher, wackelig] : [wackelig, sicher],
      },
    }
  },

  component: TurmTask,
}
