/**
 * Längen in grade 2 (Mathematik 1/2, 3.1 and 3.2; M2-4, M2-5):
 * - messen.lineal: read a length off the ruler – from 0 or (harder) from another mark.
 * - messen.umrechnen: 1 m = 100 cm, 2 m 15 cm = 215 cm.
 * - messen.schaetzen: estimate with reference sizes (a door is about 2 m high).
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import LinealTask from './LinealTask.vue'
import { HILFE, sayUnits, solved, UMRECHNUNGEN, type GroessenArt } from '../groessen/tabelle'
import { SCHAETZEN_3, type SchaetzArt } from '../groessen/schaetzen'

const choices = (labels: readonly string[], rng: () => number) =>
  shuffle([...labels], rng).map((t) => ({ key: t, label: t }))

// --- Lineal ---------------------------------------------------------------------

export const RULER_CM = 15

export interface LinealParams {
  /** Start at another mark than 0 (a typical mistake: reading the end only). */
  versetzt?: boolean
}

export interface LinealData {
  start: number
  length: number
  color: string
  correctKey: string
  choices: { key: string; label: string }[]
}

export const lineal: ExerciseModule<LinealParams, LinealData> = {
  id: 'messen.lineal',
  topic: 'messen',

  items(_ctx, params) {
    const keys: string[] = []
    for (let len = 2; len <= 12; len++)
      for (const start of params.versetzt ? [1, 2, 3] : [0])
        if (start + len <= RULER_CM) keys.push(`messen.lineal:${start}-${len}`)
    return keys
  },

  generate(_ctx, _params, itemKey, rng) {
    const [start, length] = itemKey.split(':')[1]!.split('-').map(Number) as [number, number]
    const wrong = [start + length, length + 1, length - 1].filter(
      (x, i, all) => x !== length && x > 0 && all.indexOf(x) === i,
    )
    return {
      instruction: 'Wie lang ist der Stift? Lies am Lineal ab.',
      hint:
        start > 0
          ? `Der Stift fängt nicht bei null an, sondern bei ${numberWord(start)}.`
          : 'Schau, wo der Stift aufhört.',
      solution: `Der Stift ist ${numberWord(length)} Zentimeter lang.`,
      data: {
        start,
        length,
        color: ['#EA5A47', '#61B2E4', '#B1CC33', '#F1B31C'][length % 4]!,
        correctKey: `${length} cm`,
        choices: choices(
          [length, ...wrong.slice(0, 2)].map((x) => `${x} cm`),
          rng,
        ),
      },
    }
  },

  component: LinealTask,
}

// --- Umrechnen ------------------------------------------------------------------

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

// --- Schätzen --------------------------------------------------------------------

/** Reference sizes (rounded); the wrong answers are far off, not tricky. */
export const SCHAETZEN = [
  {
    id: 'tuer',
    was: 'Wie hoch ist eine Tür?',
    image: '1F6AA',
    richtig: '2 m',
    falsch: ['20 cm', '20 m'],
  },
  {
    id: 'stift',
    was: 'Wie lang ist ein Bleistift?',
    image: '270F',
    richtig: '18 cm',
    falsch: ['18 m', '2 cm'],
  },
  {
    id: 'kind',
    was: 'Wie groß ist ein Kind in der zweiten Klasse?',
    image: '1F9D2',
    richtig: '1 m 25 cm',
    falsch: ['25 cm', '5 m'],
  },
  {
    id: 'bus',
    was: 'Wie lang ist ein Bus?',
    image: '1F68C',
    richtig: '12 m',
    falsch: ['12 cm', '1 m'],
  },
  {
    id: 'tisch',
    was: 'Wie hoch ist ein Tisch?',
    image: 'fibel-tisch',
    richtig: '75 cm',
    falsch: ['7 cm', '7 m'],
  },
  {
    id: 'haus',
    was: 'Wie hoch ist ein Haus mit zwei Stockwerken?',
    image: '1F3E0',
    richtig: '8 m',
    falsch: ['80 cm', '80 m'],
  },
  {
    id: 'heft',
    was: 'Wie lang ist ein Schulheft?',
    image: '1F4D2',
    richtig: '30 cm',
    falsch: ['3 m', '3 cm'],
  },
  {
    id: 'ameise',
    was: 'Wie lang ist eine Ameise?',
    image: '1F41C',
    richtig: 'weniger als 1 cm',
    falsch: ['10 cm', '1 m'],
  },
  {
    id: 'giraffe',
    was: 'Wie groß ist eine Giraffe?',
    image: '1F992',
    richtig: '5 m',
    falsch: ['50 cm', '50 m'],
  },
  {
    id: 'baum',
    was: 'Wie hoch ist ein großer Baum?',
    image: '1F333',
    richtig: '20 m',
    falsch: ['20 cm', '2 m'],
  },
] as const

export interface SchaetzenParams {
  /** Grade 3: weights, capacity, long distances (default: lengths of grade 2). */
  art?: SchaetzArt
}

const schaetzListe = (art?: SchaetzArt) =>
  art ? SCHAETZEN_3.filter((s) => s.art === art) : SCHAETZEN

export const schaetzen: ExerciseModule<SchaetzenParams, WahlData> = {
  id: 'messen.schaetzen',
  topic: 'messen',

  items(_ctx, params) {
    return schaetzListe(params.art).map((s) => `messen.schaetzen:${s.id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const s = schaetzListe(params.art).find((x) => x.id === itemKey.split(':')[1])!
    return {
      instruction: `Schätze: ${s.was}`,
      hint:
        'hilfe' in s
          ? s.hilfe
          : 'Denk an etwas, das du kennst: Ein Meter ist etwa so hoch wie ein Tisch und ein bisschen mehr.',
      solution: `Ungefähr ${s.richtig}.`,
      data: {
        image: s.image,
        correctKey: s.richtig,
        choices: choices([s.richtig, ...s.falsch], rng),
      },
    }
  },

  component: WahlTask,
}
