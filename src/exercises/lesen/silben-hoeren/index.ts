/** L1 "Silben hören": a syllable is spoken, the child taps it among three. */
import { shuffle } from '@/core/random'
import { baseSyllables, syllablesForSettings } from '@/core/words'
import type { ExerciseModule } from '../../types'
import { itemId, type LesenParams } from '../shared'
import SilbenHoerenTask from './SilbenHoerenTask.vue'

export interface SilbenHoerenData {
  target: string
  choices: { key: string }[]
  coloring: boolean
}

export const CHOICES = 3

export const silbenHoeren: ExerciseModule<LesenParams, SilbenHoerenData> = {
  id: 'lesen.silben-hoeren',
  topic: 'lesen',

  items(ctx, params) {
    const syllables = syllablesForSettings(
      baseSyllables(params.wordGrade ?? ctx.grade),
      ctx.settings,
    )
    if (syllables.length < CHOICES) return []
    return syllables.map((s) => `lesen.silben-hoeren:${s.text}`)
  },

  generate(ctx, params, itemKey, rng) {
    const target = itemId(itemKey)
    const all = syllablesForSettings(baseSyllables(params.wordGrade ?? ctx.grade), ctx.settings)
    const others = all.map((s) => s.text).filter((s) => s !== target)
    // Confusable first: same consonant (ma/mo) or same vowel (ma/la).
    const close = shuffle(
      others.filter((s) => s[0] === target[0] || s.slice(1) === target.slice(1)),
      rng,
    )
    const far = shuffle(
      others.filter((s) => !close.includes(s)),
      rng,
    )
    const distractors = [...close, ...far].slice(0, CHOICES - 1)
    const say = all.find((s) => s.text === target)?.say ?? target
    return {
      instruction: `Wo steht ${say}?`,
      caption: 'Welche Silbe hörst du?',
      solution: `Hier steht ${say}.`,
      data: {
        target,
        choices: shuffle([target, ...distractors], rng).map((key) => ({ key })),
        coloring: ctx.settings.syllableColoring,
      },
    }
  },

  component: SilbenHoerenTask,
}
