/**
 * messen.lineal (Mathematik 1/2, 3.1; M2-4): read a length off the ruler – from 0 or
 * (harder) from another mark. Umrechnen and Schätzen live in ../groessen.
 */
import { numberWord } from '@/core/numbers'
import type { ExerciseModule } from '../../types'
import { textChoices as choices } from '../../choices'
import LinealTask from './LinealTask.vue'

// --- Lineal ---------------------------------------------------------------------

export const RULER_CM = 15

export interface LinealParams {
  /** Start at another mark than 0 (a typical mistake: reading the end only). */
  versetzt?: boolean
}

export interface LinealData {
  start: number
  length: number
  color: string
  correctKey: string
  choices: { key: string; label: string }[]
}

export const lineal: ExerciseModule<LinealParams, LinealData> = {
  id: 'messen.lineal',
  topic: 'messen',

  items(_ctx, params) {
    const keys: string[] = []
    for (let len = 2; len <= 12; len++)
      for (const start of params.versetzt ? [1, 2, 3] : [0])
        if (start + len <= RULER_CM) keys.push(`messen.lineal:${start}-${len}`)
    return keys
  },

  generate(_ctx, _params, itemKey, rng) {
    const [start, length] = itemKey.split(':')[1]!.split('-').map(Number) as [number, number]
    const wrong = [start + length, length + 1, length - 1].filter(
      (x, i, all) => x !== length && x > 0 && all.indexOf(x) === i,
    )
    return {
      instruction: 'Wie lang ist der Stift? Lies am Lineal ab.',
      hint:
        start > 0
          ? `Der Stift fängt nicht bei null an, sondern bei ${numberWord(start)}.`
          : 'Schau, wo der Stift aufhört.',
      solution: `Der Stift ist ${numberWord(length)} Zentimeter lang.`,
      data: {
        start,
        length,
        color: ['#EA5A47', '#61B2E4', '#B1CC33', '#F1B31C'][length % 4]!,
        correctKey: `${length} cm`,
        choices: choices(
          [length, ...wrong.slice(0, 2)].map((x) => `${x} cm`),
          rng,
        ),
      },
    }
  },

  component: LinealTask,
}
