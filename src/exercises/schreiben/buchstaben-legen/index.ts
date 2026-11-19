/**
 * S2 "Buchstaben legen": hear a word, lay it out from letter tiles (Sch, Ei … count as
 * one tile). The easy variant "Lückenwort" only asks for one missing letter.
 */
import { randomInt, shuffle } from '@/core/random'
import type { Tile } from '@/components/tiles'
import type { ExerciseModule } from '../../types'
import {
  distractors,
  findWord,
  isCapitalised,
  itemId,
  knownSingleLetters,
  spoken,
  toTiles,
  writingPool,
  type SchreibenParams,
} from '../shared'
import BuchstabenLegenTask from './BuchstabenLegenTask.vue'
import LueckeTask from './LueckeTask.vue'

export interface BuchstabenLegenData {
  image: string
  target: string[]
  tiles: Tile[]
  capitalizeFirst: boolean
}

export interface LueckeData {
  image: string
  /** The word's graphemes; the one at `gap` is missing. */
  graphemes: string[]
  gap: number
  capitalizeFirst: boolean
  correctKey: string
  choices: { key: string }[]
}

export const DISTRACTORS = 2
/** Longer words would make too many tiles for a phone screen. */
export const MAX_GRAPHEMES = 7

export const buchstabenLegen: ExerciseModule<SchreibenParams, BuchstabenLegenData> = {
  id: 'schreiben.buchstaben-legen',
  topic: 'schreiben',

  items(ctx, params) {
    return writingPool(ctx, params)
      .filter((w) => w.graphemes.length <= MAX_GRAPHEMES)
      .map((w) => `schreiben.buchstaben-legen:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const word = findWord(writingPool(ctx, params), itemId(itemKey))
    const extra = distractors(knownSingleLetters(ctx), word.graphemes, DISTRACTORS, rng)
    return {
      instruction: `Schreibe ${spoken(word)}.`,
      caption: 'Lege das Wort mit Buchstaben.',
      hint: `Sprich langsam mit: ${word.syllables.join(' – ')}.`,
      solution: `So schreibt man ${spoken(word)}.`,
      data: {
        image: word.image,
        target: word.graphemes,
        tiles: toTiles([...word.graphemes, ...extra], rng),
        capitalizeFirst: isCapitalised(word),
      },
    }
  },

  component: BuchstabenLegenTask,
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
