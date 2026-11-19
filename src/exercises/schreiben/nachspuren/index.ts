/**
 * S4 "Nachspuren": trace a letter (capital or small) along the template, with start
 * point and direction. The handwriting comes from the state's adjustment (grade 1:
 * Druckschrift). Multigraphs are traced letter by letter (Sch = S + c + h).
 */
import { SCRIPTS, glyphFor, upperForm, type Glyph } from '@/core/strokes'
import type { Letter } from '@/core/types'
import { scriptFor } from '@/core/words'
import type { ExerciseModule, LearnerContext } from '../../types'
import { knownLetters } from '../../lesen/anlaut'
import { itemId } from '../shared'
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

/** Item key part: "M" (capital) or "m" (small) – the case matters. */
function forms(letter: Letter): string[] {
  return [upperForm(letter.id), letter.id]
}

export const nachspuren: ExerciseModule<Record<string, never>, NachspurenData> = {
  id: 'schreiben.nachspuren',
  topic: 'schreiben',

  items(ctx) {
    const script = scriptOf(ctx)
    return knownLetters(ctx)
      .flatMap(forms)
      .filter((text) => glyphFor(script, text) !== undefined)
      .map((text) => `schreiben.nachspuren:${text}`)
  },

  generate(ctx, _params, itemKey) {
    const text = itemId(itemKey)
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
}
