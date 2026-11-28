/**
 * E3-1 to E3-6 (Englisch 3/4): listening first, reading only with pictures and known
 * words (LehrplanPLUS Englisch 3/4, 1.1). Every right answer repeats the English word
 * with the English voice.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../types'
import EnglischTask from './EnglischTask.vue'
import texteEn from '@/data/basis/englisch/texte.json'
import UhrWahlTask, { type UhrWahlData } from '../uhr/digital/UhrWahlTask.vue'
import WahlTask, { type WahlData } from '../schreiben/schreibung/WahlTask.vue'
import AbschreibenTask from '../schreiben/abschreiben/AbschreibenTask.vue'
import type { AbschreibenData } from '../schreiben/abschreiben'
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
import { textChoice, textChoices } from '../choices'

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

  items(ctx, params) {
    return DIALOGE.filter(
      (d) =>
        (d.klasse ?? 3) <= ctx.grade && (!params.dialoge?.length || params.dialoge.includes(d.id)),
    ).map((d) => `englisch.dialog:${d.id}`)
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
        choices: answers.map(textChoice),
      },
    }
  },

  component: EnglischTask,
}

// --- Grade 4 (plaene/klasse-4.md, section 10) ---------------------------------

const EINS = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]
const ZEHN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** English number words up to 99 ("forty-five"). */
export function englishNumber(n: number): string {
  if (n < 20) return EINS[n] || 'zero'
  const t = ZEHN[Math.floor(n / 10)]!
  return n % 10 ? `${t}-${EINS[n % 10]}` : t
}

/** E4-3: "It's quarter past three." – full, half and quarter hours. */
export function englishTime(total: number): string {
  const h = Math.floor(total / 60) % 12 || 12
  const m = total % 60
  const next = (h % 12) + 1
  if (m === 0) return `It's ${englishNumber(h)} o'clock.`
  if (m === 30) return `It's half past ${englishNumber(h)}.`
  if (m === 15) return `It's quarter past ${englishNumber(h)}.`
  return `It's quarter to ${englishNumber(next)}.`
}

export const uhrEnglisch: ExerciseModule<Record<string, never>, UhrWahlData> = {
  id: 'englisch.uhr',
  topic: 'englisch',

  items() {
    const keys: string[] = []
    for (let h = 1; h <= 12; h++)
      for (const m of [0, 15, 30, 45]) keys.push(`englisch.uhr:${h * 60 + m}`)
    return keys
  },

  generate(_ctx, _params, itemKey, rng) {
    const total = Number(itemKey.split(':')[1]) % 720
    const right = englishTime(total)
    // Typical mistakes: half past the next hour (German "halb vier"), past and to mixed up.
    const wrong = [
      ...new Set(
        [total + 60, total + 30, total - 30, total + 15, total - 15]
          .map((t) => englishTime(((t % 720) + 720) % 720))
          .filter((x) => x !== right),
      ),
    ]
    return {
      instruction: "[[en:What's the time?]] Tippe auf die richtige Uhrzeit.",
      caption: "What's the time?",
      hint: 'Half past three heißt halb vier: eine halbe Stunde nach drei.',
      solution: `[[en:${right}]]`,
      afterword: `[[en:${right}]]`,
      data: {
        clocks: [{ total: total === 0 ? 720 : total }],
        correctKey: right,
        choices: shuffle([right, ...shuffle(wrong, rng).slice(0, 2)], rng).map((t) => ({
          key: t,
          label: t,
        })),
      },
    }
  },

  component: UhrWahlTask,
}

/** E4-4: a price is spoken in English, the child taps it ("three euros fifty"). */
export const PREISE = [150, 199, 250, 300, 345, 420, 500, 675, 810, 999, 1250, 1500, 1720, 1999]

export const englishPrice = (ct: number) => {
  const e = Math.floor(ct / 100)
  const c = ct % 100
  return `${englishNumber(e)} ${e === 1 ? 'euro' : 'euros'}${c ? ` ${englishNumber(c)}` : ''}`
}
const euro = (ct: number) => `${Math.floor(ct / 100)},${String(ct % 100).padStart(2, '0')} €`

export const preisEnglisch: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'englisch.preis',
  topic: 'englisch',

  items() {
    return PREISE.map((p) => `englisch.preis:${p}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const ct = Number(itemKey.split(':')[1])
    const said = `It's ${englishPrice(ct)}.`
    const wrong = [
      ...new Set([ct + 100, ct - 100, (ct % 100) * 100 + Math.floor(ct / 100), ct + 10]),
    ]
      .filter((x) => x > 0 && x !== ct)
      .map(euro)
    return {
      instruction: `[[en:How much is it?]] Hör zu: [[en:${said}]]`,
      caption: 'How much is it? Hör zu und tippe auf den Preis.',
      hint: `Hör noch einmal: [[en:${said}]]`,
      solution: `[[en:${said}]] Das sind ${euro(ct)}.`,
      data: {
        correctKey: euro(ct),
        choices: shuffle([euro(ct), ...shuffle(wrong, rng).slice(0, 2)], rng).map((t) => ({
          key: t,
          label: t,
        })),
      },
    }
  },

  component: WahlTask,
}

/** E4-5: short picture-supported texts (invitation, profile, poster), questions in German. */
export interface EnglischText {
  id: string
  text: string
  fragen: { frage: string; richtig: string; falsch: string[] }[]
}
export const TEXTE_EN: readonly EnglischText[] = texteEn

export const textEnglisch: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'englisch.text',
  topic: 'englisch',

  items() {
    return TEXTE_EN.flatMap((t) => t.fragen.map((_, i) => `englisch.text:${t.id}:${i}`))
  },

  generate(_ctx, _params, itemKey, rng) {
    const [, id, i] = itemKey.split(':') as [string, string, string]
    const t = TEXTE_EN.find((x) => x.id === id)!
    const f = t.fragen[Number(i)]!
    return {
      instruction: `Lies den englischen Text. ${f.frage}`,
      caption: f.frage,
      hint: `Hör dir den Text an: [[en:${t.text}]]`,
      solution: `Richtig ist: ${f.richtig}.`,
      data: {
        prompt: t.text,
        correctKey: f.richtig,
        choices: textChoices([f.richtig, ...f.falsch], rng),
      },
    }
  },

  component: WahlTask,
}

/** E4-6: copy known words – look, cover, type (one word, no spaces). */
export const abschreibenEnglisch: ExerciseModule<EnglischParams, AbschreibenData> = {
  id: 'englisch.abschreiben',
  topic: 'englisch',

  items(ctx, params) {
    return wordsFor(params.themen, gradeOf(ctx.grade, params))
      .filter((w) => /^[a-z]+$/i.test(w.en) && w.thema !== 'zahlen')
      .map((w) => `englisch.abschreiben:${w.id}`)
  },

  generate(_ctx, _params, itemKey) {
    const w = getWord(itemOf(itemKey))
    return {
      instruction: `Schau dir das englische Wort genau an: [[en:${w.en}]]. Dann schreib es auswendig.`,
      caption: 'Look – cover – write',
      hint: `Schau es dir nochmal an: [[en:${w.en}]]`,
      solution: `So schreibt man [[en:${w.en}]].`,
      data: {
        image: w.image,
        spoken: `[[en:${w.en}]]`,
        target: w.en,
        strictCase: true,
        autoCapitalize: false,
        slots: true,
        merkwort: false,
      },
    }
  },

  component: AbschreibenTask,
}
