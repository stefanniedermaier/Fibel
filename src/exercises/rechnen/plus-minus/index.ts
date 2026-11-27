/**
 * R4/R5 "Plus und Minus": one module for number range 10 and 20 (params.max).
 * With max 20 only tasks beyond 10 are used (the ones up to 10 are R4); crossing
 * the ten only if the parents switched it on.
 */
import type { ExerciseModule } from '../../types'
import {
  crossesTen,
  itemPart,
  parseArithmetic,
  spokenArithmetic,
  type Arithmetic,
  type Op,
} from '../shared'
import { numberWord } from '@/core/numbers'
import PlusMinusTask from './PlusMinusTask.vue'

export interface PlusMinusParams {
  max: number
  /** Only tasks in which a number is greater than this (e.g. 10 for R5). */
  above?: number
  /**
   * Up to 100 (R2-6): the kinds of task. ZZ 30 + 40, ZE+E 34 + 5, ZE+Z 34 + 20,
   * ZE+ZE 34 + 25 (and the same with minus).
   */
  forms?: Form[]
}

export type Form = 'ZZ' | 'ZE+E' | 'ZE+Z' | 'ZE+ZE'

/** Crossing a ten up to 100: 37 + 5, 34 − 6 (reaching it exactly does not count). */
export function crossesTens({ a, op, b }: Arithmetic): boolean {
  return op === '+' ? (a % 10) + (b % 10) > 10 : a % 10 < b % 10
}

function hundredTasks(
  forms: readonly Form[],
  settings: { allowMinus: boolean; tenCrossing: boolean },
): Arithmetic[] {
  const zz = [10, 20, 30, 40, 50, 60, 70, 80, 90]
  const ze = Array.from({ length: 89 }, (_, i) => i + 11).filter((n) => n % 10 !== 0)
  const pairs: [number, number][] = []
  for (const form of forms) {
    if (form === 'ZZ') for (const a of zz) for (const b of zz) pairs.push([a, b])
    if (form === 'ZE+E') for (const a of ze) for (let b = 1; b <= 9; b++) pairs.push([a, b])
    if (form === 'ZE+Z') for (const a of ze) for (const b of zz) pairs.push([a, b])
    // Second number up to 49, so the list stays manageable.
    if (form === 'ZE+ZE')
      for (const a of ze) for (const b of ze.filter((n) => n < 50)) pairs.push([a, b])
  }
  const ops: Op[] = settings.allowMinus ? ['+', '-'] : ['+']
  const result: Arithmetic[] = []
  for (const [a, b] of pairs) {
    for (const op of ops) {
      const r = op === '+' ? a + b : a - b
      if (r <= 0 || r > 100) continue
      const task = { a, op, b, result: r }
      if (crossesTens(task) && !settings.tenCrossing) continue
      result.push(task)
    }
  }
  return result
}

export interface PlusMinusData extends Arithmetic {
  /** Ten frame up to 20; 0 = tens and ones (Dienes) up to 100. */
  cells: 0 | 10 | 20
}

/** All tasks allowed by the params and the parents' settings. */
export function tasksFor(
  params: PlusMinusParams,
  settings: { numberRange: number; allowMinus: boolean; tenCrossing: boolean },
): Arithmetic[] {
  if (settings.numberRange < params.max) return []
  if (params.forms) return hundredTasks(params.forms, settings)
  const above = params.above ?? 0
  const ops: Op[] = settings.allowMinus ? ['+', '-'] : ['+']
  const result: Arithmetic[] = []
  for (const op of ops) {
    for (let a = 1; a <= params.max; a++) {
      // Up to 10 all second numbers, beyond 10 only single digits (12 + 5, 15 − 3).
      for (let b = 1; b <= Math.min(params.max, params.max > 10 ? 9 : 10); b++) {
        const r = op === '+' ? a + b : a - b
        if (r < 0 || r > params.max) continue
        const task = { a, op, b, result: r }
        if (Math.max(a, r) <= above) continue
        if (params.max > 10 && crossesTen(task) && !settings.tenCrossing) continue
        result.push(task)
      }
    }
  }
  return result
}

export const plusMinus: ExerciseModule<PlusMinusParams, PlusMinusData> = {
  id: 'rechnen.plus-minus',
  topic: 'rechnen',

  items(ctx, params) {
    return tasksFor(params, ctx.settings).map((t) => `rechnen.plus-minus:${t.a}${t.op}${t.b}`)
  },

  generate(_ctx, params, itemKey) {
    const task = parseArithmetic(itemPart(itemKey))
    const spoken = spokenArithmetic(task)
    return {
      instruction: `Wie viel ist ${spoken}?`,
      caption: 'Rechne aus.',
      hint:
        params.max > 20
          ? 'Rechne erst mit den Zehnern, dann mit den Einern.'
          : 'Schau dir die Plättchen an und zähle.',
      solution: `${spoken} ist ${numberWord(task.result)}.`,
      data: { ...task, cells: params.max > 20 ? 0 : params.max > 10 ? 20 : 10 },
    }
  },

  component: PlusMinusTask,
}
