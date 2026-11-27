/**
 * F3-4 "Würfelgebäude" (Mathematik 3/4, 2.1 and 2.5): buildings of unit cubes and their
 * building plan (Bauplan: seen from above, each number tells how many cubes stand on the
 * square).
 * - `zaehlen`: how many cubes is the building made of?
 * - `bauplan`: which plan belongs to the building?
 * Taller columns stand at the back, so every column can be seen.
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import GebaeudeTask from './GebaeudeTask.vue'

/** Rows from back to front, numbers = cubes per square (0 = empty). */
export type Plan = number[][]

export const GEBAEUDE: Record<string, Plan> = {
  g1: [
    [2, 1],
    [1, 1],
  ],
  g2: [
    [2, 2],
    [1, 1],
  ],
  g3: [[3, 2, 1]],
  g4: [
    [2, 1, 1],
    [1, 0, 0],
  ],
  g5: [
    [3, 2],
    [2, 1],
  ],
  g6: [
    [1, 2, 1],
    [1, 1, 1],
  ],
  g7: [
    [2, 2, 2],
    [1, 0, 1],
  ],
  g8: [
    [3, 1],
    [2, 1],
    [1, 0],
  ],
  g9: [
    [2, 3],
    [1, 2],
  ],
  g10: [
    [1, 1, 1],
    [1, 1, 1],
  ],
  g11: [
    [3, 3],
    [1, 1],
  ],
  g12: [
    [2, 1, 2],
    [1, 0, 1],
  ],
  g13: [
    [4, 2],
    [2, 1],
  ],
}

export const anzahl = (p: Plan) => p.flat().reduce((a, b) => a + b, 0)
const same = (a: Plan, b: Plan) => JSON.stringify(a) === JSON.stringify(b)

/** Plans that look alike: mirrored, one number changed, front and back swapped. */
export function aehnlichePlaene(p: Plan): Plan[] {
  const out: Plan[] = [p.map((row) => [...row].reverse()), [...p].reverse()]
  for (let r = 0; r < p.length; r++)
    for (let c = 0; c < p[r]!.length; c++)
      for (const d of [1, -1]) {
        const v = p[r]![c]! + d
        if (v < 0) continue
        out.push(p.map((row, i) => row.map((x, j) => (i === r && j === c ? v : x))))
      }
  return out.filter((x, i) => !same(x, p) && out.findIndex((y) => same(x, y)) === i)
}

export interface GebaeudeParams {
  mode: 'zaehlen' | 'bauplan'
}

export interface GebaeudeData {
  mode: GebaeudeParams['mode']
  plan: Plan
  correctKey: string
  /** zaehlen: numbers; bauplan: plans. */
  choices: { key: string; label?: string; plan?: Plan }[]
}

export const gebaeude: ExerciseModule<GebaeudeParams, GebaeudeData> = {
  id: 'formen.gebaeude',
  topic: 'formen',

  items(_ctx, params) {
    return Object.keys(GEBAEUDE).map((id) => `formen.gebaeude:${params.mode}:${id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const plan = GEBAEUDE[itemKey.split(':')[2]!]!
    const n = anzahl(plan)
    if (params.mode === 'zaehlen') {
      const wrong = shuffle(
        [n - 1, n + 1, n - 2, n + 2].filter((x) => x > 0),
        rng,
      ).slice(0, 2)
      return {
        instruction: 'Aus wie vielen Würfeln ist das Gebäude gebaut?',
        hint: 'Zähle Turm für Turm: Unter jedem oberen Würfel stehen noch Würfel bis zum Boden.',
        solution: `Es sind ${numberWord(n)} Würfel.`,
        data: {
          mode: 'zaehlen',
          plan,
          correctKey: String(n),
          choices: shuffle([n, ...wrong], rng).map((x) => ({ key: String(x), label: String(x) })),
        },
      }
    }
    const others = shuffle(aehnlichePlaene(plan), rng).slice(0, 2)
    return {
      instruction: 'Welcher Bauplan passt zu dem Gebäude? Vorne ist unten.',
      hint: 'Im Bauplan steht auf jedem Feld, wie viele Würfel dort übereinander stehen.',
      solution: 'Dieser Bauplan passt.',
      data: {
        mode: 'bauplan',
        plan,
        correctKey: 'p0',
        choices: shuffle(
          [plan, ...others].map((p, i) => ({ key: `p${i}`, plan: p })),
          rng,
        ),
      },
    }
  },

  component: GebaeudeTask,
}
