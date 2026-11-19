/** R3 "Zahlenhaus": the roof shows the number, one floor half is missing (7 = 3 + ?). */
import { numberWord } from '@/core/numbers'
import { randomInt } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import ZahlenhausTask from './ZahlenhausTask.vue'

export interface ZahlenhausParams {
  max: number
}

export interface ZahlenhausData {
  total: number
  known: number
  missing: number
  /** Which floor half is missing. */
  side: 'left' | 'right'
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const zahlenhaus: ExerciseModule<ZahlenhausParams, ZahlenhausData> = {
  id: 'rechnen.zahlenhaus',
  topic: 'rechnen',

  items(_ctx, params) {
    const keys: string[] = []
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
