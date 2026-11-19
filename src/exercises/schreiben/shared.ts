/** Helpers shared by the writing exercises. */
import { shuffle, type Rng } from '@/core/random'
import type { Word } from '@/core/types'
import type { Tile } from '@/components/tiles'
import { knownLetters } from '../lesen/anlaut'
import { readingPool, type LesenParams } from '../lesen/shared'
import type { LearnerContext } from '../types'

export type SchreibenParams = LesenParams
export { findWord, gradeWords, itemId, spoken } from '../lesen/shared'

/**
 * Words to write: the same pool as for reading (only known letters, up to the current
 * word level). Writing what one can read keeps the two in step.
 */
export function writingPool(ctx: LearnerContext, params: SchreibenParams): Word[] {
  return readingPool(ctx, params)
}

/** Nouns start with a capital letter (all words in the dictionary do so far). */
export function isCapitalised(word: Word): boolean {
  const first = word.text.charAt(0)
  return first !== first.toLowerCase()
}

/** Single letters the child knows, for distractor tiles and the keyboard. */
export function knownSingleLetters(ctx: LearnerContext): string[] {
  return knownLetters(ctx)
    .filter((l) => l.type === 'vokal' || l.type === 'konsonant')
    .map((l) => l.id)
}

export function toTiles(texts: readonly string[], rng: Rng): Tile[] {
  return shuffle(
    texts.map((text, i) => ({ id: `${i}-${text}`, text })),
    rng,
  )
}

/** Up to `count` distractors from `candidates` that are not part of the word. */
export function distractors(
  candidates: readonly string[],
  exclude: readonly string[],
  count: number,
  rng: Rng,
): string[] {
  const taken = new Set(exclude.map((s) => s.toLowerCase()))
  const unique = [...new Set(candidates.map((c) => c.toLowerCase()))].filter((c) => !taken.has(c))
  return shuffle(unique, rng).slice(0, count)
}
