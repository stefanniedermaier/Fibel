/**
 * R3-6, R3-7 "Halbschriftlich rechnen" (Mathematik 3/4, 1.2): the task is split into
 * steps that the child works out one after another.
 * - plus (stellenweise): 347 + 235 → 300 + 200, 40 + 30, 7 + 5, 500 + 70 + 12
 * - minus (schrittweise): 734 − 258 → 734 − 200, 534 − 50, 484 − 8
 * - mal: 7 · 34 → 7 · 30, 7 · 4, 210 + 28
 * - geteilt: 96 : 4 → 80 : 4, 16 : 4, 20 + 4
 */
import { randomInt } from '@/core/random'
import { numberWord } from '@/core/numbers'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import HalbschriftlichTask from './HalbschriftlichTask.vue'

export type HalbOp = '+' | '-' | '·' | ':'

export interface HalbschriftlichParams {
  ops: HalbOp[]
}

export interface Schritt {
  /** Shown as "300 + 200 = ?". */
  text: string
  answer: number
}

export interface HalbschriftlichData {
  task: string
  result: number
  steps: Schritt[]
}

const show = (op: HalbOp) => (op === '-' ? '−' : op)

/** The steps of a task (also used by the tests). */
export function stepsFor(op: HalbOp, a: number, b: number): Schritt[] {
  if (op === '+') {
    const parts = [100, 10, 1].map((p) => [Math.floor(a / p) % 10, Math.floor(b / p) % 10] as const)
    const sums = parts.map(([x, y], i) => (x + y) * [100, 10, 1][i]!)
    return [
      { text: `${parts[0]![0] * 100} + ${parts[0]![1] * 100}`, answer: sums[0]! },
      { text: `${parts[1]![0] * 10} + ${parts[1]![1] * 10}`, answer: sums[1]! },
      { text: `${parts[2]![0]} + ${parts[2]![1]}`, answer: sums[2]! },
      { text: `${sums[0]} + ${sums[1]} + ${sums[2]}`, answer: a + b },
    ]
  }
  if (op === '-') {
    const h = Math.floor(b / 100) * 100
    const z = Math.floor((b % 100) / 10) * 10
    const e = b % 10
    return [
      { text: `${a} − ${h}`, answer: a - h },
      { text: `${a - h} − ${z}`, answer: a - h - z },
      { text: `${a - h - z} − ${e}`, answer: a - b },
    ]
  }
  if (op === '·') {
    const z = Math.floor(b / 10) * 10
    const e = b % 10
    return [
      { text: `${a} · ${z}`, answer: a * z },
      { text: `${a} · ${e}`, answer: a * e },
      { text: `${a * z} + ${a * e}`, answer: a * b },
    ]
  }
  const q = a / b
  const big = Math.floor(q / 10) * 10 * b
  return [
    { text: `${big} : ${b}`, answer: big / b },
    { text: `${a - big} : ${b}`, answer: (a - big) / b },
    { text: `${big / b} + ${(a - big) / b}`, answer: q },
  ]
}

export const halbschriftlich: ExerciseModule<HalbschriftlichParams, HalbschriftlichData> = {
  id: 'rechnen.halbschriftlich',
  topic: 'rechnen',

  // The numbers are drawn at random; the item is the kind of task.
  items(_ctx, params) {
    return params.ops.flatMap((op) =>
      ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => `rechnen.halbschriftlich:${op}${k}`),
    )
  },

  generate(_ctx, _params, itemKey, rng) {
    const op = itemPart(itemKey).charAt(0) as HalbOp
    let a: number
    let b: number
    if (op === '+') {
      a = randomInt(rng, 112, 589)
      b = randomInt(rng, 111, 999 - a)
      // Stellenweise needs digits in every place.
      if (a % 10 === 0) a += 3
      if (b % 10 === 0) b += 4
    } else if (op === '-') {
      a = randomInt(rng, 400, 989)
      b = randomInt(rng, 111, a - 100)
    } else if (op === '·') {
      a = randomInt(rng, 3, 9)
      b = randomInt(rng, 12, 89)
      if (b % 10 === 0) b += 3
    } else {
      b = randomInt(rng, 2, 9)
      let q = randomInt(rng, 12, 40)
      if (q % 10 === 0) q += 1
      a = q * b
    }
    const steps = stepsFor(op, a, b)
    const result = steps.at(-1)!.answer
    const spokenOp = { '+': 'plus', '-': 'minus', '·': 'mal', ':': 'geteilt durch' }[op]
    return {
      instruction: `Rechne in Schritten: ${numberWord(a)} ${spokenOp} ${numberWord(b)}.`,
      caption: 'Rechne Schritt für Schritt.',
      hint: 'Rechne erst den oberen Schritt aus, dann den nächsten.',
      solution: `${a} ${show(op)} ${b} = ${result}.`,
      data: { task: `${a} ${show(op)} ${b}`, result, steps },
    }
  },

  component: HalbschriftlichTask,
}
