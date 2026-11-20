/** L5 "Silben klatschen": the child hears a word and picks how many syllables it has. */
import { resolveListenWords } from '@/core/hoeren'
import { numberWord } from '@/core/numbers'
import type { ExerciseModule, LearnerContext } from '../../types'
import { gradeWords, itemId, type LesenParams } from '../shared'
import SilbenKlatschenTask from './SilbenKlatschenTask.vue'

interface Clappable {
  id: string
  text: string
  syllables: string[]
  image?: string
  say?: string
}

/**
 * A listening task: all words of the grade (also those without a picture) plus the
 * listening vocabulary (Hund, Sonne, Giraffe …) – no letters needed.
 */
export function clappables(ctx: LearnerContext, params: LesenParams): Clappable[] {
  const grade = params.wordGrade ?? ctx.grade
  const listenOnly = resolveListenWords(ctx.land, grade).filter((w) => w.source === 'hoeren')
  return [...gradeWords(ctx, params), ...listenOnly]
}

const spoken = (w: Clappable) => w.say ?? w.text

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

  items(ctx, params) {
    return clappables(ctx, params)
      .filter((w) => w.syllables.length <= MAX_SYLLABLES)
      .map((w) => `lesen.silben-klatschen:${w.id}`)
  },

  generate(ctx, params, itemKey) {
    const id = itemId(itemKey)
    const word = clappables(ctx, params).find((w) => w.id === id)
    if (!word) throw new Error(`Unbekanntes Wort: ${id}`)
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
