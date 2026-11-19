/** S1 "Silben legen": hear a word, see its picture, lay it out from syllable tiles. */
import { shuffle } from '@/core/random'
import type { Tile } from '@/components/tiles'
import type { ExerciseModule } from '../../types'
import {
  distractors,
  findWord,
  isCapitalised,
  itemId,
  spoken,
  toTiles,
  writingPool,
  type SchreibenParams,
} from '../shared'
import SilbenLegenTask from './SilbenLegenTask.vue'

export interface SilbenLegenData {
  image: string
  target: string[]
  tiles: Tile[]
  capitalizeFirst: boolean
}

export const DISTRACTORS = 2

export const silbenLegen: ExerciseModule<SchreibenParams, SilbenLegenData> = {
  id: 'schreiben.silben-legen',
  topic: 'schreiben',

  items(ctx, params) {
    return writingPool(ctx, params)
      .filter((w) => w.syllables.length >= 2)
      .map((w) => `schreiben.silben-legen:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const pool = writingPool(ctx, params)
    const word = findWord(pool, itemId(itemKey))
    const target = word.syllables.map((s) => s.toLowerCase())
    // Distractor syllables from other readable words, so the child can read them too.
    const others = shuffle(pool, rng).flatMap((w) => (w.id === word.id ? [] : w.syllables))
    const extra = distractors(others, target, DISTRACTORS, rng)
    return {
      instruction: `Lege das Wort ${spoken(word)}.`,
      caption: 'Lege das Wort aus Silben.',
      hint: `Hör genau hin: ${word.syllables.join(' – ')}.`,
      solution: `${spoken(word)}: ${word.syllables.join(' – ')}.`,
      data: {
        image: word.image,
        target,
        tiles: toTiles([...target, ...extra], rng),
        capitalizeFirst: isCapitalised(word),
      },
    }
  },

  component: SilbenLegenTask,
}
