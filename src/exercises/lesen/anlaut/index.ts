/**
 * L4 "Anlaut": picture + spoken word, the child picks the first letter.
 * No isolated sounds via TTS (see PLAN.md) – the word is spoken as a whole.
 */
import { shuffle } from '@/core/random'
import type { Letter } from '@/core/types'
import { LETTERS } from '@/core/words'
import type { ExerciseModule, LearnerContext } from '../../types'
import { findWord, gradeWords, itemId, spoken, type LesenParams } from '../shared'
import AnlautTask from './AnlautTask.vue'

export interface AnlautData {
  image: string
  correctKey: string
  choices: { key: string; upper: string }[]
}

export const CHOICES = 3

/** Letters the child knows (all of them without letter filter). */
export function knownLetters(ctx: LearnerContext): Letter[] {
  if (!ctx.settings.letterFilter) return [...LETTERS]
  const unlocked = new Set(ctx.settings.letters)
  return LETTERS.filter((l) => unlocked.has(l.id))
}

function candidates(ctx: LearnerContext, params: LesenParams) {
  const letters = knownLetters(ctx)
  if (letters.length < CHOICES) return []
  const ids = new Set(letters.map((l) => l.id))
  return gradeWords(ctx, params).filter(
    (w) => w.graphemes[0] !== undefined && ids.has(w.graphemes[0]),
  )
}

export const anlaut: ExerciseModule<LesenParams, AnlautData> = {
  id: 'lesen.anlaut',
  topic: 'lesen',

  items(ctx, params) {
    return candidates(ctx, params).map((w) => `lesen.anlaut:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const word = findWord(gradeWords(ctx, params), itemId(itemKey))
    const first = word.graphemes[0] as string
    const letters = knownLetters(ctx)
    const target = letters.find((l) => l.id === first) as Letter
    // No distractor that starts like the answer (E for Ei, S for Sch) – that would be unfair.
    const others = shuffle(
      letters.filter((l) => l.id !== first && l.id[0] !== first[0]),
      rng,
    ).slice(0, CHOICES - 1)
    return {
      instruction: `Womit fängt ${spoken(word)} an?`,
      caption: 'Womit fängt das Wort an?',
      hint: `Hör genau hin: ${spoken(word)}.`,
      solution: `${spoken(word)} fängt mit ${target.upper} an.`,
      data: {
        image: word.image,
        correctKey: first,
        choices: shuffle([target, ...others], rng).map((l) => ({ key: l.id, upper: l.upper })),
      },
    }
  },

  component: AnlautTask,
}
