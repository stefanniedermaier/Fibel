/**
 * D1 "Blitzlesen": a word appears for a moment, then the child picks it among three
 * written words. Trains the sight vocabulary – Merkwörter (und, der, die …) and short
 * words that should be recognised at a glance.
 */
import { shuffle, type Rng } from '@/core/random'
import type { Word } from '@/core/types'
import type { ExerciseModule, LearnerContext } from '../../types'
import { findWord, itemId, readableWords, readingPool, spoken, type LesenParams } from '../shared'
import BlitzlesenTask from './BlitzlesenTask.vue'

export interface BlitzlesenData {
  word: string
  merkwort: boolean
  /** How long the word stays visible. */
  showMs: number
  choices: { key: string; label: string }[]
  correctKey: string
}

/** Short words only: the point is to see the word as a whole. */
export const MAX_LETTERS = 5
export const CHOICES = 3

export function blitzPool(ctx: LearnerContext, params: LesenParams): Word[] {
  const merk = readableWords(ctx, params).filter((w) => w.merkwort)
  // Grade 3 (L3-1): long words at a glance instead of short ones.
  if (params.minLetters)
    return readingPool(ctx, params).filter((w) => w.text.length >= params.minLetters!)
  const short = readingPool(ctx, params).filter((w) => w.text.length <= MAX_LETTERS)
  return [...merk, ...short]
}

/** Distractors that look alike: same first letter or same length first. */
export function lookalikes(target: Word, pool: readonly Word[], count: number, rng: Rng): Word[] {
  const others = pool.filter((w) => w.text.toLowerCase() !== target.text.toLowerCase())
  const score = (w: Word) =>
    (w.text[0]?.toLowerCase() === target.text[0]?.toLowerCase() ? 2 : 0) +
    (Math.abs(w.text.length - target.text.length) <= 1 ? 1 : 0)
  const ranked = shuffle(others, rng).sort((a, b) => score(b) - score(a))
  const seen = new Set<string>()
  return ranked.filter((w) => !seen.has(w.text) && seen.add(w.text)).slice(0, count)
}

export const blitzlesen: ExerciseModule<LesenParams, BlitzlesenData> = {
  id: 'lesen.blitzlesen',
  topic: 'lesen',

  items(ctx, params) {
    const pool = blitzPool(ctx, params)
    return pool.length < CHOICES ? [] : pool.map((w) => `lesen.blitzlesen:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const pool = blitzPool(ctx, params)
    const word = findWord(pool, itemId(itemKey))
    const others = lookalikes(word, pool, CHOICES - 1, rng)
    return {
      instruction: 'Schau genau hin! Welches Wort war das?',
      solution: `Das Wort war ${spoken(word)}.`,
      data: {
        word: word.text,
        merkwort: !!word.merkwort,
        showMs: ctx.settings.flashMs,
        correctKey: word.id,
        choices: shuffle([word, ...others], rng).map((w) => ({ key: w.id, label: w.text })),
      },
    }
  },

  component: BlitzlesenTask,
}
