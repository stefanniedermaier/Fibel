/**
 * E6 "Wort in Kästchen schreiben" (experiment, off by default): the word is spoken,
 * the child writes it letter by letter by hand; each letter is recognised offline
 * against the known letters of our handwriting templates.
 */
import { glyphFor, type Glyph } from '@/core/strokes'
import type { ExerciseModule, LearnerContext } from '../../types'
import { knownLetters } from '../../lesen/anlaut'
import { scriptOf } from '../nachspuren'
import {
  findWord,
  isCapitalised,
  itemId,
  spoken,
  writingPool,
  type SchreibenParams,
} from '../shared'
import KaestchenTask from './KaestchenTask.vue'

export interface KaestchenData {
  image?: string
  spoken: string
  /** The letters to write, one per box (first one capitalised for nouns/names). */
  chars: string[]
  /** Per box: the letters the writing is compared with (same case as the target). */
  candidates: string[][]
  /** Templates of all candidates (for recognition and the faint help overlay). */
  glyphs: Record<string, Glyph>
  tolerance: number
}

/** More boxes would not fit the phone screen next to each other. */
export const MAX_LETTERS = 5

/** Single characters the child knows ("sch" → s, c, h), small letters. */
export function knownChars(ctx: LearnerContext): string[] {
  return [...new Set(knownLetters(ctx).flatMap((l) => [...l.id]))]
}

export const kaestchen: ExerciseModule<SchreibenParams, KaestchenData> = {
  id: 'schreiben.kaestchen',
  topic: 'schreiben',

  items(ctx, params) {
    if (!ctx.settings.kaestchen) return []
    const script = scriptOf(ctx)
    const known = new Set(knownChars(ctx))
    return writingPool(ctx, params)
      .filter((w) => w.text.length <= MAX_LETTERS)
      .filter((w) => [...w.text.toLowerCase()].every((c) => known.has(c)))
      .filter((w) => [...w.text].every((c) => glyphFor(script, c)))
      .map((w) => `schreiben.kaestchen:${w.id}`)
  },

  generate(ctx, params, itemKey) {
    const word = findWord(writingPool(ctx, params), itemId(itemKey))
    const script = scriptOf(ctx)
    const lower = knownChars(ctx).filter((c) => glyphFor(script, c))
    const upper = lower.map((c) => c.toUpperCase()).filter((c) => glyphFor(script, c))
    const chars = [...word.text]
    const candidates = chars.map((c, i) => {
      const set = i === 0 && isCapitalised(word) ? upper : lower
      return set.includes(c) ? set : [...set, c]
    })
    const glyphs: Record<string, Glyph> = {}
    for (const c of new Set(candidates.flat())) glyphs[c] = glyphFor(script, c)!
    return {
      instruction: `Schreibe ${spoken(word)}. Ein Buchstabe in jedes Kästchen.`,
      caption: 'Schreibe das Wort – ein Buchstabe pro Kästchen.',
      hint: 'Schau dir die Vorlage an und schreib noch einmal.',
      solution: `So schreibt man ${spoken(word)}.`,
      data: {
        image: word.image,
        spoken: spoken(word),
        chars,
        candidates,
        glyphs,
        tolerance: ctx.settings.recognitionTolerance ?? 1,
      },
    }
  },

  component: KaestchenTask,
}
