/**
 * S3 "ABC-Tastatur": hear a word, write it freely on the device's own keyboard.
 * No hint how long the word is. Case only counts if the parents switched it on.
 */
import type { ExerciseModule } from '../../types'
import { findWord, itemId, spoken, writingPool, type SchreibenParams } from '../shared'
import { tippenData, type TippenData } from '../tippen'
import TippenTask from '../tippen/TippenTask.vue'

export { marks, matches } from '../tippen'
export type AbcTastaturData = TippenData

export const MAX_LETTERS = 8

export const abcTastatur: ExerciseModule<SchreibenParams, AbcTastaturData> = {
  id: 'schreiben.abc-tastatur',
  topic: 'schreiben',

  items(ctx, params) {
    return writingPool(ctx, params)
      .filter((w) => w.text.length <= MAX_LETTERS)
      .map((w) => `schreiben.abc-tastatur:${w.id}`)
  },

  generate(ctx, params, itemKey) {
    const word = findWord(writingPool(ctx, params), itemId(itemKey))
    return {
      instruction: `Schreibe ${spoken(word)}.`,
      caption: 'Schreibe das Wort.',
      hint: `Sprich langsam mit: ${word.syllables.join(' – ')}.`,
      solution: `So schreibt man ${spoken(word)}.`,
      data: tippenData(ctx, word, false),
    }
  },

  component: TippenTask,
}
