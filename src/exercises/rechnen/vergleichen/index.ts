/** R2 "Vergleichen": two numbers with their quantities – which sign fits: <, = or >? */
import { capitalize } from '@/core/text'
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

/**
 * Up to 100 not every pair (that would be 10 000), but the interesting ones: neighbours,
 * one ten apart, swapped digits (34 and 43) and equal numbers.
 */
function nearPairs(max: number): string[] {
  const keys = new Set<string>()
  if (max > 100) {
    for (let a = 101; a <= max; a += 7) {
      const [h, z, e] = [Math.floor(a / 100), Math.floor((a % 100) / 10), a % 10]
      for (const b of [
        a,
        a + 1,
        a - 1,
        a + 10,
        a - 100,
        h * 100 + e * 10 + z,
        z * 100 + h * 10 + e,
      ])
        if (b >= 100 && b <= max) keys.add(`rechnen.vergleichen:${a}-${b}`)
    }
    return [...keys]
  }
  for (let a = 10; a <= max; a++) {
    const swapped = (a % 10) * 10 + Math.floor(a / 10)
    for (const b of [a, a + 1, a - 1, a + 10, a - 10, swapped, a + 5])
      if (b >= 1 && b <= max) keys.add(`rechnen.vergleichen:${a}-${b}`)
  }
  return [...keys]
}

export const vergleichen: ExerciseModule<VergleichenParams, VergleichenData> = {
  id: 'rechnen.vergleichen',
  topic: 'rechnen',

  items(_ctx, params) {
    if (params.max > 20) return nearPairs(params.max)
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
      solution: `${capitalize(sentence)}.`,
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
