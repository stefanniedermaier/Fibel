/** R3 "Zahlenhaus": the roof shows the number, one floor half is missing (7 = 3 + ?). */
import { capitalize } from '@/core/text'
import { numberWord } from '@/core/numbers'
import { randomInt } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import ZahlenhausTask from './ZahlenhausTask.vue'

export interface ZahlenhausParams {
  max: number
  /** Up to 100 (R2-4): 34 = 30 + 4 and 100 = 30 + 70. */
  zehner?: boolean
}

export interface ZahlenhausData {
  total: number
  known: number
  missing: number
  /** Which floor half is missing. */
  side: 'left' | 'right'
}

export const zahlenhaus: ExerciseModule<ZahlenhausParams, ZahlenhausData> = {
  id: 'rechnen.zahlenhaus',
  topic: 'rechnen',

  items(_ctx, params) {
    const keys: string[] = []
    if (params.zehner) {
      for (let n = 11; n < 100; n++)
        if (n % 10 !== 0)
          keys.push(`rechnen.zahlenhaus:${n}-${n - (n % 10)}`, `rechnen.zahlenhaus:${n}-${n % 10}`)
      for (let t = 10; t < 100; t += 10) keys.push(`rechnen.zahlenhaus:100-${t}`)
      return keys
    }
    // Roofs from 2 on; 0 is fine as a part (7 = 7 + 0) but rarer, so only known ≥ 1.
    for (let total = 2; total <= params.max; total++) {
      for (let known = 1; known <= total; known++) keys.push(`rechnen.zahlenhaus:${total}-${known}`)
    }
    return keys
  },

  generate(_ctx, _params, itemKey, rng) {
    const [total, known] = itemPart(itemKey).split('-').map(Number) as [number, number]
    const missing = total - known
    return {
      instruction: `Im Zahlenhaus wohnt die ${numberWord(total)}. ${capitalize(numberWord(known))} und wie viel sind ${numberWord(total)}?`,
      caption: 'Welche Zahl fehlt im Haus?',
      hint: `Zähle von ${numberWord(known)} weiter bis ${numberWord(total)}.`,
      solution: `${capitalize(numberWord(known))} und ${numberWord(missing)} sind zusammen ${numberWord(total)}.`,
      data: { total, known, missing, side: randomInt(rng, 0, 1) === 0 ? 'left' : 'right' },
    }
  },

  component: ZahlenhausTask,
}
