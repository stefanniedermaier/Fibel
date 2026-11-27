/** Helpers shared by the reading exercises. */
import { shuffle, type Rng } from '@/core/random'
import type { ProfileSettings, ProgressRecord, Word } from '@/core/types'
import { lauttreu, resolveWords, wordsForSettings } from '@/core/words'
import type { LearnerContext } from '../types'

export interface LesenParams {
  /** Grade of the word list (default: the grade of the catalog entry). */
  wordGrade?: number
  /** From grade 2: only words with one of these spelling phenomena (phenomena.ts). */
  phenomena?: string[]
  /** From grade 2: only these word types (e.g. no "klein" words with pictures). */
  wortarten?: string[]
}

/** Settings key for a word level set by hand (0/missing = automatic). */
export const READING_LEVEL_KEY = 'lesen.woerter'
/** Exercises in which the child reads the word itself – they share the level. */
export const READING_MODULES = ['lesen.wort-bild', 'lesen.bild-wort'] as const
/** At least this many readable words, otherwise the next level is added. */
export const MIN_POOL = 3
/** The next level opens when this share of words sits in box ≥ MASTERY_BOX. */
export const MASTERY_SHARE = 0.8
export const MASTERY_BOX = 3

export function gradeWords(ctx: LearnerContext, params: LesenParams): Word[] {
  return resolveWords(ctx.land, params.wordGrade ?? ctx.grade)
}

/** Words whose letters the child already knows (if the letter filter is on). */
export function readableWords(ctx: LearnerContext, params: LesenParams): Word[] {
  return wordsForSettings(gradeWords(ctx, params), ctx.settings)
}

export function isMastered(wordId: string, progress: ReadonlyMap<string, ProgressRecord>): boolean {
  return READING_MODULES.some((m) => (progress.get(`${m}:${wordId}`)?.box ?? 0) >= MASTERY_BOX)
}

/** Current reading level: set by hand, or the lowest level not yet mastered. */
export function readingLevel(
  words: readonly Word[],
  settings: ProfileSettings,
  progress: ReadonlyMap<string, ProgressRecord>,
): number {
  const manual = settings.levels[READING_LEVEL_KEY]
  if (manual !== undefined && manual >= 1 && manual <= 4) return manual
  for (const level of [1, 2, 3]) {
    const atLevel = words.filter((w) => w.level === level)
    if (atLevel.length === 0) continue
    const mastered = atLevel.filter((w) => isMastered(w.id, progress)).length
    if (mastered / atLevel.length < MASTERY_SHARE) return level
  }
  return 4
}

/**
 * Words to read and write sound by sound: readable, up to the current level (extended
 * if too few). Merkwörter have their own exercises.
 */
export function readingPool(ctx: LearnerContext, params: LesenParams): Word[] {
  let words = lauttreu(readableWords(ctx, params))
  if (params.phenomena)
    words = words.filter((w) => w.phenomena.some((p) => params.phenomena!.includes(p)))
  if (params.wortarten) words = words.filter((w) => params.wortarten!.includes(w.wortart))
  // From grade 2 all letters are known: no word levels, the units choose the words.
  if ((params.wordGrade ?? ctx.grade) >= 2) return words
  const level = readingLevel(words, ctx.settings, ctx.progress ?? new Map())
  let pool = words.filter((w) => w.level <= level)
  for (let l = level + 1; pool.length < MIN_POOL && l <= 4; l++) {
    pool = words.filter((w) => w.level <= l)
  }
  return pool
}

export function spoken(word: Word): string {
  return word.say ?? word.text
}

/** The part after the colon: 'lesen.wort-bild:rose' → 'rose'. */
export function itemId(itemKey: string): string {
  return itemKey.slice(itemKey.indexOf(':') + 1)
}

export function findWord<W extends Word>(words: readonly W[], id: string): W {
  const word = words.find((w) => w.id === id)
  if (!word) throw new Error(`Unbekanntes Wort: ${id}`)
  return word
}

/**
 * Distractors for a word: similar-looking words first (Rose → Dose, Hose), then random
 * ones. Never the word itself or a word with the same picture.
 */
export function distractorWords<W extends Word>(
  target: Word,
  candidates: readonly W[],
  count: number,
  rng: Rng,
): W[] {
  const usable = candidates.filter(
    (w) => w.id !== target.id && w.text.toLowerCase() !== target.text.toLowerCase(),
  )
  const similar = new Set(target.similar ?? [])
  const first = shuffle(
    usable.filter((w) => similar.has(w.id)),
    rng,
  )
  const rest = shuffle(
    usable.filter((w) => !similar.has(w.id)),
    rng,
  )
  const result: W[] = []
  // Words without a picture never clash; pictures must all be different.
  const images = new Set(target.image ? [target.image] : [])
  for (const w of [...first, ...rest]) {
    if (result.length >= count) break
    if (w.image && images.has(w.image)) continue
    if (w.image) images.add(w.image)
    result.push(w)
  }
  return result
}

/** Only words with a picture (for the picture exercises). */
export function withImage(words: readonly Word[]): (Word & { image: string })[] {
  return words.filter((w): w is Word & { image: string } => typeof w.image === 'string')
}
