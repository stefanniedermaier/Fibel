/** R1 reverse "Menge legen": a number is given, the child lays that many counters. */
import { numberWord } from '@/core/numbers'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import MengeLegenTask from './MengeLegenTask.vue'

export interface MengeLegenParams {
  max: number
}

export interface MengeLegenData {
  count: number
}

export const mengeLegen: ExerciseModule<MengeLegenParams, MengeLegenData> = {
  id: 'rechnen.menge-legen',
  topic: 'rechnen',

  items(_ctx, params) {
    const max = Math.min(params.max, 10)
    return Array.from({ length: max }, (_, i) => `rechnen.menge-legen:${i + 1}`)
  },

  generate(_ctx, _params, itemKey) {
    const count = Number(itemPart(itemKey))
    const word = count === 1 ? 'ein Plättchen' : `${numberWord(count)} Plättchen`
    return {
      instruction: `Lege ${word}. Dann drücke auf den Haken.`,
      caption: 'Lege so viele Plättchen. Dann tippe auf ✓.',
      hint: 'Zähle noch einmal nach.',
      solution: `So sehen ${word} aus.`,
      data: { count },
    }
  },

  component: MengeLegenTask,
}
