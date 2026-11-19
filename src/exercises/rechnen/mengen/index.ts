/**
 * R1 "Mengen erkennen": a dice face or a ten frame is shown, the child picks the number.
 */
import { numberWord } from '@/core/numbers'
import { randomInt, shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import MengenTask from './MengenTask.vue'

export interface MengenParams {
  max: number
}

export interface MengenData {
  count: number
  layout: 'wuerfel' | 'zehnerfeld'
  choices: number[]
}

export const CHOICE_COUNT = 3

export function countOf(itemKey: string): number {
  const n = Number(itemKey.split(':')[1])
  if (!Number.isInteger(n)) throw new Error(`Ungültiger Item-Key: ${itemKey}`)
  return n
}

export const mengen: ExerciseModule<MengenParams, MengenData> = {
  id: 'rechnen.mengen',
  topic: 'rechnen',

  items(_ctx, params) {
    const max = Math.min(params.max, 20)
    return Array.from({ length: max }, (_, i) => `rechnen.mengen:${i + 1}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const count = countOf(itemKey)
    const max = Math.max(params.max, CHOICE_COUNT)
    // Distractors close to the answer: that is where counting errors happen.
    const near = [count - 1, count + 1, count - 2, count + 2, count - 3, count + 3].filter(
      (n) => n >= 1 && n <= max,
    )
    const distractors = shuffle(near.slice(0, 4), rng).slice(0, CHOICE_COUNT - 1)
    const choices = [count, ...distractors].sort((a, b) => a - b)
    const layout = count <= 6 && randomInt(rng, 0, 1) === 0 ? 'wuerfel' : 'zehnerfeld'
    return {
      instruction: 'Wie viele Punkte siehst du?',
      solution: count === 1 ? 'Das ist ein Punkt.' : `Das sind ${numberWord(count)} Punkte.`,
      data: { count, layout, choices },
    }
  },

  component: MengenTask,
}
