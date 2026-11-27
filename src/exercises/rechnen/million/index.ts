/**
 * R4-1 to R4-3 "Zahlen bis zur Million" (Mathematik 3/4, 1.1):
 * - `tafel`: digits in the place value table (HT ZT T H Z E) → which number is it?
 * - `hoeren`: a number is spoken → tap it (zeros in the middle are the hard part).
 * - `stelle`: which digit is at the thousands place?
 * - `runden`: round to thousands, ten thousands or hundred thousands.
 * - `strahl`: a mark on the number line to a million (steps of 100 000) or a section.
 * - `ordnen`: which number is the largest?
 */
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import MillionTask from './MillionTask.vue'

export type MillionMode = 'tafel' | 'hoeren' | 'stelle' | 'runden' | 'strahl' | 'ordnen'

export interface MillionParams {
  mode: MillionMode
}

export interface MillionData {
  mode: MillionMode
  /** tafel: the digits from HT to E. */
  digits?: number[]
  /** strahl: the line from `from` to `to` with `step`, the mark at `value`. */
  strahl?: { from: number; to: number; step: number; value: number }
  /** Big text above the choices. */
  prompt?: string
  correctKey: string
  choices: { key: string; label: string }[]
}

/** "305 040": groups of three with a narrow space, as in the school books. */
export const zahl = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export const STELLEN = [
  'Hunderttausender',
  'Zehntausender',
  'Tausender',
  'Hunderter',
  'Zehner',
  'Einer',
] as const

/** Numbers that are easy to confuse with n: a zero moved, two digits swapped, a place off. */
export function verwechsler(n: number): number[] {
  const s = String(n).padStart(6, '0')
  const out = new Set<number>()
  for (let i = 0; i < 5; i++) {
    const t = s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)
    out.add(Number(t))
  }
  for (const d of [1000, 10000, 100000, 100, 10]) {
    out.add(n + d)
    if (n - d > 0) out.add(n - d)
  }
  out.delete(n)
  return [...out].filter((x) => x > 0 && x < 1000000)
}

/** Fixed numbers per item: with zeros inside, round ones, and mixed. */
export const ZAHLEN = [
  305040, 480615, 70200, 999999, 100001, 250000, 604030, 38512, 712908, 400040, 56007, 830300,
  123456, 909090, 61500, 275380, 500005, 147000, 362814, 80080,
]

function choices(right: number, rng: Rng) {
  const wrong = shuffle(verwechsler(right), rng).slice(0, 2)
  return shuffle([right, ...wrong], rng).map((n) => ({ key: String(n), label: zahl(n) }))
}

const RUNDEN = [
  { auf: 1000, name: 'Tausender' },
  { auf: 10000, name: 'Zehntausender' },
  { auf: 100000, name: 'Hunderttausender' },
] as const

export const million: ExerciseModule<MillionParams, MillionData> = {
  id: 'rechnen.million',
  topic: 'rechnen',

  items(_ctx, params) {
    if (params.mode === 'strahl')
      return Array.from(
        { length: 9 },
        (_, i) => `rechnen.million:strahl:${(i + 1) * 100000}`,
      ).concat([320000, 350000, 380000, 740000, 760000].map((n) => `rechnen.million:strahl:${n}`))
    return ZAHLEN.map((n) => `rechnen.million:${params.mode}:${n}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const n = Number(itemKey.split(':')[2])
    const mode = params.mode
    if (mode === 'tafel') {
      const digits = String(n).padStart(6, '0').split('').map(Number)
      return {
        instruction: 'Welche Zahl steht in der Stellenwerttafel?',
        hint: 'Lies von links: Hunderttausender, Zehntausender, Tausender, dann Hunderter, Zehner, Einer. Eine Null bleibt eine Null.',
        solution: `Die Zahl heißt ${n}.`,
        data: { mode, digits, correctKey: String(n), choices: choices(n, rng) },
      }
    }
    if (mode === 'hoeren') {
      return {
        instruction: `Hör genau zu: ${n}. Tippe auf die Zahl.`,
        caption: 'Hör zu und tippe auf die Zahl.',
        hint: `Hör noch einmal: ${n}. Erst kommen die Tausender, dann der Rest.`,
        solution: `Die Zahl heißt ${n}.`,
        data: { mode, correctKey: String(n), choices: choices(n, rng) },
      }
    }
    if (mode === 'stelle') {
      const s = String(n).padStart(6, '0')
      const first = String(n).length
      const places = STELLEN.map((name, i) => ({ name, i })).filter((p) => p.i >= 6 - first)
      const p = pickOne(places, rng)
      const d = Number(s[p.i])
      const wrong = shuffle(
        [...new Set(s.split('').map(Number))].filter((x) => x !== d),
        rng,
      )
      const opts = [
        d,
        ...wrong,
        ...[0, 1, 5, 9].filter((x) => x !== d && !wrong.includes(x)),
      ].slice(0, 3)
      return {
        instruction: `Welche Ziffer steht bei ${n} an der ${p.name}stelle?`,
        caption: `Welche Ziffer steht an der ${p.name}stelle?`,
        hint: 'Zähle von rechts: Einer, Zehner, Hunderter, Tausender, Zehntausender, Hunderttausender.',
        solution: `An der ${p.name}stelle steht die ${d}.`,
        data: {
          mode,
          prompt: zahl(n),
          correctKey: String(d),
          choices: shuffle(opts, rng).map((x) => ({ key: String(x), label: String(x) })),
        },
      }
    }
    if (mode === 'runden') {
      const r =
        pickOne(
          RUNDEN.filter((x) => n >= x.auf),
          rng,
        ) ?? RUNDEN[0]
      const right = Math.round(n / r.auf) * r.auf
      const down = Math.floor(n / r.auf) * r.auf
      const up = down + r.auf
      const other = right === down ? up : down
      const third = Math.round(n / (r.auf / 10)) * (r.auf / 10)
      const opts = [...new Set([right, other, third === right ? up + r.auf : third])]
      return {
        instruction: `Runde ${n} auf ${r.name}.`,
        caption: `Runde auf ${r.name}.`,
        hint: `Schau auf die Ziffer rechts neben den ${r.name}n: Bei 0 bis 4 rundest du ab, bei 5 bis 9 auf.`,
        solution: `${n} gerundet auf ${r.name} ist ${right}.`,
        data: {
          mode,
          prompt: zahl(n),
          correctKey: String(right),
          choices: shuffle(opts, rng).map((x) => ({ key: String(x), label: zahl(x) })),
        },
      }
    }
    if (mode === 'strahl') {
      const section = n % 100000 !== 0
      const [from, to, step] = section
        ? [Math.floor(n / 100000) * 100000, Math.floor(n / 100000) * 100000 + 100000, 10000]
        : [0, 1000000, 100000]
      const wrong = [n + step, n - step, section ? n + 1000 : n + 10000].filter(
        (x) => x > from && x < to && x !== n,
      )
      return {
        instruction: 'Welche Zahl gehört an den Pfeil?',
        hint: `Von Strich zu Strich sind es ${step}.`,
        solution: `Am Pfeil steht ${n}.`,
        data: {
          mode,
          strahl: { from, to, step, value: n },
          correctKey: String(n),
          choices: shuffle([n, ...wrong.slice(0, 2)], rng).map((x) => ({
            key: String(x),
            label: zahl(x),
          })),
        },
      }
    }
    // ordnen
    const others = shuffle(verwechsler(n), rng)
      .filter((x) => String(x).length === String(n).length)
      .slice(0, 2)
    const all = [n, ...others]
    const max = Math.max(...all)
    return {
      instruction: 'Welche Zahl ist am größten?',
      hint: 'Vergleiche von links: Wo steht zuerst eine größere Ziffer?',
      solution: `${max} ist am größten.`,
      data: {
        mode,
        correctKey: String(max),
        choices: shuffle(all, rng).map((x) => ({ key: String(x), label: zahl(x) })),
      },
    }
  },

  component: MillionTask,
}
