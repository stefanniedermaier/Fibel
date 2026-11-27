/**
 * M2 "Zehner und Einer": numbers from 10 on as tens and ones (Mathematik 1/2, 1.1).
 * `bild`: Zehnerstangen and Einerwürfel are shown, the child picks the number.
 * `zerlegen`: "14 = 10 + ?" – the number is split into tens and ones.
 * Grade 1 uses max 20; grade 2 reuses it with max 100.
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
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
  tens: number
  ones: number
  choices: { key: string; label: string }[]
  correctKey: string
}

export const stellenwert: ExerciseModule<StellenwertParams, StellenwertData> = {
  id: 'rechnen.stellenwert',
  topic: 'rechnen',

  items(_ctx, params) {
    const keys: string[] = []
    for (let n = 10; n <= params.max; n++) keys.push(`rechnen.stellenwert:${params.mode}:${n}`)
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    const n = Number(itemPart(itemKey).split(':')[1])
    const tens = Math.floor(n / 10)
    const ones = n % 10
    if (params.mode === 'zerlegen') {
      return {
        instruction: `${numberWord(n)} ist ${numberWord(tens * 10)} plus wie viel?`,
        caption: 'Zerlege die Zahl.',
        hint: 'Wie viele Einer sind es noch nach dem Zehner?',
        solution: `${numberWord(n)} ist ${numberWord(tens * 10)} plus ${numberWord(ones)}.`,
        data: { mode: 'zerlegen', n, tens, ones, choices: [], correctKey: String(ones) },
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
        tens,
        ones,
        choices: choices.map((c) => ({ key: String(c), label: String(c) })),
        correctKey: String(n),
      },
    }
  },

  component: StellenwertTask,
}
