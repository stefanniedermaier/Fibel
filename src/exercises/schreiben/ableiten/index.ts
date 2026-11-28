/**
 * S2-6 und S2-7 "Verlängern und ableiten" (morphological principle, ISB 1/2): the
 * related form is shown (Hunde → Hun?, Baum → B?ume) and the child picks the letter:
 * d or t, b or p, g or k; äu or eu, ä or e.
 */
import { shuffle } from '@/core/random'
import type { Word } from '@/core/types'
import type { ExerciseModule } from '../../types'
import { findWord, gradeWords, itemId, writingPool, type SchreibenParams } from '../shared'
import WahlTask, { type WahlData } from '../schreibung/WahlTask.vue'
import { textChoices } from '../../choices'

const HARD: Record<string, string> = { b: 'p', d: 't', g: 'k' }

export interface Luecke {
  before: string
  right: string
  wrong: string
  after: string
}

/** Where the letter to derive is: the last b/d/g at the end, or the umlaut. */
export function lueckeOf(word: Word): Luecke | undefined {
  const w = word.ableiten?.wort
  if (!w) return undefined
  // Silbentrennendes h (grade 3): Schuh because of Schu-he – the h can be heard there.
  if (word.schwerpunkt === 'h') {
    const i = word.text.lastIndexOf('h')
    return { before: word.text.slice(0, i), right: 'h', wrong: '–', after: word.text.slice(i + 1) }
  }
  if (word.phenomena.includes('verhaertung')) {
    const m = /[bdg](?=[^aeiouäöü]*$)/.exec(w)
    if (!m) return undefined
    return {
      before: w.slice(0, m.index),
      right: m[0],
      wrong: HARD[m[0]]!,
      after: w.slice(m.index + 1),
    }
  }
  const m = /äu|Äu|ä|Ä/.exec(w)
  if (!m) return undefined
  const wrong = { äu: 'eu', Äu: 'Eu', ä: 'e', Ä: 'E' }[m[0]]!
  return { before: w.slice(0, m.index), right: m[0], wrong, after: w.slice(m.index + m[0].length) }
}

export const ableiten: ExerciseModule<SchreibenParams, WahlData> = {
  id: 'schreiben.ableiten',
  topic: 'schreiben',

  items(ctx, params) {
    return writingPool(ctx, params)
      .filter((w) => lueckeOf(w))
      .map((w) => `schreiben.ableiten:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const word = findWord(gradeWords(ctx, params), itemId(itemKey))
    const l = lueckeOf(word)!
    const { wort, von } = word.ableiten!
    const hard = word.phenomena.includes('verhaertung')
    if (word.schwerpunkt === 'h')
      return {
        instruction: `${word.text}. Verlängere das Wort: ${wort}. Hört man das h?`,
        caption: 'Verlängere das Wort. Schreibt man ein h?',
        hint: `Sprich ${wort} in Silben: ${wort.replace(/h/, '-h')}.`,
        solution: `${word.text} schreibt man mit h, wegen ${wort}.`,
        data: {
          image: word.image,
          helper: `${wort} → ?`,
          prompt: `${l.before}_${l.after}`,
          correctKey: 'h',
          choices: shuffle(
            [
              { key: 'h', label: 'h' },
              { key: '–', label: 'kein h' },
            ],
            rng,
          ),
        },
      }
    return {
      instruction: hard
        ? `${wort}. Verlängere das Wort: ${von}. Schreibt man ${l.right} oder ${l.wrong}?`
        : `${wort} kommt von ${von}. Schreibt man ${l.right} oder ${l.wrong}?`,
      caption: hard ? 'Verlängere das Wort. Welcher Buchstabe fehlt?' : 'Leite ab. Was fehlt?',
      hint: hard ? `Sprich ${von} deutlich. Was hörst du?` : `Denk an ${von}.`,
      solution: `${wort} schreibt man mit ${l.right}, wegen ${von}.`,
      data: {
        image: word.image,
        helper: hard ? `${von} → ?` : `${von} → ?`,
        prompt: `${l.before}_${l.after}`,
        correctKey: l.right,
        choices: textChoices([l.right, l.wrong], rng),
      },
    }
  },

  component: WahlTask,
}
