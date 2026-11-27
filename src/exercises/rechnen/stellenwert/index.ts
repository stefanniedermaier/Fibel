/**
 * M2 "Zehner und Einer": numbers from 10 on as tens and ones (Mathematik 1/2, 1.1).
 * `bild`: Zehnerstangen and Einerwürfel are shown, the child picks the number.
 * `zerlegen`: "14 = 10 + ?" – the number is split into tens and ones.
 * Grade 1 uses max 20; grade 2 reuses it with max 100.
 */
import { numberWord } from '@/core/numbers'
import { shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import StellenwertTask from './StellenwertTask.vue'

export interface StellenwertParams {
  max: number
  mode: 'bild' | 'zerlegen'
}

export interface StellenwertData {
  mode: 'bild' | 'zerlegen'
  n: number
  /** From grade 3 (up to 1000). */
  hundreds: number
  tens: number
  ones: number
  choices: { key: string; label: string }[]
  correctKey: string
}

/** Up to 1000 (R3-1): hundreds plates, and 734 = 700 + 30 + ?. */
function hundredsTask(
  n: number,
  h: number,
  z: number,
  e: number,
  mode: StellenwertParams['mode'],
  rng: Rng,
) {
  if (mode === 'zerlegen') {
    return {
      instruction: `${numberWord(n)} ist ${numberWord(h * 100)} plus ${numberWord(z * 10)} plus wie viel?`,
      caption: 'Zerlege die Zahl in Hunderter, Zehner und Einer.',
      hint: 'Die letzte Ziffer sind die Einer.',
      solution: `${n} = ${h * 100} + ${z * 10} + ${e}.`,
      data: { mode, n, hundreds: h, tens: z, ones: e, choices: [], correctKey: String(e) },
    }
  }
  // Typical mistakes: digits swapped, one hundred or ten off.
  const near = [h * 100 + e * 10 + z, z * 100 + h * 10 + e, n + 100, n - 100, n + 10, n - 10]
    .filter((x) => x >= 100 && x <= 999 && x !== n)
    .filter((x, i, all) => all.indexOf(x) === i)
  const choices = [n, ...shuffle(near, rng).slice(0, 2)].sort((a, b) => a - b)
  return {
    instruction: 'Wie viele sind das? Zähle Hunderter, Zehner und Einer.',
    caption: 'Welche Zahl ist das?',
    hint: 'Eine Platte hat hundert Würfel, eine Stange zehn.',
    solution: `${numberWord(h)} Hunderter, ${numberWord(z)} Zehner und ${numberWord(e)} Einer sind ${numberWord(n)}.`,
    data: {
      mode,
      n,
      hundreds: h,
      tens: z,
      ones: e,
      choices: choices.map((c) => ({ key: String(c), label: String(c) })),
      correctKey: String(n),
    },
  }
}

export const stellenwert: ExerciseModule<StellenwertParams, StellenwertData> = {
  id: 'rechnen.stellenwert',
  topic: 'rechnen',

  items(_ctx, params) {
    const keys: string[] = []
    // Up to 1000 the three-digit numbers, every third one (enough to practise).
    const [start, step] = params.max > 100 ? [101, 3] : [10, 1]
    for (let n = start; n <= Math.min(params.max, 999); n += step)
      keys.push(`rechnen.stellenwert:${params.mode}:${n}`)
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    const n = Number(itemPart(itemKey).split(':')[1])
    const big = params.max > 100
    const hundreds = big ? Math.floor(n / 100) : 0
    const tens = big ? Math.floor((n % 100) / 10) : Math.floor(n / 10)
    const ones = n % 10
    if (big) return hundredsTask(n, hundreds, tens, ones, params.mode, rng)
    if (params.mode === 'zerlegen') {
      return {
        instruction: `${numberWord(n)} ist ${numberWord(tens * 10)} plus wie viel?`,
        caption: 'Zerlege die Zahl.',
        hint: 'Wie viele Einer sind es noch nach dem Zehner?',
        solution: `${numberWord(n)} ist ${numberWord(tens * 10)} plus ${numberWord(ones)}.`,
        data: {
          mode: 'zerlegen',
          n,
          hundreds: 0,
          tens,
          ones,
          choices: [],
          correctKey: String(ones),
        },
      }
    }
    // Typical mistakes: tens and ones swapped (14 → 41 only above 20), one off.
    const near = [n - 1, n + 1, n - 10, n + 10, tens + ones * 10]
      .filter((x) => x >= 1 && x <= Math.max(params.max, 20) && x !== n)
      .filter((x, i, all) => all.indexOf(x) === i)
    const choices = [n, ...shuffle(near, rng).slice(0, 2)].sort((a, b) => a - b)
    return {
      instruction: 'Wie viele sind das? Zähle die Zehner und die Einer.',
      caption: 'Welche Zahl ist das?',
      hint: 'Eine Stange hat zehn Würfel.',
      solution: `${numberWord(tens)} Zehner und ${numberWord(ones)} Einer sind ${numberWord(n)}.`,
      data: {
        mode: 'bild',
        n,
        hundreds: 0,
        tens,
        ones,
        choices: choices.map((c) => ({ key: String(c), label: String(c) })),
        correctKey: String(n),
      },
    }
  },

  component: StellenwertTask,
}
