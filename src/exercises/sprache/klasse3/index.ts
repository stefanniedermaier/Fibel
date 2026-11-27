/**
 * Sprache in grade 3 (plaene/klasse-3.md, section 5; Deutsch 3/4, 4.3 and 4.4):
 * Steigerung, Zeitformen (Präteritum, Perfekt), Nachsilben and the article of
 * compound nouns. All are choices with text answers (WahlTask).
 */
import sprache3 from '@/data/basis/klasse-3/sprache.json'
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { Word } from '@/core/types'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule, LearnerContext } from '../../types'
import { findWord, gradeWords, itemId } from '../../lesen/shared'

const words3 = (ctx: LearnerContext) => gradeWords(ctx, { wordGrade: 3 })
const choices = (labels: readonly string[], rng: Rng) =>
  shuffle([...new Set(labels)], rng).map((t) => ({ key: t, label: t }))
const UML: Record<string, string> = { ä: 'a', ö: 'o', ü: 'u' }
const noUmlaut = (s: string) => s.replace(/[äöü]/, (c) => UML[c]!)

// --- SP3-2, SP3-3: Formen ----------------------------------------------------

export interface Formen3Params {
  mode: 'steigerung' | 'praeteritum' | 'perfekt'
}

/** Wrong comparatives and superlatives: without umlaut, regular ending. */
export function wrongSteigerung(w: Word, stufe: 0 | 1): string[] {
  const [komp, sup] = w.steigerung!
  const t = w.text
  const out =
    stufe === 0
      ? [`${t}er`, noUmlaut(komp), `${t}erer`, `mehr ${t}`]
      : [`am ${t}sten`, `am ${noUmlaut(sup.slice(3))}`, `am ${komp}sten`, `am meisten ${t}`]
  return out.filter((x, i, all) => x !== (stufe === 0 ? komp : sup) && all.indexOf(x) === i)
}

/** Stem of a verb: "singen" → "sing", "sammeln" → "sammel". */
const stem = (inf: string) => inf.replace(/e?n$/, '')

export function wrongPraeteritum(w: Word): string[] {
  const s = stem(w.text)
  return [`${s}te`, w.er!, `${s}t`, `ge${s}t`].filter(
    (x, i, all) => x !== w.praeteritum && all.indexOf(x) === i,
  )
}

export function wrongPartizip(w: Word): string[] {
  const part = w.perfekt!.split(' ').at(-1)!
  const s = stem(w.text)
  // "gesangen" is a typical mistake; with a weak past tense (wurde, gehörte) it is not.
  const strong = w.praeteritum!.endsWith('e') ? [] : [`ge${w.praeteritum}en`]
  return [`ge${s}t`, `ge${s}en`, ...strong, `${s}t`].filter(
    (x, i, all) => x !== part && all.indexOf(x) === i,
  )
}

export const formen3: ExerciseModule<Formen3Params, WahlData> = {
  id: 'sprache.formen3',
  topic: 'sprache',

  items(ctx, params) {
    const ws = words3(ctx)
    if (params.mode === 'steigerung')
      return ws
        .filter((w) => w.steigerung && !w.steigerung[0].startsWith('besser'))
        .flatMap((w) => [0, 1].map((st) => `sprache.formen3:steigerung:${w.id}-${st}`))
    if (params.mode === 'praeteritum')
      return ws
        .filter((w) => w.praeteritum && w.er?.endsWith('t'))
        .map((w) => `sprache.formen3:praeteritum:${w.id}`)
    return ws.filter((w) => w.perfekt).map((w) => `sprache.formen3:perfekt:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const value = itemId(itemKey).split(':')[1]!
    if (params.mode === 'steigerung') {
      const [id, st] = value.split('-') as [string, string]
      const w = findWord(words3(ctx), id)
      const [komp, sup] = w.steigerung!
      const stufe = Number(st) as 0 | 1
      const right = stufe === 0 ? komp : sup
      return {
        instruction: `Steigere das Adjektiv ${w.text}. Welche Form fehlt?`,
        caption: 'Welche Form fehlt?',
        hint: 'Sprich: groß, größer, am größten.',
        solution: `${w.text}, ${komp}, ${sup}.`,
        data: {
          prompt: stufe === 0 ? `${w.text} – ? – ${sup}` : `${w.text} – ${komp} – ?`,
          correctKey: right,
          choices: choices([right, ...shuffle(wrongSteigerung(w, stufe), rng).slice(0, 2)], rng),
        },
      }
    }
    const w = findWord(words3(ctx), value)
    const pronoun = pickOne(['er', 'sie'], rng)
    if (params.mode === 'praeteritum') {
      return {
        instruction: `Heute ${w.er} ${pronoun}. Und gestern? Gestern …`,
        caption: 'Wie heißt die Vergangenheit?',
        hint: 'Erzähl, was gestern war: Gestern …',
        solution: `Gestern ${w.praeteritum} ${pronoun}.`,
        data: {
          helper: `Heute ${w.er} ${pronoun}.`,
          prompt: `Gestern ___ ${pronoun}.`,
          correctKey: w.praeteritum!,
          choices: choices([w.praeteritum!, ...shuffle(wrongPraeteritum(w), rng).slice(0, 2)], rng),
        },
      }
    }
    const [aux, part] = w.perfekt!.split(' ') as [string, string]
    return {
      instruction: `Heute ${w.er} ${pronoun}. Gestern ${aux} ${pronoun} …`,
      caption: 'Welche Form passt?',
      hint: `Das Perfekt: ${pronoun} ${aux} …`,
      solution: `${pronoun.charAt(0).toUpperCase()}${pronoun.slice(1)} ${aux} ${part}.`,
      data: {
        helper: `Heute ${w.er} ${pronoun}.`,
        prompt: `Gestern ${aux} ${pronoun} ___.`,
        correctKey: part,
        choices: choices([part, ...shuffle(wrongPartizip(w), rng).slice(0, 2)], rng),
      },
    }
  },

  component: WahlTask,
}

// --- SP3-4: Nachsilben ----------------------------------------------------------

interface Nachsilbe {
  basis: string
  baustein: string
  wort: string
}
export const NACHSILBEN: readonly Nachsilbe[] = sprache3.nachsilben
const OTHER: Record<string, string[]> = {
  ung: ['heit', 'keit'],
  heit: ['keit', 'ung'],
  keit: ['heit', 'ung'],
  ig: ['lich', 'isch'],
  lich: ['ig', 'isch'],
}

export const nachsilben: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'sprache.nachsilben',
  topic: 'sprache',

  items() {
    return NACHSILBEN.map((n) => `sprache.nachsilben:${n.wort}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const n = NACHSILBEN.find((x) => x.wort === itemId(itemKey))!
    const noun = ['ung', 'heit', 'keit'].includes(n.baustein)
    const root = n.wort.slice(0, n.wort.length - n.baustein.length)
    // Wrong: another suffix, or the capital letter wrong (nouns big, adjectives small).
    const wrong = [
      `${root}${OTHER[n.baustein]![0]}`,
      noun ? n.wort.toLowerCase() : `${n.wort.charAt(0).toUpperCase()}${n.wort.slice(1)}`,
    ]
    return {
      instruction: `${n.basis} und der Baustein ${n.baustein}. Welches Wort entsteht?`,
      caption: `${n.basis} + -${n.baustein} = ?`,
      hint: noun
        ? 'Mit -ung, -heit und -keit entsteht ein Nomen: groß schreiben!'
        : 'Mit -ig und -lich entsteht ein Adjektiv: klein schreiben!',
      solution: `${n.basis} + ${n.baustein} = ${n.wort}. Das ist ${noun ? 'ein Nomen' : 'ein Adjektiv'}.`,
      data: {
        helper: `${n.basis} + -${n.baustein}`,
        correctKey: n.wort,
        choices: choices([n.wort, ...wrong], rng),
      },
    }
  },

  component: WahlTask,
}

// --- SP3-6: Artikel zusammengesetzter Nomen ---------------------------------------

interface Zusammen {
  teile: [string, string][]
  wort: string
  artikel: string
}
export const ZUSAMMEN3: readonly Zusammen[] = sprache3.zusammensetzungen as Zusammen[]

export const artikelZusammen: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'sprache.artikel-zusammen',
  topic: 'sprache',

  items() {
    return ZUSAMMEN3.map((z) => `sprache.artikel-zusammen:${z.wort}`)
  },

  generate(_ctx, _params, itemKey) {
    const z = ZUSAMMEN3.find((x) => x.wort === itemId(itemKey))!
    const parts = z.teile.map(([a, w]) => (w ? `${a} ${w}` : a))
    return {
      instruction: `${parts.join(' und ')}. Welcher Artikel gehört zu ${z.wort}?`,
      caption: `Welcher Artikel gehört zu ${z.wort}?`,
      hint: 'Der Artikel richtet sich nach dem letzten Wort.',
      solution: `Es heißt ${z.artikel} ${z.wort}, wie ${z.teile.at(-1)!.join(' ')}.`,
      data: {
        helper: parts.join(' + '),
        prompt: `___ ${z.wort}`,
        correctKey: z.artikel,
        choices: ['der', 'die', 'das'].map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}

// --- SP3-7: Satzarten -------------------------------------------------------------

const SATZARTEN = {
  aussage: 'Aussagesatz',
  frage: 'Fragesatz',
  aufforderung: 'Aufforderungssatz',
  ausruf: 'Ausrufesatz',
} as const
const ERKLAERUNG = {
  aussage: 'Der Satz erzählt etwas.',
  frage: 'Der Satz fragt etwas.',
  aufforderung: 'Der Satz fordert jemanden auf, etwas zu tun.',
  ausruf: 'Der Satz drückt ein Gefühl aus: Freude, Schreck oder Staunen.',
} as const

export const satzart: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'sprache.satzart',
  topic: 'sprache',

  items() {
    return sprache3.satzarten.map((s) => `sprache.satzart:${s.id}`)
  },

  generate(_ctx, _params, itemKey) {
    const s = sprache3.satzarten.find((x) => x.id === itemId(itemKey))!
    const art = s.art as keyof typeof SATZARTEN
    return {
      instruction: `Lies den Satz. Was für ein Satz ist das?`,
      hint: 'Erzählt der Satz, fragt er, fordert er auf oder ruft er etwas aus?',
      solution: `Das ist ein ${SATZARTEN[art]}. ${ERKLAERUNG[art]}`,
      data: {
        helper: s.text,
        correctKey: art,
        choices: (Object.keys(SATZARTEN) as (keyof typeof SATZARTEN)[]).map((k) => ({
          key: k,
          label: SATZARTEN[k],
        })),
      },
    }
  },

  component: WahlTask,
}
