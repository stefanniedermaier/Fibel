/**
 * D4/D5 "Texte und Geschichten": a short text, then a question with pictures as answers.
 * `kind: 'lesen'` – the child reads the text itself (only known words; it appears once
 *   all words are readable). Deutsch 1/2, 2.2 and 2.3.
 * `kind: 'hoeren'` – the story is read aloud, the child listens (Deutsch 1/2, 1.1);
 *   any words, no reading needed.
 */
import texte from '@/data/basis/klasse-1/texte.json'
import { textReadable, textTokens, type SentenceToken } from '@/core/saetze'
import { shuffle } from '@/core/random'
import { resolveWords } from '@/core/words'
import type { ExerciseModule } from '../../types'
import TextFragenTask from './TextFragenTask.vue'

export interface Frage {
  frage: string
  /** Pictures (grade 1) or short text answers (from grade 2). */
  choices: { scene?: string[]; text?: string }[]
  answer: number
}

export interface Text {
  id: string
  kind: 'lesen' | 'hoeren'
  text: string
  fragen: Frage[]
}

export const TEXTE: readonly Text[] = texte as Text[]

const FILES = import.meta.glob<Text[]>('../../../data/basis/klasse-*/texte.json', {
  eager: true,
  import: 'default',
})

/** The texts of a grade (grade 1: TEXTE). */
export function textsFor(grade: number): readonly Text[] {
  return FILES[`../../../data/basis/klasse-${grade}/texte.json`] ?? []
}

export interface TextFragenParams {
  kind: 'lesen' | 'hoeren'
}

export interface TextFragenData {
  kind: 'lesen' | 'hoeren'
  /** lesen: the text, sentence by sentence. */
  sentences: SentenceToken[][]
  coloring: boolean
  story: string
  question: string
  choices: { key: string; scene?: string[]; text?: string }[]
  correctKey: string
}

export const textFragen: ExerciseModule<TextFragenParams, TextFragenData> = {
  id: 'lesen.text-fragen',
  topic: 'lesen',

  items(ctx, params) {
    return textsFor(ctx.grade)
      .filter(
        (t) =>
          t.kind === params.kind &&
          (t.kind === 'hoeren' || textReadable(t.text, ctx.land, ctx.grade, ctx.settings)),
      )
      .flatMap((t) => t.fragen.map((_, i) => `lesen.text-fragen:${t.id}:${i}`))
  },

  generate(ctx, params, itemKey, rng) {
    const [, id, q] = itemKey.split(':') as [string, string, string]
    const text = textsFor(ctx.grade).find((t) => t.id === id)
    const frage = text?.fragen[Number(q)]
    if (!text || !frage) throw new Error(`Unbekannter Text: ${itemKey}`)
    const choices = shuffle(
      frage.choices.map((c, i) => ({ key: String(i), scene: c.scene, text: c.text })),
      rng,
    )
    const listen = params.kind === 'hoeren'
    return {
      instruction: listen
        ? `Hör gut zu. ${text.text} ${frage.frage}`
        : `Lies den Text. ${frage.frage}`,
      caption: frage.frage,
      hint: listen ? 'Hör dir die Geschichte noch einmal an.' : 'Lies den Text noch einmal genau.',
      solution: `Die Antwort steht im Text: ${text.text}`,
      data: {
        kind: params.kind,
        sentences: listen ? [] : textTokens(text.text, resolveWords(ctx.land, ctx.grade)),
        coloring: ctx.settings.syllableColoring,
        story: text.text,
        question: frage.frage,
        choices,
        correctKey: String(frage.answer),
      },
    }
  },

  component: TextFragenTask,
}
