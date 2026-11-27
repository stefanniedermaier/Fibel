/**
 * Sprache in grade 2 (plaene/klasse-2.md, section 5; Deutsch 1/2, 4.3): word types,
 * article, plural, verb forms, word families, word fields and compound nouns. All are
 * "pick the right one" tasks with text answers (WahlTask).
 */
import sprache from '@/data/basis/klasse-2/sprache.json'
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { Word } from '@/core/types'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule, LearnerContext } from '../../types'
import { findWord, gradeWords, itemId, spoken } from '../../lesen/shared'

const words = (ctx: LearnerContext) => gradeWords(ctx, { wordGrade: 2 })
const choices = (labels: readonly string[], rng: Rng) =>
  shuffle([...labels], rng).map((t) => ({ key: t, label: t }))
const lower = (t: string) => t.toLowerCase()

// --- SP2-2, SP2-6: Wortarten -------------------------------------------------

export const WORTART_NAMES = { nomen: 'Nomen', verb: 'Verb', adjektiv: 'Adjektiv' } as const
type Haupt = keyof typeof WORTART_NAMES

export interface WortartParams {
  /** 'nomen': which of three words is a noun? 'wortart': noun, verb or adjective? */
  mode: 'nomen' | 'wortart'
}

export const wortart: ExerciseModule<WortartParams, WahlData> = {
  id: 'sprache.wortart',
  topic: 'sprache',

  items(ctx, params) {
    return words(ctx)
      .filter((w) => (params.mode === 'nomen' ? w.wortart === 'nomen' : w.wortart in WORTART_NAMES))
      .map((w) => `sprache.wortart:${params.mode}:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const id = itemId(itemKey).split(':')[1]!
    const all = words(ctx)
    const word = findWord(all, id)
    if (params.mode === 'nomen') {
      // Shown in small letters: the capital would give the noun away (Artikelprobe!).
      const others = shuffle(
        all.filter((w) => w.wortart === 'verb' || w.wortart === 'adjektiv'),
        rng,
      ).slice(0, 2)
      return {
        instruction: 'Welches Wort ist ein Nomen? Mach die Artikelprobe: der, die oder das?',
        caption: 'Welches Wort ist ein Nomen?',
        hint: 'Vor ein Nomen kann man der, die oder das setzen.',
        solution: `${word.text} ist ein Nomen: ${word.artikel} ${word.text}. Nomen schreibt man groß.`,
        data: {
          correctKey: lower(word.text),
          choices: choices(
            [word, ...others].map((w) => lower(w.text)),
            rng,
          ),
        },
      }
    }
    const kind = word.wortart as Haupt
    return {
      instruction: `Welche Wortart ist ${spoken(word)}?`,
      caption: 'Nomen, Verb oder Adjektiv?',
      hint: 'Nomen: der, die, das. Verb: ich …, du …. Adjektiv: wie etwas ist.',
      solution: `${word.text} ist ein ${WORTART_NAMES[kind]}.`,
      data: {
        prompt: lower(word.text),
        correctKey: WORTART_NAMES[kind],
        choices: Object.values(WORTART_NAMES).map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}

// --- SP2-2: Artikel -------------------------------------------------------------

export const artikel: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'sprache.artikel',
  topic: 'sprache',

  items(ctx) {
    return words(ctx)
      .filter((w) => w.artikel && w.plural !== w.text)
      .map((w) => `sprache.artikel:${w.id}`)
  },

  generate(ctx, _params, itemKey) {
    const word = findWord(words(ctx), itemId(itemKey))
    return {
      instruction: `Der, die oder das? ${spoken(word)}.`,
      caption: 'Welcher Artikel passt?',
      hint: 'Sprich alle drei: der …, die …, das …. Was klingt richtig?',
      solution: `Es heißt ${word.artikel} ${word.text}.`,
      data: {
        image: word.image,
        prompt: `___ ${word.text}`,
        correctKey: word.artikel!,
        choices: ['der', 'die', 'das'].map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}

// --- SP2-3, SP2-5: Mehrzahl und Personalform --------------------------------------

const UMLAUT: Record<string, string> = { ä: 'a', ö: 'o', ü: 'u', Ä: 'A', Ö: 'O', Ü: 'U' }

/** Wrong plurals: -s, -en/-e, without umlaut (Häuser → Hauser). */
export function wrongPlurals(word: Word): string[] {
  const t = word.text
  const p = word.plural!
  const candidates = [
    `${t}s`,
    t.endsWith('e') ? `${t}n` : `${t}e`,
    t.endsWith('e') ? `${t}s` : `${t}en`,
    p.replace(/[äöüÄÖÜ]/, (c) => UMLAUT[c]!),
  ]
  return [...new Set(candidates)].filter((x) => x !== p)
}

/** ich, du, er/sie/es forms from the infinitive and the er-form (spielt, spricht). */
export function personalForms(word: Word): { ich: string; du: string; er: string } | undefined {
  const er = word.er
  if (!er?.endsWith('t') || !word.text.endsWith('en')) return undefined
  const stem = er.slice(0, -1)
  const ich = word.text.slice(0, -1)
  const du = /[sßzx]$/.test(stem) ? er : `${stem}st`
  return { ich, du, er }
}

export interface FormenParams {
  mode: 'mehrzahl' | 'person'
}

export const formen: ExerciseModule<FormenParams, WahlData> = {
  id: 'sprache.formen',
  topic: 'sprache',

  items(ctx, params) {
    if (params.mode === 'mehrzahl')
      return words(ctx)
        .filter((w) => w.plural && w.plural !== w.text && wrongPlurals(w).length >= 2)
        .map((w) => `sprache.formen:mehrzahl:${w.id}`)
    return words(ctx)
      .filter((w) => personalForms(w))
      .flatMap((w) => ['ich', 'du', 'er'].map((p) => `sprache.formen:person:${w.id}-${p}`))
  },

  generate(ctx, params, itemKey, rng) {
    const value = itemId(itemKey).split(':')[1]!
    if (params.mode === 'mehrzahl') {
      const word = findWord(words(ctx), value)
      const wrong = shuffle(wrongPlurals(word), rng).slice(0, 2)
      return {
        instruction: `${word.artikel} ${spoken(word)}. Und viele? Wie heißt die Mehrzahl?`,
        caption: 'Wie heißt die Mehrzahl?',
        hint: 'Sprich: ein …, viele ….',
        solution: `Die Mehrzahl von ${word.text} ist ${word.plural}.`,
        data: {
          image: word.image,
          helper: `${word.artikel} ${word.text} → die …`,
          correctKey: word.plural!,
          choices: choices([word.plural!, ...wrong], rng),
        },
      }
    }
    const [id, person] = value.split('-') as [string, 'ich' | 'du' | 'er']
    const word = findWord(words(ctx), id)
    const forms = personalForms(word)!
    const pronoun = person === 'er' ? pickOne(['er', 'sie', 'es'], rng) : person
    const labels = [...new Set([forms.ich, forms.du, forms.er])]
    return {
      instruction: `Setze ${spoken(word)} richtig ein: ${pronoun} …`,
      caption: 'Welche Form passt?',
      hint: 'Sprich den ganzen Satzanfang laut.',
      solution: `Es heißt: ${pronoun} ${forms[person]}.`,
      data: {
        helper: `${word.text}`,
        prompt: `${pronoun} ___`,
        correctKey: forms[person],
        choices: choices(labels, rng),
      },
    }
  },

  component: WahlTask,
}

// --- SP2-8: Wortfamilien ------------------------------------------------------

interface Familie {
  stamm: string
  woerter: string[]
  fremd: string[]
}
export const WORTFAMILIEN: readonly Familie[] = sprache.wortfamilien

export const wortfamilie: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'sprache.wortfamilie',
  topic: 'sprache',

  items() {
    return WORTFAMILIEN.flatMap((f) => f.woerter.map((w) => `sprache.wortfamilie:${f.stamm}:${w}`))
  },

  generate(_ctx, _params, itemKey, rng) {
    const [, stamm, wort] = itemKey.split(':') as [string, string, string]
    const f = WORTFAMILIEN.find((x) => x.stamm === stamm)!
    return {
      instruction: `Welches Wort gehört zur Wortfamilie ${stamm}?`,
      hint: `Such den Wortstamm von ${stamm} im Wort.`,
      solution: `${wort} gehört zur Wortfamilie ${stamm}.`,
      data: {
        helper: `Wortfamilie: ${stamm}`,
        correctKey: wort,
        choices: choices([wort, ...f.fremd], rng),
      },
    }
  },

  component: WahlTask,
}

// --- SP2-10: Wortfelder ---------------------------------------------------------

interface Feld {
  feld: string
  woerter: string[]
}
export const WORTFELDER: readonly Feld[] = sprache.wortfelder

export const wortfeld: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'sprache.wortfeld',
  topic: 'sprache',

  items() {
    return WORTFELDER.flatMap((f) => f.woerter.map((w) => `sprache.wortfeld:${f.feld}:${w}`))
  },

  generate(_ctx, _params, itemKey, rng) {
    const [, feld, wort] = itemKey.split(':') as [string, string, string]
    const others = shuffle(
      WORTFELDER.filter((f) => f.feld !== feld).flatMap((f) => f.woerter),
      rng,
    ).slice(0, 2)
    return {
      instruction: `Welches Wort passt zum Wortfeld ${feld}?`,
      hint: `Welches Wort sagt etwas Ähnliches wie ${feld}?`,
      solution: `${wort} passt zu ${feld}.`,
      data: {
        helper: `Wortfeld: ${feld}`,
        correctKey: wort,
        choices: choices([wort, ...others], rng),
      },
    }
  },

  component: WahlTask,
}

// --- SP2-9: Zusammengesetzte Nomen ----------------------------------------------

interface Zusammensetzung {
  id: string
  teile: string[]
  text: string
}
export const ZUSAMMENGESETZT: readonly Zusammensetzung[] = sprache.zusammensetzungen

export const zusammensetzen: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'sprache.zusammensetzen',
  topic: 'sprache',

  items() {
    return ZUSAMMENGESETZT.map((z) => `sprache.zusammensetzen:${z.id}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const z = ZUSAMMENGESETZT.find((x) => x.id === itemId(itemKey))!
    const [a, b] = z.teile as [string, string]
    // Typical mistakes: the parts swapped, the second part with a capital letter.
    const wrong = [`${b}${a.toLowerCase()}`, `${z.text.slice(0, z.text.length - b.length)}${b}`]
    return {
      instruction: `${a} und ${b}. Wie schreibt man das neue Wort?`,
      caption: 'Wie schreibt man das neue Wort?',
      hint: 'Das neue Wort ist ein Nomen: vorne groß, in der Mitte klein.',
      solution: `${a} und ${b} wird zu ${z.text}.`,
      data: {
        helper: `${a} + ${b}`,
        correctKey: z.text,
        choices: choices([z.text, ...new Set(wrong.filter((w) => w !== z.text))], rng),
      },
    }
  },

  component: WahlTask,
}

// --- L2-3: Wortbausteine ver-, vor-, un- ----------------------------------------

interface Bausteine {
  baustein: string
  woerter: string[]
}
export const BAUSTEINE: readonly Bausteine[] = sprache.bausteine

/** "verlaufen" → "ver" + "laufen" (case kept for nouns: "Vorsicht" → "Vor" + "sicht"). */
export function splitBaustein(wort: string, baustein: string): [string, string] {
  return [wort.slice(0, baustein.length), wort.slice(baustein.length)]
}

export interface BausteinParams {
  /** 'erkennen': which part is at the front? 'schreiben': ver-/vor- always with v. */
  mode: 'erkennen' | 'schreiben'
}

export const bausteine: ExerciseModule<BausteinParams, WahlData> = {
  id: 'lesen.bausteine',
  topic: 'lesen',

  items(_ctx, params) {
    return BAUSTEINE.filter((b) => params.mode === 'erkennen' || b.baustein !== 'un').flatMap((b) =>
      b.woerter.map((w) => `lesen.bausteine:${params.mode}:${b.baustein}-${w}`),
    )
  },

  generate(_ctx, params, itemKey, rng) {
    const [baustein, wort] = itemKey.split(':')[2]!.split('-') as [string, string]
    const [front, rest] = splitBaustein(wort, baustein)
    if (params.mode === 'schreiben') {
      // The typical mistake: f instead of v (ferlaufen, Forsicht).
      const f = front.replace(/^v/, 'f').replace(/^V/, 'F')
      const wrong = [`${f}${rest}`, `${front}r${rest}`]
      return {
        instruction: `Wie schreibt man ${wort}? Tippe auf das richtige Wort.`,
        caption: 'Welches Wort ist richtig geschrieben?',
        hint: 'Ver- und vor- schreibt man immer mit v.',
        solution: `Richtig ist ${wort}: ${front} mit v.`,
        data: { correctKey: wort, choices: choices([wort, ...wrong], rng) },
      }
    }
    return {
      instruction: 'Lies das Wort. Welcher Baustein steht vorne?',
      hint: 'Deck den Anfang mit dem Finger ab. Was bleibt übrig?',
      solution: `${wort} ist ${front} und ${rest}.`,
      data: {
        prompt: wort,
        correctKey: baustein,
        choices: ['ver', 'vor', 'un'].map((b) => ({ key: b, label: `${b}-` })),
      },
    }
  },

  component: WahlTask,
}
