/** L2 "Wort → Bild": the child reads a word and picks the matching picture. */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import {
  distractorWords,
  findWord,
  gradeWords,
  itemId,
  readingPool,
  spoken,
  withImage,
  type LesenParams,
} from '../shared'
import WortBildTask from './WortBildTask.vue'

export interface WortBildData {
  syllables: string[]
  coloring: boolean
  arcs: boolean
  correctKey: string
  choices: { key: string; image: string; label: string }[]
}

export const CHOICES = 3

export const wortBild: ExerciseModule<LesenParams, WortBildData> = {
  id: 'lesen.wort-bild',
  topic: 'lesen',

  items(ctx, params) {
    return withImage(readingPool(ctx, params)).map((w) => `lesen.wort-bild:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const all = withImage(gradeWords(ctx, params))
    const word = findWord(all, itemId(itemKey))
    // Pictures may show any word – the child only has to read the target word.
    const others = distractorWords(word, all, CHOICES - 1, rng)
    return {
      instruction: 'Lies das Wort. Welches Bild passt?',
      hint: word.say ?? word.syllables.join(' – '),
      solution: `Das Wort heißt ${spoken(word)}.`,
      data: {
        syllables: word.syllables,
        coloring: ctx.settings.syllableColoring,
        arcs: ctx.settings.syllableArcs,
        correctKey: word.id,
        choices: shuffle([word, ...others], rng).map((w) => ({
          key: w.id,
          image: w.image,
          label: w.text,
        })),
      },
    }
  },

  component: WortBildTask,
}
