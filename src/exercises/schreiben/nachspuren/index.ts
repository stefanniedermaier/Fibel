/**
 * S4 "Nachspuren": trace a letter (capital or small) along the template, with start
 * point and direction. The handwriting comes from the state's adjustment (grade 1:
 * Druckschrift). Multigraphs are traced letter by letter (Sch = S + c + h).
 * With `zeichen: 'ziffern'` the digits 0–9 are traced instead (Mathematik 1.1).
 */
import { SCHREIBSCHRIFTEN, SCRIPTS, glyphFor, upperForm, type Glyph } from '@/core/strokes'
import type { Letter } from '@/core/types'
import { scriptFor } from '@/core/words'
import type { ExerciseModule, LearnerContext } from '../../types'
import { knownLetters } from '../../lesen/anlaut'
import { gradeWords, itemId } from '../shared'
import NachspurenTask from './NachspurenTask.vue'

export interface NachspurenData {
  text: string
  glyph: Glyph
  tolerance: number
}

/** The template set for the learner (falls back to Druckschrift). */
export function scriptOf(ctx: LearnerContext) {
  return SCRIPTS[scriptFor(ctx.land, ctx.grade)] ?? SCRIPTS.druckschrift!
}

/** The connected handwriting the parents chose (S2-12); VA until they choose. */
export function schreibschriftOf(ctx: LearnerContext) {
  return SCRIPTS[SCHREIBSCHRIFTEN[ctx.settings.schreibschrift ?? 'va'].id]!
}

/** Frequent joins of the connected handwriting (S2-12). */
export const VERBINDUNGEN = [
  'ei',
  'ie',
  'au',
  'eu',
  'ch',
  'sch',
  'st',
  'sp',
  'en',
  'er',
  'el',
  'an',
  'in',
  'un',
  'be',
  'ob',
  'wo',
  've',
  'or',
  'ra',
  'll',
  'mm',
  'nn',
  'ss',
  'tt',
  'ck',
  'tz',
  'ng',
]

const VERBUNDEN_KLEIN = [...'abcdefghijklmnopqrstuvwxyzäöüß']
const VERBUNDEN_GROSS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ']

/** Short words of the grade for whole-word tracing (three to six letters). */
function verbundeneWoerter(ctx: LearnerContext): string[] {
  return gradeWords(ctx, { wordGrade: Math.min(ctx.grade, 4) })
    .filter((w) => w.grundwortschatz && /^[A-Za-zÄÖÜäöüß]{3,6}$/.test(w.text))
    .map((w) => w.text)
    .slice(0, 60)
}

/** Item key part: "M" (capital) or "m" (small) – the case matters. */
function forms(letter: Letter): string[] {
  return [upperForm(letter.id), letter.id]
}

export interface NachspurenParams {
  zeichen?: 'buchstaben' | 'ziffern'
  /** S2-12: connected handwriting – small or capital letters, joins or short words. */
  verbunden?: 'klein' | 'gross' | 'verbindungen' | 'woerter'
}

export const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const DIGIT_WORDS = [
  'Null',
  'Eins',
  'Zwei',
  'Drei',
  'Vier',
  'Fünf',
  'Sechs',
  'Sieben',
  'Acht',
  'Neun',
]

export const nachspuren: ExerciseModule<NachspurenParams, NachspurenData> = {
  id: 'schreiben.nachspuren',
  topic: 'schreiben',

  items(ctx, params) {
    if (params.verbunden) {
      const script = schreibschriftOf(ctx)
      const texts =
        params.verbunden === 'klein'
          ? VERBUNDEN_KLEIN
          : params.verbunden === 'gross'
            ? VERBUNDEN_GROSS
            : params.verbunden === 'verbindungen'
              ? VERBINDUNGEN
              : verbundeneWoerter(ctx)
      return texts
        .filter((t) => glyphFor(script, t) !== undefined)
        .map((t) => `schreiben.nachspuren:v:${t}`)
    }
    const script = scriptOf(ctx)
    if (params.zeichen === 'ziffern') {
      return DIGITS.filter((d) => glyphFor(script, d) !== undefined).map(
        (d) => `schreiben.nachspuren:${d}`,
      )
    }
    return knownLetters(ctx)
      .flatMap(forms)
      .filter((text) => glyphFor(script, text) !== undefined)
      .map((text) => `schreiben.nachspuren:${text}`)
  },

  generate(ctx, params, itemKey) {
    if (params.verbunden) {
      const text = itemKey.split(':v:')[1]!
      const script = schreibschriftOf(ctx)
      const glyph = glyphFor(script, text)
      if (!glyph) throw new Error(`Keine Vorlage für „${text}“`)
      const wort = text.length > 1
      const what = wort
        ? params.verbunden === 'woerter'
          ? `das Wort ${text}`
          : `die Verbindung ${text}`
        : `das ${text === text.toLowerCase() ? 'kleine' : 'große'} ${text}`
      return {
        instruction: `Spure ${what} in Schreibschrift nach. Fang beim grünen Punkt an${wort ? ' und schreib ohne abzusetzen. Die Punkte und Striche kommen zum Schluss' : ''}.`,
        caption: `Spure ${text} nach. Fang beim grünen Punkt an.`,
        solution: `So schreibt man ${text} in der ${script.name}.`,
        data: { text, glyph, tolerance: ctx.settings.traceTolerance ?? 1 },
      }
    }
    const text = itemId(itemKey)
    if (params.zeichen === 'ziffern') {
      const glyph = glyphFor(scriptOf(ctx), text)
      if (!glyph) throw new Error(`Keine Vorlage für „${text}“`)
      const word = DIGIT_WORDS[Number(text)] ?? text
      return {
        instruction: `Spure die ${word} nach. Fang beim grünen Punkt an.`,
        caption: `Spure die ${text} nach. Fang beim grünen Punkt an.`,
        solution: `So schreibt man die ${word}.`,
        data: { text, glyph, tolerance: ctx.settings.traceTolerance ?? 1 },
      }
    }
    const letter = knownLetters(ctx).find((l) => l.id === text.toLowerCase())
    const capital = text !== text.toLowerCase()
    const glyph = glyphFor(scriptOf(ctx), text)
    if (!glyph) throw new Error(`Keine Vorlage für „${text}“`)
    const example = letter ? `, wie in ${letter.example}` : ''
    return {
      instruction: `Spure das ${capital ? 'große' : 'kleine'} ${text} nach${example}. Fang beim grünen Punkt an.`,
      caption: `Spure ${text} nach. Fang beim grünen Punkt an.`,
      solution: `So schreibt man ${text}.`,
      data: { text, glyph, tolerance: ctx.settings.traceTolerance ?? 1 },
    }
  },

  component: NachspurenTask,
  layout: 'fit',
}
