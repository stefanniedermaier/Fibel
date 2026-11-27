/**
 * D11b "Groß oder klein?": the sentence is shown in small letters; the child taps every
 * word that starts with a capital letter – the beginning of the sentence, nouns and
 * names (Deutsch 1/2, 4.4: "achten auf die Großschreibung am Satzanfang").
 */
import type { ExerciseModule } from '../../types'
import { findPlain, readablePlain } from '../shared'
import GrossKleinTask from './GrossKleinTask.vue'

export interface GrossKleinData {
  /** The words in small letters (punctuation stays at the last word). */
  words: string[]
  /** Indices of the words written with a capital. */
  capitals: number[]
  original: string[]
}

export const grossKlein: ExerciseModule<Record<string, never>, GrossKleinData> = {
  id: 'sprache.gross-klein',
  topic: 'schreiben',

  items(ctx) {
    const sentences = readablePlain(ctx)
    return sentences.length < 4 ? [] : sentences.map((s) => `sprache.gross-klein:${s.id}`)
  },

  generate(ctx, _params, itemKey) {
    const s = findPlain(ctx, itemKey.split(':')[1]!)
    const original = s.text.split(/\s+/)
    const capitals = original
      .map((w, i) => (w.charAt(0) !== w.charAt(0).toLowerCase() ? i : -1))
      .filter((i) => i >= 0)
    return {
      instruction: 'Welche Wörter schreibt man groß? Tippe sie alle an.',
      caption: 'Tippe die Wörter an, die man großschreibt.',
      hint: 'Am Satzanfang schreibt man groß – und Namen und Namenwörter auch.',
      solution: `So schreibt man den Satz: ${s.text}`,
      data: { words: original.map((w) => w.toLowerCase()), capitals, original },
    }
  },

  component: GrossKleinTask,
}
