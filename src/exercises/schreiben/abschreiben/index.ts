/**
 * D8 "Schau – merk – schreib": the word is shown, the child memorises it, then it is
 * covered and typed from memory. Merkwörter and short readable words.
 */
import type { Word } from '@/core/types'
import type { ExerciseModule, LearnerContext } from '../../types'
import { readableWords } from '../../lesen/shared'
import { findWord, itemId, spoken, writingPool, type SchreibenParams } from '../shared'
import { tippenData, type TippenData } from '../tippen'
import AbschreibenTask from './AbschreibenTask.vue'

export interface AbschreibenData extends TippenData {
  merkwort: boolean
}

export const MAX_LETTERS = 7

export function abschreibPool(ctx: LearnerContext, params: SchreibenParams): Word[] {
  const merk = readableWords(ctx, params).filter((w) => w.merkwort)
  return [...merk, ...writingPool(ctx, params).filter((w) => w.text.length <= MAX_LETTERS)]
}

export const abschreiben: ExerciseModule<SchreibenParams, AbschreibenData> = {
  id: 'schreiben.abschreiben',
  topic: 'schreiben',

  items(ctx, params) {
    return abschreibPool(ctx, params).map((w) => `schreiben.abschreiben:${w.id}`)
  },

  generate(ctx, params, itemKey) {
    const word = findWord(abschreibPool(ctx, params), itemId(itemKey))
    return {
      instruction: 'Schau dir das Wort genau an. Dann schreib es auswendig.',
      caption: 'Schau – merk – schreib',
      hint: 'Schau es dir nochmal an.',
      solution: `So schreibt man ${spoken(word)}.`,
      data: { ...tippenData(ctx, word, false), image: undefined, merkwort: !!word.merkwort },
    }
  },

  component: AbschreibenTask,
}
