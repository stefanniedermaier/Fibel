/**
 * F4-3 "Würfel kippen" (Mathematik 3/4, 2.1: "Kippbewegungen eines Würfels gedanklich
 * nachvollziehen"): a dice shows its top, front and right side; it is tipped once or
 * twice. Which number is on top then? Opposite sides of a dice always add up to 7.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import KippenTask from './KippenTask.vue'

export type Richtung = 'rechts' | 'links' | 'vorne' | 'hinten'

export interface Wuerfel {
  oben: number
  vorne: number
  rechts: number
}

/** Tipping over an edge: the side that faces that way comes down, the opposite goes up. */
export function kippen(w: Wuerfel, r: Richtung): Wuerfel {
  if (r === 'rechts') return { oben: 7 - w.rechts, vorne: w.vorne, rechts: w.oben }
  if (r === 'links') return { oben: w.rechts, vorne: w.vorne, rechts: 7 - w.oben }
  if (r === 'vorne') return { oben: 7 - w.vorne, vorne: w.oben, rechts: w.rechts }
  return { oben: w.vorne, vorne: 7 - w.oben, rechts: w.rechts }
}

const START: Wuerfel[] = [
  { oben: 1, vorne: 2, rechts: 3 },
  { oben: 5, vorne: 3, rechts: 1 },
  { oben: 6, vorne: 4, rechts: 5 },
  { oben: 2, vorne: 6, rechts: 4 },
]
const WEGE: Richtung[][] = [
  ['rechts'],
  ['links'],
  ['vorne'],
  ['hinten'],
  ['rechts', 'vorne'],
  ['hinten', 'links'],
]

const SAY: Record<Richtung, string> = {
  rechts: 'nach rechts',
  links: 'nach links',
  vorne: 'nach vorne, zu dir hin',
  hinten: 'nach hinten, von dir weg',
}

export interface KippenParams {
  /** Two tips in a row (harder). */
  zwei?: boolean
}

export interface KippenData {
  wuerfel: Wuerfel
  wege: Richtung[]
  correctKey: string
  choices: { key: string; label: string }[]
}

export const kippenModul: ExerciseModule<KippenParams, KippenData> = {
  id: 'formen.kippen',
  topic: 'formen',

  items(_ctx, params) {
    const wege = WEGE.map((w, i) => ({ w, i })).filter(
      ({ w }) => (w.length === 2) === !!params.zwei,
    )
    return START.flatMap((_, s) => wege.map(({ i }) => `formen.kippen:${s}-${i}`))
  },

  generate(_ctx, _params, itemKey, rng) {
    const [s, i] = itemKey.split(':')[1]!.split('-').map(Number) as [number, number]
    const start = START[s]!
    const wege = WEGE[i]!
    const ende = wege.reduce(kippen, start)
    const right = ende.oben
    const wrong = shuffle(
      [1, 2, 3, 4, 5, 6].filter((x) => x !== right && x !== start.oben),
      rng,
    ).slice(0, 2)
    return {
      instruction: `Der Würfel wird ${wege.map((w) => SAY[w]).join(' und dann ')} gekippt. Welche Zahl liegt dann oben?`,
      caption: 'Welche Zahl liegt nach dem Kippen oben?',
      hint: 'Gegenüberliegende Seiten ergeben zusammen immer sieben.',
      solution: `Oben liegt dann die ${right}.`,
      data: {
        wuerfel: start,
        wege,
        correctKey: String(right),
        choices: shuffle([right, ...wrong], rng).map((x) => ({ key: String(x), label: String(x) })),
      },
    }
  },

  component: KippenTask,
}
