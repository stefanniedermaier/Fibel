/** L5 "Silben klatschen": the child hears a word and picks how many syllables it has. */
import { numberWord } from '@/core/numbers'
import type { ExerciseModule } from '../../types'
import { findWord, gradeWords, itemId, spoken, type LesenParams } from '../shared'
import SilbenKlatschenTask from './SilbenKlatschenTask.vue'

export interface SilbenKlatschenData {
  /** Optional: words without a picture are only heard (🔊). */
  image?: string
  spoken: string
  syllables: string[]
  coloring: boolean
  arcs: boolean
  correctKey: string
  choices: { key: string; count: number }[]
}

export const MAX_SYLLABLES = 4

export const silbenKlatschen: ExerciseModule<LesenParams, SilbenKlatschenData> = {
  id: 'lesen.silben-klatschen',
  topic: 'lesen',

  // A listening task: every word of the grade works, no letters needed.
  items(ctx, params) {
    return gradeWords(ctx, params)
      .filter((w) => w.syllables.length <= MAX_SYLLABLES)
      .map((w) => `lesen.silben-klatschen:${w.id}`)
  },

  generate(ctx, params, itemKey) {
    const word = findWord(gradeWords(ctx, params), itemId(itemKey))
    const n = word.syllables.length
    const counted = n === 1 ? 'eine Silbe' : `${numberWord(n)} Silben`
    return {
      instruction: `Wie viele Silben hat ${spoken(word)}? Klatsch mit!`,
      caption: 'Wie viele Silben hörst du? Klatsch mit!',
      hint: `Sprich langsam mit: ${spoken(word)}.`,
      solution: `${word.syllables.join(' – ')}. ${spoken(word)} hat ${counted}.`,
      data: {
        image: word.image,
        spoken: spoken(word),
        syllables: word.syllables,
        coloring: ctx.settings.syllableColoring,
        arcs: ctx.settings.syllableArcs,
        correctKey: String(n),
        choices: Array.from({ length: MAX_SYLLABLES }, (_, i) => ({
          key: String(i + 1),
          count: i + 1,
        })),
      },
    }
  },

  component: SilbenKlatschenTask,
}
