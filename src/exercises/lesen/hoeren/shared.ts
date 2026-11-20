/** Helpers for the listening exercises (rhymes, initial sounds). */
import { resolveListenWords, type ListenWord } from '@/core/hoeren'
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { LearnerContext } from '../../types'
import type { LesenParams } from '../shared'

export interface PictureChoice {
  key: string
  image: string
  label: string
}

export interface ListenPictureData {
  /** The word everything refers to (missing in "odd one out"). */
  target?: { image: string; spoken: string }
  choices: PictureChoice[]
  correctKey: string
}

export function listenPool(ctx: LearnerContext, params: LesenParams): ListenWord[] {
  return resolveListenWords(ctx.land, params.wordGrade ?? ctx.grade)
}

export const spokenOf = (w: ListenWord) => w.say ?? w.text

export function toChoice(w: ListenWord): PictureChoice {
  return { key: w.id, image: w.image, label: w.text }
}

/** "Nase, Hund oder Ball" – the choices as spoken, in screen order. */
export function spokenList(words: readonly ListenWord[], last = 'oder'): string {
  const names = words.map(spokenOf)
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} ${last} ${names.at(-1)}`
}

/** Last three letters, to keep accidental rhymes out of the distractors. */
const ending = (w: ListenWord) => w.text.toLowerCase().slice(-3)

/** Could `w` sound like a rhyme of `target`? (same group or same ending) */
export function mightRhyme(w: ListenWord, target: ListenWord): boolean {
  return (w.reim !== undefined && w.reim === target.reim) || ending(w) === ending(target)
}

/** Up to `count` words, each with a different picture and not in `exclude`. */
export function pickDifferent(
  candidates: readonly ListenWord[],
  count: number,
  rng: Rng,
  exclude: readonly ListenWord[] = [],
): ListenWord[] {
  const images = new Set(exclude.map((w) => w.image))
  const result: ListenWord[] = []
  for (const w of shuffle(candidates, rng)) {
    if (result.length >= count) break
    if (images.has(w.image)) continue
    images.add(w.image)
    result.push(w)
  }
  return result
}

export { pickOne }
