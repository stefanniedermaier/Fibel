/**
 * D7 "Wo hörst du den Laut?": a letter is shown and the picture word is spoken; the child
 * says whether the letter is at the beginning, in the middle or at the end. Only letters
 * that occur once in the word, and no "e" (the unstressed ending sounds different).
 * As everywhere, the TTS speaks whole words, never isolated sounds (PLAN.md).
 */
import type { Word } from '@/core/types'
import { lauttreu } from '@/core/words'
import type { ExerciseModule, LearnerContext } from '../../types'
import { knownLetters } from '../anlaut'
import { findWord, gradeWords, itemId, spoken, withImage, type LesenParams } from '../shared'
import LautpositionTask from './LautpositionTask.vue'

export type Position = 'anfang' | 'mitte' | 'ende'

export interface LautpositionData {
  image: string
  upper: string
  correctKey: Position
  choices: { key: Position; label: string }[]
}

export const POSITIONS: { key: Position; label: string }[] = [
  { key: 'anfang', label: 'am Anfang' },
  { key: 'mitte', label: 'in der Mitte' },
  { key: 'ende', label: 'am Ende' },
]

const VOWELS_OK = new Set(['a', 'i', 'o', 'u'])

export function positionOf(word: Word, letter: string): Position | undefined {
  const g = word.graphemes
  if (g.filter((x) => x === letter).length !== 1) return undefined
  const i = g.indexOf(letter)
  return i === 0 ? 'anfang' : i === g.length - 1 ? 'ende' : 'mitte'
}

function pairs(ctx: LearnerContext, params: LesenParams) {
  const letters = knownLetters(ctx).filter(
    (l) => l.type === 'konsonant' || (l.type === 'vokal' && VOWELS_OK.has(l.id)),
  )
  const words = lauttreu(withImage(gradeWords(ctx, params)))
  return words.flatMap((w) =>
    letters.filter((l) => positionOf(w, l.id) !== undefined).map((l) => ({ word: w, letter: l })),
  )
}

export const lautposition: ExerciseModule<LesenParams, LautpositionData> = {
  id: 'lesen.lautposition',
  topic: 'lesen',

  items(ctx, params) {
    return pairs(ctx, params).map((p) => `lesen.lautposition:${p.word.id}-${p.letter.id}`)
  },

  generate(ctx, params, itemKey) {
    const key = itemId(itemKey)
    const cut = key.lastIndexOf('-')
    const word = findWord(withImage(gradeWords(ctx, params)), key.slice(0, cut))
    const letter = knownLetters(ctx).find((l) => l.id === key.slice(cut + 1))
    if (!letter) throw new Error(`Unbekannter Buchstabe in ${itemKey}`)
    const position = positionOf(word, letter.id) as Position
    const where = POSITIONS.find((p) => p.key === position)!.label
    return {
      instruction: `Wo hörst du das ${letter.upper} in ${spoken(word)}? Am Anfang, in der Mitte oder am Ende?`,
      caption: `Wo hörst du das ${letter.upper}?`,
      hint: `Sprich langsam: ${word.syllables.join(' – ')}.`,
      solution: `Das ${letter.upper} ist ${where}: ${spoken(word)}.`,
      data: {
        image: word.image,
        upper: `${letter.upper}${letter.id}`,
        correctKey: position,
        choices: [...POSITIONS],
      },
    }
  },

  component: LautpositionTask,
}
