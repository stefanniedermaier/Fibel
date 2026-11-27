/**
 * D10 "Selbstlaute finden": tap all vowels (Selbstlaute) of a word – the vowel is the
 * core of every syllable (Deutsch 1/2, 4.3 and 4.4). Words with a, e, i, o, u only, no
 * Ei/Au/Eu and no umlauts, so there is no doubt what counts.
 */
import { lauttreu } from '@/core/words'
import type { Word } from '@/core/types'
import type { ExerciseModule, LearnerContext } from '../../types'
import { findWord, itemId, readingPool, spoken } from '../../lesen/shared'
import VokaleTask from './VokaleTask.vue'

export interface VokaleData {
  letters: string[]
  vowels: number[]
  syllables: number
}

const SIMPLE = /^[a-zäöüß]+$/i
const VOWEL = /[aeiou]/i

export function vokalWords(ctx: LearnerContext): Word[] {
  return lauttreu(readingPool(ctx, {})).filter(
    (w) => SIMPLE.test(w.text) && w.level <= 3 && !/[äöü]/i.test(w.text) && w.text.length <= 7,
  )
}

export const vokale: ExerciseModule<Record<string, never>, VokaleData> = {
  id: 'sprache.vokale',
  topic: 'schreiben',

  items(ctx) {
    return vokalWords(ctx).map((w) => `sprache.vokale:${w.id}`)
  },

  generate(ctx, _params, itemKey) {
    const word = findWord(vokalWords(ctx), itemId(itemKey))
    const letters = [...word.text]
    const vowels = letters.map((l, i) => (VOWEL.test(l) ? i : -1)).filter((i) => i >= 0)
    return {
      instruction: `Tippe alle Selbstlaute in ${spoken(word)} an.`,
      caption: 'Tippe alle Selbstlaute an.',
      hint: 'Selbstlaute sind a, e, i, o und u.',
      solution: `Die Selbstlaute sind ${vowels.map((i) => letters[i]).join(', ')}.`,
      data: { letters, vowels, syllables: word.syllables.length },
    }
  },

  component: VokaleTask,
}
