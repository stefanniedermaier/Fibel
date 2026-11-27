/**
 * D11a "Punkt oder Fragezeichen?" (Deutsch 1/2, 4.3: "erfassen den Satz als Sinneinheit,
 * halten Satzgrenzen ein und setzen ein Satzschlusszeichen"). The sentence is shown
 * without its mark; the instruction does not read it aloud, the melody would give it away.
 */
import type { ExerciseModule } from '../../types'
import { findPlain, readablePlain } from '../shared'
import SatzzeichenTask from './SatzzeichenTask.vue'

export interface SatzzeichenData {
  text: string
  correctKey: string
  choices: { key: string; label: string }[]
}

export const MIN_SENTENCES = 4

export const satzzeichen: ExerciseModule<Record<string, never>, SatzzeichenData> = {
  id: 'sprache.satzzeichen',
  topic: 'schreiben',

  items(ctx) {
    const sentences = readablePlain(ctx)
    const questions = sentences.filter((s) => s.text.endsWith('?')).length
    if (sentences.length < MIN_SENTENCES || questions === 0) return []
    return sentences.map((s) => `sprache.satzzeichen:${s.id}`)
  },

  generate(ctx, _params, itemKey) {
    const s = findPlain(ctx, itemKey.split(':')[1]!)
    const mark = s.text.slice(-1)
    return {
      instruction: 'Lies den Satz. Welches Zeichen gehört ans Ende?',
      caption:
        ctx.grade >= 2 ? 'Punkt, Fragezeichen oder Ausrufezeichen?' : 'Punkt oder Fragezeichen?',
      hint:
        ctx.grade >= 2
          ? 'Fragt der Satz etwas? Ruft jemand oder bittet um etwas? Oder erzählt der Satz nur?'
          : 'Fragt der Satz etwas? Dann kommt ein Fragezeichen.',
      solution:
        mark === '?'
          ? 'Das ist eine Frage. Am Ende steht ein Fragezeichen.'
          : mark === '!'
            ? 'Das ist ein Ausruf oder eine Aufforderung. Am Ende steht ein Ausrufezeichen.'
            : 'Das ist ein Aussagesatz. Am Ende steht ein Punkt.',
      data: {
        text: s.text.slice(0, -1),
        correctKey: mark,
        // From grade 2 also the exclamation mark (SP2-7).
        choices: [
          { key: '.', label: '.' },
          { key: '?', label: '?' },
          ...(ctx.grade >= 2 ? [{ key: '!', label: '!' }] : []),
        ],
      },
    }
  },

  component: SatzzeichenTask,
}
