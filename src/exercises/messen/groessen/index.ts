/**
 * M3-2 to M3-4 "Ablesen" (Mathematik 3/4, 3.1): a pencil on a ruler with millimetres,
 * the pointer of a kitchen scale (up to 1 kg) and the level in a measuring jug (up to
 * 1 l). The child taps the value that is shown.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import AblesenTask from './AblesenTask.vue'

export type Instrument = 'lineal' | 'waage' | 'messbecher'

export interface AblesenParams {
  instrument: Instrument
}

export interface AblesenData {
  instrument: Instrument
  /** mm for the ruler, g for the scale, ml for the jug. */
  value: number
  correctKey: string
  choices: { key: string; label: string }[]
}

const label = (instrument: Instrument, v: number) =>
  instrument === 'lineal'
    ? v % 10 === 0
      ? `${v / 10} cm`
      : `${Math.floor(v / 10)} cm ${v % 10} mm`
    : `${v} ${instrument === 'waage' ? 'g' : 'ml'}`

/** Values the instrument shows; wrong answers are a step or a scale mark off. */
function values(instrument: Instrument): number[] {
  if (instrument === 'lineal') {
    const out: number[] = []
    for (let mm = 23; mm <= 97; mm += 7) out.push(mm)
    return out
  }
  const out: number[] = []
  for (let v = 100; v <= 950; v += 50) out.push(v)
  return out
}

function wrongValues(instrument: Instrument, v: number): number[] {
  const near =
    instrument === 'lineal'
      ? [v + 10, v - 10, v + 1, v - 1, v + 2]
      : [v + 50, v - 50, v + 100, v - 100]
  const max = instrument === 'lineal' ? 100 : 1000
  return near.filter((x, i, all) => x > 0 && x <= max && x !== v && all.indexOf(x) === i)
}

const QUESTION: Record<Instrument, string> = {
  lineal: 'Wie lang ist der Stift? Lies Zentimeter und Millimeter ab.',
  waage: 'Wie schwer sind die Äpfel? Lies an der Waage ab.',
  messbecher: 'Wie viel Saft ist im Messbecher?',
}

const HINT: Record<Instrument, string> = {
  lineal: 'Zähle erst die ganzen Zentimeter, dann die kleinen Striche: Jeder ist ein Millimeter.',
  waage: 'Zwischen zwei Zahlen liegen fünfzig Gramm: Der kleine Strich ist genau in der Mitte.',
  messbecher:
    'Schau, wo der Saft aufhört. Der kleine Strich zwischen zwei Zahlen sind fünfzig Milliliter.',
}

const SAY_UNIT: Record<Instrument, string> = {
  lineal: '',
  waage: 'Gramm',
  messbecher: 'Milliliter',
}

export const ablesen: ExerciseModule<AblesenParams, AblesenData> = {
  id: 'messen.ablesen',
  topic: 'messen',

  items(_ctx, params) {
    return values(params.instrument).map((v) => `messen.ablesen:${params.instrument}:${v}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const { instrument } = params
    const value = Number(itemKey.split(':')[2])
    const right = label(instrument, value)
    const wrong = shuffle(wrongValues(instrument, value), rng).slice(0, 2)
    const spoken =
      instrument === 'lineal'
        ? right.replace('cm', 'Zentimeter').replace('mm', 'Millimeter')
        : `${value} ${SAY_UNIT[instrument]}`
    return {
      instruction: QUESTION[instrument],
      hint: HINT[instrument],
      solution: `Es sind ${spoken}.`,
      data: {
        instrument,
        value,
        correctKey: right,
        choices: shuffle([right, ...wrong.map((w) => label(instrument, w))], rng).map((t) => ({
          key: t,
          label: t,
        })),
      },
    }
  },

  component: AblesenTask,
}
