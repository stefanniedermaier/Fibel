/**
 * S2 "Buchstaben legen": hear a word, write it letter by letter into one box per letter
 * with the device's own keyboard (the boxes show how long the word is). The easy
 * variant "Lückenwort" only asks for one missing letter.
 */
import { randomInt, shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import {
  distractors,
  findWord,
  isCapitalised,
  itemId,
  knownSingleLetters,
  spoken,
  writingPool,
  type SchreibenParams,
} from '../shared'
import { tippenData, type TippenData } from '../tippen'
import TippenTask from '../tippen/TippenTask.vue'
import LueckeTask from './LueckeTask.vue'

export type BuchstabenLegenData = TippenData

export interface LueckeData {
  /** Optional: words without a picture are only heard (🔊). */
  image?: string
  spoken: string
  /** The word's graphemes; the one at `gap` is missing. */
  graphemes: string[]
  gap: number
  capitalizeFirst: boolean
  correctKey: string
  choices: { key: string }[]
}

/** Longer words would make too many boxes for a phone screen. */
export const MAX_LETTERS = 7

export const buchstabenLegen: ExerciseModule<SchreibenParams, BuchstabenLegenData> = {
  id: 'schreiben.buchstaben-legen',
  topic: 'schreiben',

  items(ctx, params) {
    return writingPool(ctx, params)
      .filter((w) => [...w.text].length <= MAX_LETTERS)
      .map((w) => `schreiben.buchstaben-legen:${w.id}`)
  },

  generate(ctx, params, itemKey) {
    const word = findWord(writingPool(ctx, params), itemId(itemKey))
    return {
      instruction: `Schreibe ${spoken(word)}.`,
      caption: 'Schreibe das Wort in die Kästchen.',
      hint: `Sprich langsam mit: ${word.syllables.join(' – ')}.`,
      solution: `So schreibt man ${spoken(word)}.`,
      data: tippenData(ctx, word, true),
    }
  },

  component: TippenTask,
}

export const luecke: ExerciseModule<SchreibenParams, LueckeData> = {
  id: 'schreiben.luecke',
  topic: 'schreiben',

  items(ctx, params) {
    if (knownSingleLetters(ctx).length < 3) return []
    return writingPool(ctx, params).map((w) => `schreiben.luecke:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const word = findWord(writingPool(ctx, params), itemId(itemKey))
    const gap = randomInt(rng, 0, word.graphemes.length - 1)
    const missing = word.graphemes[gap] as string
    const others = distractors(knownSingleLetters(ctx), [missing], 2, rng)
    return {
      instruction: `Welcher Buchstabe fehlt bei ${spoken(word)}?`,
      caption: 'Welcher Buchstabe fehlt?',
      hint: `Sprich langsam mit: ${word.syllables.join(' – ')}.`,
      solution: `So schreibt man ${spoken(word)}.`,
      data: {
        image: word.image,
        spoken: spoken(word),
        graphemes: word.graphemes,
        gap,
        capitalizeFirst: isCapitalised(word),
        correctKey: missing,
        choices: shuffle([missing, ...others], rng).map((key) => ({ key })),
      },
    }
  },

  component: LueckeTask,
}
