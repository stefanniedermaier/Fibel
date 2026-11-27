/**
 * Klasse 4 (plaene/klasse-4.md, SP4-1, SP4-2, SP4-4, SP4-5, SP4-6, SP4-8, S4-1, S4-5):
 * a sentence with a gap or a question, three answers, after the answer a short rule.
 * The data are in klasse-4/sprache.json, grouped by `art`.
 */
import sprache4 from '@/data/basis/klasse-4/sprache.json'
import { shuffle } from '@/core/random'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule } from '../types'

export interface Luecke {
  satz: string
  richtig: string
  falsch: string[]
  erklaerung: string
}

export const LUECKEN: Record<string, readonly Luecke[]> = sprache4.luecken

export interface Luecke4Params {
  art: string
}

const FRAGE: Record<string, string> = {
  fall: 'Welches Wort passt in die Lücke?',
  pronomen: 'Welches Fürwort passt in die Lücke?',
  zeitform: 'Welche Verbform passt in die Lücke?',
  'zeit-erkennen': 'In welcher Zeitform steht der Satz?',
  rede: 'Welcher Satz ist richtig geschrieben?',
  bausteine: 'Welches Wort entsteht?',
  gross: 'Welcher Satz ist richtig geschrieben?',
  textart: 'Welche Textart ist das?',
}

/** Questions that are already in the prompt are not repeated. */
const prompt = (l: Luecke) => (l.satz.startsWith('Welcher Satz') ? undefined : l.satz)

export const luecke4: ExerciseModule<Luecke4Params, WahlData> = {
  id: 'sprache.luecke4',
  topic: 'sprache',

  items(_ctx, params) {
    return (LUECKEN[params.art] ?? []).map((_, i) => `sprache.luecke4:${params.art}:${i}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const l = LUECKEN[params.art]![Number(itemKey.split(':')[2])]!
    const frage = FRAGE[params.art] ?? 'Was ist richtig?'
    const shown = prompt(l)
    const read = shown && !shown.includes('___') ? ` ${shown}` : ''
    return {
      instruction: `${frage}${read}`,
      caption: frage,
      hint: 'Lies den Satz mit jeder Antwort leise vor. Was klingt richtig?',
      solution: `Richtig ist: ${l.richtig}. ${l.erklaerung}`,
      data: {
        prompt: shown?.replace('___', '…'),
        correctKey: l.richtig,
        choices: shuffle([l.richtig, ...l.falsch], rng).map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}
