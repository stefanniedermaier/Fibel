/**
 * Shared by the writing exercises that type a word on the device's own keyboard
 * (S2 "Buchstaben legen" and S3 "ABC-Tastatur").
 */
import type { Word } from '@/core/types'
import type { LearnerContext } from '../../types'
import { isCapitalised, spoken } from '../shared'

export interface TippenData {
  /** Optional: words without a picture are only heard (🔊). */
  image?: string
  spoken: string
  target: string
  strictCase: boolean
  /** Without strict case the first letter of a noun is capitalised automatically. */
  autoCapitalize: boolean
  /** One box per letter: the child sees how long the word is (easier variant). */
  slots: boolean
}

/** Compares the typed word with the target. */
export function matches(typed: string, target: string, strictCase: boolean): boolean {
  return strictCase ? typed === target : typed.toLowerCase() === target.toLowerCase()
}

/** Per letter: right in this position or not (for marking after a mistake). */
export function marks(typed: string, target: string): boolean[] {
  return [...typed].map((ch, i) => ch.toLowerCase() === (target[i] ?? '').toLowerCase())
}

/** Keeps only letters: the native keyboard also offers digits, spaces, emoji … */
export function onlyLetters(text: string): string {
  return text.replace(/[^\p{L}]/gu, '')
}

/** What is shown: with auto capitalisation the first letter appears as a capital. */
export function display(typed: string, autoCapitalize: boolean): string {
  return autoCapitalize && typed ? typed.charAt(0).toUpperCase() + typed.slice(1) : typed
}

export function tippenData(ctx: LearnerContext, word: Word, slots: boolean): TippenData {
  return {
    image: word.image,
    spoken: spoken(word),
    target: word.text,
    strictCase: ctx.settings.strictCase,
    autoCapitalize: !ctx.settings.strictCase && isCapitalised(word),
    slots,
  }
}
