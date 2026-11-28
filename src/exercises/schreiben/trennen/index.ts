/**
 * S3-1 "Silbentrennung am Zeilenende" (Deutsch 3/4, 4.4): which separation is right?
 * The right one follows the written syllables (Ta-sche, Zim-mer, di-cke); a single
 * letter is never separated (Abend, Igel), so such words are left out. The wrong ones
 * move a break by one letter (Tas-che) or split ck, ch, sch (dic-ke).
 */
import { shuffle } from '@/core/random'
import type { Word } from '@/core/types'
import type { ExerciseModule } from '../../types'
import { findWord, gradeWords, itemId, type SchreibenParams } from '../shared'
import WahlTask, { type WahlData } from '../schreibung/WahlTask.vue'
import { textChoices } from '../../choices'

export const hyphenated = (w: Pick<Word, 'syllables'>) => w.syllables.join('-')

/** Words with at least two syllables and no single-letter syllable at an end. */
export function separable(w: Word): boolean {
  const s = w.syllables
  return s.length >= 2 && s[0]!.length >= 2 && s.at(-1)!.length >= 2
}

/** Wrong separations: each break one letter to the left or right. */
export function wrongSeparations(w: Pick<Word, 'syllables' | 'text'>): string[] {
  const text = w.text
  const breaks: number[] = []
  let pos = 0
  for (const s of w.syllables.slice(0, -1)) breaks.push((pos += s.length))
  const out = new Set<string>()
  breaks.forEach((b, i) => {
    for (const d of [-1, 1]) {
      const moved = [...breaks]
      moved[i] = b + d
      if (moved.some((x, k) => x <= (moved[k - 1] ?? 0) || x >= text.length)) continue
      const parts = moved.map((x, k) => text.slice(moved[k - 1] ?? 0, x))
      parts.push(text.slice(moved.at(-1)))
      if (parts.some((p) => p.length === 0)) continue
      out.add(parts.join('-'))
    }
  })
  out.delete(hyphenated(w))
  return [...out]
}

export const trennen: ExerciseModule<SchreibenParams, WahlData> = {
  id: 'schreiben.trennen',
  topic: 'schreiben',

  items(ctx, params) {
    return gradeWords(ctx, params)
      .filter((w) => separable(w) && wrongSeparations(w).length >= 2)
      .filter((w) => !params.phenomena || w.phenomena.some((p) => params.phenomena!.includes(p)))
      .map((w) => `schreiben.trennen:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const word = findWord(gradeWords(ctx, params), itemId(itemKey))
    const right = hyphenated(word)
    const wrong = shuffle(wrongSeparations(word), rng).slice(0, 2)
    return {
      instruction: `Wie trennt man ${word.text} am Zeilenende?`,
      caption: 'Wie trennt man das Wort?',
      hint: 'Sprich das Wort langsam in Silben und klatsche dazu.',
      solution: `Man trennt ${word.syllables.join(' – ')}.`,
      data: {
        image: word.image,
        prompt: word.text,
        correctKey: right,
        choices: textChoices([right, ...wrong], rng),
      },
    }
  },

  component: WahlTask,
}
