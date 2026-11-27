/** R2 "Vergleichen": two numbers with their quantities – which sign fits: <, = or >? */
import { numberWord } from '@/core/numbers'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import VergleichenTask from './VergleichenTask.vue'

export interface VergleichenParams {
  max: number
  /** Only pairs with at least one number above this (e.g. 10 for the range up to 20). */
  above?: number
}

export type Relation = '<' | '=' | '>'

export interface VergleichenData {
  a: number
  b: number
  correctKey: Relation
  choices: { key: Relation; label: string }[]
}

export function relationOf(a: number, b: number): Relation {
  return a < b ? '<' : a > b ? '>' : '='
}

const WORDS: Record<Relation, string> = { '<': 'kleiner als', '=': 'gleich', '>': 'größer als' }

export const vergleichen: ExerciseModule<VergleichenParams, VergleichenData> = {
  id: 'rechnen.vergleichen',
  topic: 'rechnen',

  items(_ctx, params) {
    const keys: string[] = []
    // All pairs; about every tenth one is "=".
    for (let a = 1; a <= params.max; a++) {
      for (let b = 1; b <= params.max; b++) {
        if (Math.max(a, b) > (params.above ?? 0)) keys.push(`rechnen.vergleichen:${a}-${b}`)
      }
    }
    return keys
  },

  generate(_ctx, _params, itemKey) {
    const [a, b] = itemPart(itemKey).split('-').map(Number) as [number, number]
    const rel = relationOf(a, b)
    const sentence =
      rel === '='
        ? `${numberWord(a)} ist gleich ${numberWord(b)}`
        : `${numberWord(a)} ist ${WORDS[rel]} ${numberWord(b)}`
    return {
      instruction: `Welches Zeichen passt zwischen ${numberWord(a)} und ${numberWord(b)}?`,
      caption: 'Welches Zeichen passt?',
      hint: 'Wo sind mehr Plättchen? Die Spitze zeigt zur kleineren Zahl.',
      solution: `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`,
      data: {
        a,
        b,
        correctKey: rel,
        choices: (['<', '=', '>'] as const).map((key) => ({ key, label: WORDS[key] })),
      },
    }
  },

  component: VergleichenTask,
}
