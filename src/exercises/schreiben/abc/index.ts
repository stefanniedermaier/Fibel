/**
 * S2-11 "Alphabet und Nachschlagen" (Deutsch 1/2, 4.4: "nutzen das Alphabet"):
 * which letter comes after/before, and which of three words comes first in the ABC
 * (first by the first letter, later by the second).
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { gradeWords, itemId, type SchreibenParams } from '../shared'
import WahlTask, { type WahlData } from '../schreibung/WahlTask.vue'

export const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export interface AbcParams extends SchreibenParams {
  mode: 'nach' | 'vor' | 'zuerst'
}

const plainFirst = (t: string) =>
  t.charAt(0).toUpperCase().replace('Ä', 'A').replace('Ö', 'O').replace('Ü', 'U')

export const abc: ExerciseModule<AbcParams, WahlData> = {
  id: 'schreiben.abc',
  topic: 'schreiben',

  items(ctx, params) {
    if (params.mode === 'zuerst')
      return gradeWords(ctx, params)
        .filter((w) => w.wortart === 'nomen' && plainFirst(w.text) < 'W')
        .map((w) => `schreiben.abc:zuerst:${w.id}`)
    const letters = params.mode === 'nach' ? ABC.slice(0, -1) : ABC.slice(1)
    return letters.map((l) => `schreiben.abc:${params.mode}:${l}`)
  },

  generate(ctx, params, itemKey, rng) {
    const [mode, value] = itemId(itemKey).split(':') as [AbcParams['mode'], string]
    if (mode === 'zuerst') {
      const words = gradeWords(ctx, params).filter((w) => w.wortart === 'nomen')
      const first = words.find((w) => w.id === value)!
      const later = shuffle(
        words.filter((w) => plainFirst(w.text) > plainFirst(first.text)),
        rng,
      )
      // Two words with different first letters that come later in the ABC.
      const picked: string[] = []
      for (const w of later)
        if (picked.length < 2 && !picked.some((p) => plainFirst(p) === plainFirst(w.text)))
          picked.push(w.text)
      return {
        instruction: 'Welches Wort steht im ABC zuerst?',
        hint: 'Schau auf den ersten Buchstaben. Welcher kommt im ABC früher?',
        solution: `${first.text} steht zuerst, denn ${plainFirst(first.text)} kommt im ABC vor den anderen.`,
        data: {
          correctKey: first.text,
          choices: shuffle([first.text, ...picked], rng).map((t) => ({ key: t, label: t })),
        },
      }
    }
    const i = ABC.indexOf(value)
    const answer = ABC[mode === 'nach' ? i + 1 : i - 1]!
    const others = shuffle(
      [ABC[i + 2], ABC[i - 2], ABC[mode === 'nach' ? i - 1 : i + 1]].filter(
        (x): x is string => !!x && x !== answer && x !== value,
      ),
      rng,
    ).slice(0, 2)
    return {
      instruction: `Welcher Buchstabe kommt im ABC direkt ${mode} ${value}?`,
      hint: 'Sag das ABC leise auf.',
      solution: `Direkt ${mode} ${value} kommt ${answer}.`,
      data: {
        prompt: mode === 'nach' ? `${value} → ?` : `? ← ${value}`,
        correctKey: answer,
        choices: shuffle([answer, ...others], rng).map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}
