/**
 * M3 "Zahlenstrahl": orientation in the number range (Mathematik 1/2, 1.1).
 * `ablesen`: an arrow points at a number on the Zahlenstrahl – which one?
 * `nachbarn`: "Welche Zahl kommt direkt vor / nach 13?" (Vorgänger, Nachfolger).
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import ZahlenstrahlTask from './ZahlenstrahlTask.vue'

export interface ZahlenstrahlParams {
  max: number
  mode: 'ablesen' | 'nachbarn'
}

export interface ZahlenstrahlData {
  mode: 'ablesen' | 'nachbarn'
  max: number
  /** Up to 100 only a section of 20 is shown, starting here. */
  from: number
  /** ablesen: the marked number; nachbarn: the given number. */
  n: number
  side?: 'vor' | 'nach'
  choices: { key: string; label: string }[]
  correctKey: string
}

/** Up to 20 the whole line; up to 100 a section of 20 around the number. */
export function section(n: number, max: number): number {
  if (max <= 20) return 0
  return Math.max(0, Math.min(max - 20, Math.floor(n / 10) * 10 - (n % 10 < 5 ? 10 : 0)))
}

export const zahlenstrahl: ExerciseModule<ZahlenstrahlParams, ZahlenstrahlData> = {
  id: 'rechnen.zahlenstrahl',
  topic: 'rechnen',

  items(_ctx, params) {
    const keys: string[] = []
    if (params.mode === 'ablesen') {
      // Multiples of five are labelled – nothing to read off there.
      for (let n = 1; n < params.max; n++) {
        if (n % 5 !== 0) keys.push(`rechnen.zahlenstrahl:ablesen:${n}`)
      }
    } else {
      for (let n = 1; n < params.max; n++) {
        keys.push(`rechnen.zahlenstrahl:vor:${n}`, `rechnen.zahlenstrahl:nach:${n}`)
      }
    }
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    const [kind, value] = itemPart(itemKey).split(':') as [string, string]
    const n = Number(value)
    const pick = (answer: number, near: number[]) => {
      const others = shuffle(
        near.filter((x, i) => x !== answer && x >= 0 && x <= params.max && near.indexOf(x) === i),
        rng,
      ).slice(0, 2)
      return [answer, ...others]
        .sort((a, b) => a - b)
        .map((c) => ({ key: String(c), label: String(c) }))
    }
    if (kind === 'ablesen') {
      return {
        instruction: 'Auf welche Zahl zeigt der Pfeil?',
        hint: 'Zähle von der nächsten großen Zahl aus weiter.',
        solution: `Der Pfeil zeigt auf ${numberWord(n)}.`,
        data: {
          mode: 'ablesen',
          max: params.max,
          from: section(n, params.max),
          n,
          choices: pick(n, [n - 1, n + 1, n - 2, n + 2]),
          correctKey: String(n),
        },
      }
    }
    const side = kind as 'vor' | 'nach'
    const answer = side === 'vor' ? n - 1 : n + 1
    const word = side === 'vor' ? 'vor' : 'nach'
    return {
      instruction: `Welche Zahl kommt direkt ${word} ${numberWord(n)}?`,
      caption: `Welche Zahl kommt direkt ${word} ${n}?`,
      hint: 'Schau auf den Zahlenstrahl.',
      solution: `Direkt ${word} ${numberWord(n)} kommt ${numberWord(answer)}.`,
      data: {
        mode: 'nachbarn',
        max: params.max,
        from: section(n, params.max),
        n,
        side,
        choices: pick(answer, [side === 'vor' ? n + 1 : n - 1, answer - 1, answer + 1, n]),
        correctKey: String(answer),
      },
    }
  },

  component: ZahlenstrahlTask,
}
