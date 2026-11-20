/**
 * S3 "ABC-Tastatur": hear a word, write it freely on an on-screen keyboard that only
 * has the letters the child knows. Case only counts if the parents switched it on.
 */
import { LETTERS } from '@/core/words'
import type { ExerciseModule } from '../../types'
import { knownLetters } from '../../lesen/anlaut'
import {
  findWord,
  isCapitalised,
  itemId,
  spoken,
  writingPool,
  type SchreibenParams,
} from '../shared'
import AbcTastaturTask from './AbcTastaturTask.vue'

export interface AbcTastaturData {
  /** Optional: words without a picture are only heard (🔊). */
  image?: string
  spoken: string
  target: string
  /** Keys in school order (single letters and units like "sch", "ei"). */
  keys: string[]
  strictCase: boolean
  /** Without strict case the first letter of a noun is capitalised automatically. */
  autoCapitalize: boolean
}

/** Compares the typed word with the target. */
export function matches(typed: string, target: string, strictCase: boolean): boolean {
  return strictCase ? typed === target : typed.toLowerCase() === target.toLowerCase()
}

/** Per letter: right in this position or not (for marking after a mistake). */
export function marks(typed: string, target: string): boolean[] {
  return [...typed].map((ch, i) => ch.toLowerCase() === (target[i] ?? '').toLowerCase())
}

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
    const known = new Set(knownLetters(ctx).map((l) => l.id))
    const keys = LETTERS.filter((l) => known.has(l.id)).map((l) => l.id)
    return {
      instruction: `Schreibe ${spoken(word)}.`,
      caption: 'Schreibe das Wort.',
      hint: `Sprich langsam mit: ${word.syllables.join(' – ')}.`,
      solution: `So schreibt man ${spoken(word)}.`,
      data: {
        image: word.image,
        spoken: spoken(word),
        target: word.text,
        keys,
        strictCase: ctx.settings.strictCase,
        autoCapitalize: !ctx.settings.strictCase && isCapitalised(word),
      },
    }
  },

  component: AbcTastaturTask,
}
