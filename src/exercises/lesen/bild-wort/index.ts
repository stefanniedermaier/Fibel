/** L3 "Bild → Wort": a picture, three similar-looking words to choose from. */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import {
  MIN_POOL,
  distractorWords,
  findWord,
  itemId,
  readingPool,
  spoken,
  withImage,
  type LesenParams,
} from '../shared'
import BildWortTask from './BildWortTask.vue'

export interface BildWortData {
  image: string
  coloring: boolean
  arcs: boolean
  correctKey: string
  choices: { key: string; syllables: string[] }[]
}

export const CHOICES = 3

export const bildWort: ExerciseModule<LesenParams, BildWortData> = {
  id: 'lesen.bild-wort',
  topic: 'lesen',

  items(ctx, params) {
    const pool = readingPool(ctx, params)
    // All three words must be readable, so the pool needs enough words.
    if (pool.length < Math.max(MIN_POOL, CHOICES)) return []
    // Only words with a picture can be asked; the distractors may be any readable word.
    return withImage(pool).map((w) => `lesen.bild-wort:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const pool = readingPool(ctx, params)
    const word = findWord(withImage(pool), itemId(itemKey))
    const others = distractorWords(word, pool, CHOICES - 1, rng)
    return {
      instruction: 'Welches Wort passt zum Bild?',
      solution: `Das ist ${spoken(word)}.`,
      data: {
        image: word.image,
        coloring: ctx.settings.syllableColoring,
        arcs: ctx.settings.syllableArcs,
        correctKey: word.id,
        choices: shuffle([word, ...others], rng).map((w) => ({
          key: w.id,
          syllables: w.syllables,
        })),
      },
    }
  },

  component: BildWortTask,
}
