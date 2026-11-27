/**
 * E3-1 to E3-6 (Englisch 3/4): listening first, reading only with pictures and known
 * words (LehrplanPLUS Englisch 3/4, 1.1). Every right answer repeats the English word
 * with the English voice.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../types'
import EnglischTask from './EnglischTask.vue'
import {
  choiceOf,
  DIALOGE,
  en,
  getWord,
  look,
  others,
  wordsFor,
  type EnglischData,
  type EnglischParams,
} from './shared'

export const CHOICES = 4
const itemOf = (key: string) => key.slice(key.indexOf(':') + 1)
const gradeOf = (grade: number, params: EnglischParams) => params.klasse ?? grade

/** Hören: the English word is spoken, the child taps the picture. */
export const hoeren: ExerciseModule<EnglischParams, EnglischData> = {
  id: 'englisch.hoeren',
  topic: 'englisch',

  items(ctx, params) {
    return wordsFor(params.themen, gradeOf(ctx.grade, params)).map((w) => `englisch.hoeren:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const word = getWord(itemOf(itemKey))
    const pool = wordsFor(params.themen, gradeOf(ctx.grade, params))
    const rest = others(word, pool, CHOICES, (l) => shuffle(l, rng))
    return {
      instruction: `Hör zu: ${en(word.en)}. Tippe auf das passende Bild.`,
      caption: 'Hör zu und tippe auf das passende Bild.',
      hint: `Hör noch einmal: ${en(word.en)}.`,
      solution: `${en(word.en)} heißt ${word.de}.`,
      afterword: en(word.en),
      data: {
        correctKey: word.id,
        choices: shuffle([word, ...rest], rng).map(choiceOf),
      },
    }
  },

  component: EnglischTask,
}

export interface LesenParams extends EnglischParams {
  /** 'wort-bild': read the word, tap the picture; 'bild-wort': the other way round. */
  richtung: 'wort-bild' | 'bild-wort'
}

/** Lesen: a known word and its picture (Leseverstehen, bildgestützt). */
export const lesen: ExerciseModule<LesenParams, EnglischData> = {
  id: 'englisch.lesen',
  topic: 'englisch',

  items(ctx, params) {
    return wordsFor(params.themen, gradeOf(ctx.grade, params)).map(
      (w) => `englisch.lesen:${params.richtung}:${w.id}`,
    )
  },

  generate(ctx, params, itemKey, rng) {
    const word = getWord(itemKey.split(':').at(-1)!)
    const pool = wordsFor(params.themen, gradeOf(ctx.grade, params))
    const all = shuffle([word, ...others(word, pool, CHOICES, (l) => shuffle(l, rng))], rng)
    const common = {
      solution: `Das ist ${en(word.en)}. Auf Deutsch: ${word.de}.`,
      afterword: en(word.en),
    }
    if (params.richtung === 'wort-bild')
      return {
        ...common,
        instruction: 'Lies das englische Wort. Tippe auf das passende Bild.',
        hint: `Das Wort heißt ${en(word.en)}.`,
        data: { prompt: { text: word.en }, correctKey: word.id, choices: all.map(choiceOf) },
      }
    const shown = look(word)
    return {
      ...common,
      instruction: 'Wie heißt das auf Englisch? Tippe auf das richtige Wort.',
      hint: `Auf Deutsch heißt es ${word.de}.`,
      data: {
        prompt: word.image ? { image: shown } : { text: shown },
        correctKey: word.id,
        choices: all.map((w) => ({ key: w.id, label: w.en })),
      },
    }
  },

  component: EnglischTask,
}

export interface DialogParams {
  /** Dialogue ids; empty or missing = all. */
  dialoge?: string[]
}

/** Dialog: a question is spoken in English, the child picks the fitting answer. */
export const dialog: ExerciseModule<DialogParams, EnglischData> = {
  id: 'englisch.dialog',
  topic: 'englisch',

  items(_ctx, params) {
    return DIALOGE.filter((d) => !params.dialoge?.length || params.dialoge.includes(d.id)).map(
      (d) => `englisch.dialog:${d.id}`,
    )
  },

  generate(_ctx, _params, itemKey, rng) {
    const d = DIALOGE.find((x) => x.id === itemOf(itemKey))
    if (!d) throw new Error(`Unbekannter Dialog: ${itemKey}`)
    const answers = shuffle([d.antwort, ...d.falsch.slice(0, CHOICES - 1)], rng)
    return {
      instruction: `Hör zu: ${en(d.frage)} Was antwortest du? Tippe auf die Antwort.`,
      caption: `${d.frage} – Was antwortest du?`,
      hint: `Hör noch einmal: ${en(d.frage)}`,
      solution: `Du kannst sagen: ${en(d.antwort)}`,
      afterword: `${en(d.frage)} ${en(d.antwort)}`,
      data: {
        correctKey: d.antwort,
        choices: answers.map((a) => ({ key: a, label: a })),
      },
    }
  },

  component: EnglischTask,
}
