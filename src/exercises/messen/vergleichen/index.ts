/**
 * M14 "Länger oder kürzer?" (Mathematik 1/2, 3.2: "vergleichen und ordnen … Längen …
 * unter Verwendung der Begriffe … kürzer/länger"): coloured pencils of different length,
 * all starting at the same line.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import LaengenTask from './LaengenTask.vue'

export type LaengenFrage = 'laenger' | 'kuerzer' | 'laengster' | 'kuerzester'

export interface LaengenData {
  pencils: { key: string; length: number; color: string }[]
  correctKey: string
}

const COLORS = ['#e05a4f', '#4f8fe0', '#58b85c', '#f2b632', '#9b6fd0']
const QUESTIONS: Record<LaengenFrage, string> = {
  laenger: 'Welcher Stift ist länger?',
  kuerzer: 'Welcher Stift ist kürzer?',
  laengster: 'Welcher Stift ist am längsten?',
  kuerzester: 'Welcher Stift ist am kürzesten?',
}

/** Lengths in % of the width, clearly different (at least 12 points apart). */
export function lengths(n: number, rng: () => number): number[] {
  for (;;) {
    const l = Array.from({ length: n }, () => 30 + Math.round(rng() * 65))
    const sorted = [...l].sort((a, b) => a - b)
    if (sorted.every((v, i) => i === 0 || v - sorted[i - 1]! >= 12)) return l
  }
}

export const laengenVergleichen: ExerciseModule<Record<string, never>, LaengenData> = {
  id: 'messen.vergleichen',
  topic: 'rechnen',

  items() {
    return (Object.keys(QUESTIONS) as LaengenFrage[]).map((q) => `messen.vergleichen:${q}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const frage = itemKey.split(':')[1] as LaengenFrage
    const n = frage === 'laenger' || frage === 'kuerzer' ? 2 : 3
    const l = lengths(n, rng)
    const colors = shuffle(COLORS, rng)
    const pencils = l.map((length, i) => ({ key: String(i), length, color: colors[i]! }))
    const best = frage === 'laenger' || frage === 'laengster' ? Math.max(...l) : Math.min(...l)
    return {
      instruction: QUESTIONS[frage],
      hint: 'Alle Stifte fangen an der gleichen Linie an. Schau, wo sie aufhören.',
      solution: frage.startsWith('laeng')
        ? 'Dieser Stift ist am längsten.'
        : 'Dieser Stift ist am kürzesten.',
      data: { pencils, correctKey: String(l.indexOf(best)) },
    }
  },

  component: LaengenTask,
}
