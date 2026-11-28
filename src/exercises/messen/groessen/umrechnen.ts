/**
 * Umrechnen (M2-5, M3-1 to M3-5, M4-1 to M4-4, U3-2, U4-1): 1 m = 100 cm, 2 m 15 cm =
 * 215 cm; from grade 3 the tables in tabelle.ts (money, lengths, weights, capacity,
 * fractions, time, prices, estimates).
 */
import { numberWord } from '@/core/numbers'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule } from '../../types'
import { textChoices as choices } from '../../choices'
import { HILFE, sayUnits, solved, UMRECHNUNGEN, type GroessenArt } from './tabelle'

export interface UmrechnenParams {
  /** Grade 3: money, lengths, weights, capacity, fractions, time (default: m and cm). */
  art?: GroessenArt
}

export const umrechnen: ExerciseModule<UmrechnenParams, WahlData> = {
  id: 'messen.umrechnen',
  topic: 'messen',

  items(_ctx, params) {
    if (params.art)
      return UMRECHNUNGEN[params.art].map((x) => `messen.umrechnen:${params.art}:${x.id}`)
    const keys: string[] = []
    for (let m = 1; m <= 5; m++) keys.push(`messen.umrechnen:m-${m}`)
    for (const [m, cm] of [
      [1, 50],
      [1, 20],
      [2, 15],
      [2, 50],
      [3, 5],
      [1, 75],
      [3, 40],
    ] as const)
      keys.push(`messen.umrechnen:mcm-${m}-${cm}`)
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    if (params.art) {
      const id = itemKey.split(':')[2]
      const x = UMRECHNUNGEN[params.art].find((t) => t.id === id)
      if (!x) throw new Error(`Unbekannte Umrechnung: ${itemKey}`)
      return {
        instruction: x.frage,
        hint: x.hilfe ?? HILFE[params.art],
        solution: x.prompt.includes('?')
          ? `${sayUnits(solved(x))}.`
          : `Richtig ist: ${sayUnits(x.richtig)}${x.hilfe ? ` ${x.hilfe}` : ''}`,
        data: {
          prompt: x.prompt,
          correctKey: x.richtig,
          choices: choices([x.richtig, ...x.falsch], rng),
        },
      }
    }
    const [kind, a, b] = itemKey.split(':')[1]!.split('-') as [string, string, string?]
    const m = Number(a)
    if (kind === 'm') {
      const right = `${m * 100} cm`
      return {
        instruction: `Wie viele Zentimeter sind ${m === 1 ? 'ein Meter' : `${numberWord(m)} Meter`}?`,
        hint: 'Ein Meter hat hundert Zentimeter.',
        solution: `${m} m sind ${m * 100} cm.`,
        data: {
          prompt: `${m} m = ?`,
          correctKey: right,
          choices: choices([right, `${m * 10} cm`, `${m} cm`], rng),
        },
      }
    }
    const cm = Number(b)
    const total = m * 100 + cm
    const right = `${total} cm`
    return {
      instruction: `Wie viele Zentimeter sind ${m === 1 ? 'ein Meter' : `${numberWord(m)} Meter`} und ${numberWord(cm)} Zentimeter?`,
      hint: 'Erst die Meter in Zentimeter, dann die Zentimeter dazu.',
      solution: `${m} m ${cm} cm sind ${total} cm.`,
      data: {
        prompt: `${m} m ${cm} cm = ?`,
        correctKey: right,
        choices: choices(
          [right, `${m}${cm} cm`, `${m + cm} cm`].filter((x, i, all) => all.indexOf(x) === i),
          rng,
        ),
      },
    }
  },

  component: WahlTask,
}
