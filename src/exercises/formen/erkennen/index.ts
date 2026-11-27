/**
 * M10 "Flächenformen" (Mathematik 1/2, 2.2): Dreieck, Kreis, Viereck – especially
 * Quadrat and Rechteck.
 * `name`: "Tippe auf das Dreieck." – three shapes, never two right answers (when the
 *   Rechteck is asked there is no Quadrat, because a Quadrat is a Rechteck, too).
 * `ecken`: "Wie viele Ecken hat die Form?"
 */
import { numberWord } from '@/core/numbers'
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { ShapeKind } from '@/components/shapes'
import type { ExerciseModule } from '../../types'
import ErkennenTask from './ErkennenTask.vue'

export interface ErkennenParams {
  mode: 'name' | 'ecken'
}

export interface Shape {
  kind: ShapeKind
  rotate: number
  color: string
}

export interface ErkennenData {
  mode: 'name' | 'ecken'
  shapes: (Shape & { key: string })[]
  /** ecken: the number choices. */
  choices: { key: string; label: string }[]
  correctKey: string
}

export const NAMES: Record<ShapeKind, string> = {
  kreis: 'den Kreis',
  dreieck: 'das Dreieck',
  quadrat: 'das Quadrat',
  rechteck: 'das Rechteck',
  viereck: 'das Viereck',
  fuenfeck: 'das Fünfeck',
  sechseck: 'das Sechseck',
}

export const CORNERS: Record<ShapeKind, number> = {
  kreis: 0,
  dreieck: 3,
  quadrat: 4,
  rechteck: 4,
  viereck: 4,
  fuenfeck: 5,
  sechseck: 6,
}

const ASKED: ShapeKind[] = ['kreis', 'dreieck', 'quadrat', 'rechteck', 'viereck']
const COUNTED: ShapeKind[] = [
  'kreis',
  'dreieck',
  'quadrat',
  'rechteck',
  'viereck',
  'fuenfeck',
  'sechseck',
]
const COLORS = ['#5b9be0', '#f08a5d', '#7cc47f', '#f5c542', '#b48fd9']

/** Shapes that would also be a right answer for the asked one. */
export function alsoRight(target: ShapeKind): ShapeKind[] {
  if (target === 'rechteck') return ['quadrat']
  if (target === 'viereck') return ['quadrat', 'rechteck']
  return []
}

const QUADS: ShapeKind[] = ['quadrat', 'rechteck', 'viereck']

function shape(kind: ShapeKind, rng: Rng): Shape {
  // Small turns only: a square turned by 45° looks like a diamond to children.
  const turn = kind === 'kreis' ? 0 : pickOne([0, 0, 10, 20, 90, 180], rng)
  return { kind, rotate: turn, color: pickOne(COLORS, rng) }
}

export const formenErkennen: ExerciseModule<ErkennenParams, ErkennenData> = {
  id: 'formen.erkennen',
  topic: 'rechnen',

  items(_ctx, params) {
    return (params.mode === 'name' ? ASKED : COUNTED).map(
      (k) => `formen.erkennen:${params.mode}:${k}`,
    )
  },

  generate(_ctx, params, itemKey, rng) {
    const kind = itemKey.split(':')[2] as ShapeKind
    if (params.mode === 'ecken') {
      const n = CORNERS[kind]
      const options = [0, 3, 4, 5, 6]
      const others = shuffle(
        options.filter((o) => o !== n),
        rng,
      ).slice(0, 2)
      return {
        instruction: 'Wie viele Ecken hat die Form?',
        hint: 'Zeig auf jede Ecke und zähle.',
        solution: n === 0 ? 'Ein Kreis hat keine Ecken.' : `Die Form hat ${numberWord(n)} Ecken.`,
        data: {
          mode: 'ecken',
          shapes: [{ key: kind, ...shape(kind, rng) }],
          choices: [n, ...others]
            .sort((a, b) => a - b)
            .map((c) => ({ key: String(c), label: String(c) })),
          correctKey: String(n),
        },
      }
    }
    // Distractors: other kinds that are not also right; Vierecke only once among them,
    // so the child compares, e.g., Quadrat against Rechteck on purpose.
    const forbidden = new Set([kind, ...alsoRight(kind)])
    let pool = ASKED.filter((k) => !forbidden.has(k))
    if (kind === 'quadrat') pool = pool.filter((k) => k !== 'viereck')
    const others = shuffle(pool, rng).filter(
      (k, i, all) => !QUADS.includes(k) || all.findIndex((x) => QUADS.includes(x)) === i,
    )
    const choices = shuffle([kind, ...others.slice(0, 2)], rng)
    return {
      instruction: `Tippe auf ${NAMES[kind]}.`,
      hint:
        kind === 'quadrat'
          ? 'Beim Quadrat sind alle Seiten gleich lang.'
          : kind === 'rechteck'
            ? 'Beim Rechteck sind zwei Seiten länger.'
            : `Zähle die Ecken.`,
      solution: `Das ist ${NAMES[kind]}.`,
      data: {
        mode: 'name',
        shapes: choices.map((k) => ({ key: k, ...shape(k, rng) })),
        choices: [],
        correctKey: kind,
      },
    }
  },

  component: ErkennenTask,
}
