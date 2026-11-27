/**
 * L4-4 "Redewendungen und Sprichwörter" (Deutsch 3/4, 2.4: "erklären Redewendungen,
 * Sprichwörter und bildhafte Ausdrücke"): what does "jemandem einen Bären aufbinden"
 * mean? One meaning and two that take the words literally.
 */
import daten from '@/data/basis/klasse-4/redewendungen.json'
import { shuffle } from '@/core/random'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule } from '../types'

export interface Redewendung {
  id: string
  art: 'redewendung' | 'sprichwort'
  text: string
  bedeutung: string
  falsch: string[]
}

export const REDEWENDUNGEN: readonly Redewendung[] = daten as Redewendung[]

export interface RedewendungParams {
  art?: Redewendung['art']
}

export const redewendung: ExerciseModule<RedewendungParams, WahlData> = {
  id: 'lesen.redewendung',
  topic: 'lesen',

  items(_ctx, params) {
    return REDEWENDUNGEN.filter((r) => !params.art || r.art === params.art).map(
      (r) => `lesen.redewendung:${r.id}`,
    )
  },

  generate(_ctx, _params, itemKey, rng) {
    const r = REDEWENDUNGEN.find((x) => x.id === itemKey.split(':')[1])!
    const what = r.art === 'sprichwort' ? 'das Sprichwort' : 'die Redewendung'
    return {
      instruction: `Was bedeutet ${what}: ${r.text}`,
      caption: `Was bedeutet ${what}?`,
      hint: 'Es ist nicht wörtlich gemeint. Wann sagt man das?',
      solution: `${r.text.replace(/\.$/, '')} bedeutet: ${r.bedeutung}`,
      data: {
        prompt: `„${r.text}“`,
        correctKey: r.bedeutung,
        choices: shuffle([r.bedeutung, ...r.falsch], rng).map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}
