/**
 * R3-8, R3-9 "Schriftlich rechnen" (Mathematik 3/4, 1.2): addition (also with three
 * numbers) and subtraction in the place value table. The child taps the digits from
 * right to left. Subtraction uses the method taught in Bavaria: Abziehverfahren mit
 * Entbündeln (plaene/klasse-3.md, section 6). The method is a parameter, so a state
 * adjustment could choose another one later.
 */
import { randomInt } from '@/core/random'
import { numberWord } from '@/core/numbers'
import type { Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import SchriftlichTask from './SchriftlichTask.vue'

export interface SchriftlichParams {
  op: '+' | '-'
  verfahren?: 'abziehen-entbuendeln'
  /** Grade 4 (R4-5): numbers with four to six digits. */
  gross?: boolean
}

/** One column of the calculation, from the ones to the left. */
export interface Spalte {
  digit: number
  /** Addition: carried into the next column. */
  carry: number
  /** Subtraction: the top digits after unbundling (whole row), if this column needs it. */
  top?: number[]
  explanation: string
}

export interface SchriftlichData {
  op: '+' | '-'
  rows: number[]
  result: number
  /** Number of columns (digits of the longest number or the result). */
  width: number
  columns: Spalte[]
}

const digitsOf = (n: number, width: number) =>
  Array.from({ length: width }, (_, i) => Math.floor(n / 10 ** i) % 10)
const PLACE = [
  'Einer',
  'Zehner',
  'Hunderter',
  'Tausender',
  'Zehntausender',
  'Hunderttausender',
  'Millionen',
]

/** The columns of an addition, with carries and what to say. */
export function addColumns(rows: readonly number[]): { width: number; columns: Spalte[] } {
  const sum = rows.reduce((s, r) => s + r, 0)
  const width = String(sum).length
  const columns: Spalte[] = []
  let carry = 0
  for (let i = 0; i < width; i++) {
    const ds = rows
      .map((r) => Math.floor(r / 10 ** i) % 10)
      .filter((d, k) => d > 0 || rows[k]! >= 10 ** i)
    const total = ds.reduce((s, d) => s + d, 0) + carry
    const parts = [...ds.map(String), ...(carry ? [String(carry)] : [])]
    const said =
      parts.length > 1
        ? `${parts.map((p) => numberWord(Number(p))).join(' plus ')} ist ${numberWord(total)}`
        : `Hier steht nur ${numberWord(total)}`
    const next = Math.floor(total / 10)
    columns.push({
      digit: total % 10,
      carry: next,
      explanation:
        next > 0 && i < width - 1
          ? `${said}. Schreibe ${numberWord(total % 10)} bei den ${PLACE[i]}n, ${numberWord(next)} kommt zu den ${PLACE[i + 1]}n.`
          : `${said}. Schreibe ${numberWord(total % 10)}.`,
    })
    carry = next
  }
  return { width, columns }
}

/** The columns of a subtraction with unbundling (Entbündeln). */
export function subtractColumns(a: number, b: number): { width: number; columns: Spalte[] } {
  const width = String(a).length
  const top = digitsOf(a, width)
  const bottom = digitsOf(b, width)
  const columns: Spalte[] = []
  for (let i = 0; i < width; i++) {
    let explanation: string
    let changed: number[] | undefined
    if (top[i]! < bottom[i]!) {
      // Take one from the next place that is not zero; zeros on the way become nine.
      let j = i + 1
      while (top[j] === 0) j++
      top[j]! -= 1
      for (let k = i + 1; k < j; k++) top[k] = 9
      const before = top[i]!
      top[i] = before + 10
      changed = [...top]
      explanation = `${numberWord(before)} minus ${numberWord(bottom[i]!)} geht nicht. Wir entbündeln einen ${PLACE[j]!.replace(/n$/, '')}: ${numberWord(top[i]!)} minus ${numberWord(bottom[i]!)} ist ${numberWord(top[i]! - bottom[i]!)}.`
    } else {
      explanation = `${numberWord(top[i]!)} minus ${numberWord(bottom[i]!)} ist ${numberWord(top[i]! - bottom[i]!)}.`
    }
    columns.push({ digit: top[i]! - bottom[i]!, carry: 0, top: changed, explanation })
  }
  // No leading zero in the result: only as many columns as the result has digits.
  return { width, columns: columns.slice(0, String(a - b).length) }
}

/** R4-5: the same kinds of tasks with four to six digits. */
function grosseZahlen(op: '+' | '-', kind: string, rng: Rng): number[] {
  const stellen = randomInt(rng, 4, 6)
  const lo = 10 ** (stellen - 1)
  if (op === '+') {
    if (kind === 'drei')
      return [
        randomInt(rng, lo, 3 * lo),
        randomInt(rng, lo, 3 * lo),
        randomInt(rng, lo / 10, 2 * lo),
      ]
    return [randomInt(rng, lo, 5 * lo), randomInt(rng, lo / 10, 4 * lo)]
  }
  const a = randomInt(rng, 4 * lo, 10 * lo - 1)
  if (kind === 'null') {
    // Zeros in the middle: 60 040 − 23 587.
    const z = randomInt(rng, 4, 9) * lo + randomInt(rng, 1, 9) * 10
    return [z, randomInt(rng, lo, z - lo)]
  }
  if (kind === 'ohne') {
    const b = digitsOf(a, stellen).reduce((s2, d, i) => s2 + randomInt(rng, 0, d) * 10 ** i, 0)
    return [a, Math.max(1, Math.min(b, a - 1))]
  }
  return [a, randomInt(rng, lo, a - lo)]
}

export const schriftlich: ExerciseModule<SchriftlichParams, SchriftlichData> = {
  id: 'rechnen.schriftlich',
  topic: 'rechnen',

  items(_ctx, params) {
    const kinds =
      params.op === '+' ? ['zwei', 'drei', 'uebertrag'] : ['ohne', 'entbuendeln', 'null']
    return kinds.flatMap((k) =>
      ['a', 'b', 'c'].map((x) => `rechnen.schriftlich:${params.op}${k}-${x}`),
    )
  },

  generate(_ctx, params, itemKey, rng) {
    const kind = itemPart(itemKey).slice(1).split('-')[0]!
    let rows: number[]
    if (params.gross) rows = grosseZahlen(params.op, kind, rng)
    else if (params.op === '+') {
      if (kind === 'drei')
        rows = [randomInt(rng, 101, 399), randomInt(rng, 101, 299), randomInt(rng, 11, 299)]
      else if (kind === 'uebertrag') {
        // Carries in the ones and the tens: 478 + 256.
        const a = randomInt(rng, 1, 4) * 100 + randomInt(rng, 5, 9) * 10 + randomInt(rng, 5, 9)
        rows = [a, randomInt(rng, 1, 4) * 100 + randomInt(rng, 3, 9) * 10 + randomInt(rng, 3, 9)]
      } else rows = [randomInt(rng, 101, 599), randomInt(rng, 101, 399)]
    } else {
      let a = randomInt(rng, 400, 999)
      let b = randomInt(rng, 101, a - 50)
      if (kind === 'entbuendeln') {
        // The ones of b bigger than those of a: 734 − 258.
        a = randomInt(rng, 4, 9) * 100 + randomInt(rng, 1, 9) * 10 + randomInt(rng, 0, 6)
        b =
          randomInt(rng, 1, Math.floor(a / 100) - 1) * 100 +
          randomInt(rng, 0, 9) * 10 +
          randomInt(rng, (a % 10) + 1, 9)
      }
      if (kind === 'ohne') {
        // Every digit of b at most the digit of a.
        b = digitsOf(a, 3).reduce((s, d, i) => s + randomInt(rng, 0, d) * 10 ** i, 0)
        if (b < 100) b += 100
        if (b > a) b = a - 1
      } else if (kind === 'null') {
        // A zero in the tens (503 − 128): unbundling goes over the zero.
        const h = randomInt(rng, 3, 9)
        const e = randomInt(rng, 0, 4)
        a = h * 100 + e
        b = randomInt(rng, 1, h - 1) * 100 + randomInt(rng, 1, 9) * 10 + randomInt(rng, e + 1, 9)
      }
      rows = [a, b]
    }
    const result = params.op === '+' ? rows.reduce((s, r) => s + r, 0) : rows[0]! - rows[1]!
    const { width, columns } =
      params.op === '+' ? addColumns(rows) : subtractColumns(rows[0]!, rows[1]!)
    const sign = params.op === '+' ? ' + ' : ' − '
    return {
      instruction: `Rechne schriftlich: ${rows.map((r) => (r > 1000 ? String(r) : numberWord(r))).join(params.op === '+' ? ' plus ' : ' minus ')}. Fang bei den Einern an.`,
      caption: 'Rechne schriftlich. Fang rechts bei den Einern an.',
      hint: 'Rechne Spalte für Spalte, von rechts nach links.',
      solution: `${rows.join(sign)} = ${result}.`,
      data: { op: params.op, rows, result, width: Math.max(width, String(result).length), columns },
    }
  },

  component: SchriftlichTask,
}
