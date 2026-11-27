/**
 * Orientierung bis 100 (Mathematik 1/2, 1.1; R2-2): an excerpt of the hundred chart
 * with the number in the middle missing (one more and one less to the side, ten more
 * and ten less above and below), and "gerade oder ungerade?".
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import HunderterTask from './HunderterTask.vue'

export interface HunderterData {
  mode: 'tafel' | 'gerade'
  n: number
  /** tafel: the numbers around, null = the gap. */
  cells?: (number | null)[]
  correctKey: string
  choices: { key: string; label: string }[]
}

export const hunderter: ExerciseModule<Record<string, never>, HunderterData> = {
  id: 'rechnen.hunderter',
  topic: 'rechnen',

  items() {
    const keys: string[] = []
    // The middle needs neighbours in the same row of the chart: 12–19, 22–29 … 82–89.
    for (let n = 12; n <= 89; n++)
      if (n % 10 !== 0 && n % 10 !== 1) keys.push(`rechnen.hunderter:tafel:${n}`)
    for (let n = 1; n <= 100; n += 3) keys.push(`rechnen.hunderter:gerade:${n}`)
    return keys
  },

  generate(_ctx, _params, itemKey, rng) {
    const [mode, value] = itemPart(itemKey).split(':') as ['tafel' | 'gerade', string]
    const n = Number(value)
    if (mode === 'gerade') {
      const even = n % 2 === 0
      return {
        instruction: `Ist ${numberWord(n)} gerade oder ungerade?`,
        caption: `Ist ${n} gerade oder ungerade?`,
        hint: 'Schau auf die letzte Ziffer: 0, 2, 4, 6 und 8 sind gerade.',
        solution: `${numberWord(n)} ist ${even ? 'gerade' : 'ungerade'}.`,
        data: {
          mode,
          n,
          correctKey: even ? 'gerade' : 'ungerade',
          choices: [
            { key: 'gerade', label: 'gerade' },
            { key: 'ungerade', label: 'ungerade' },
          ],
        },
      }
    }
    const others = shuffle([n + 1, n - 1, n + 10, n - 10, n + 11, n - 9], rng)
      .filter((x) => x !== n)
      .slice(0, 2)
    return {
      instruction: 'Das ist ein Stück aus der Hundertertafel. Welche Zahl fehlt in der Mitte?',
      caption: 'Welche Zahl fehlt in der Mitte?',
      hint: 'Links steht eins weniger, rechts eins mehr. Oben zehn weniger, unten zehn mehr.',
      solution: `In der Mitte fehlt ${numberWord(n)}.`,
      data: {
        mode,
        n,
        cells: [null, n - 10, null, n - 1, null, n + 1, null, n + 10, null],
        correctKey: String(n),
        choices: shuffle([n, ...others], rng).map((x) => ({ key: String(x), label: String(x) })),
      },
    }
  },

  component: HunderterTask,
}
