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
}

export interface PlusMinusData extends Arithmetic {
  cells: 10 | 20
}

/** All tasks allowed by the params and the parents' settings. */
export function tasksFor(
  params: PlusMinusParams,
  settings: { numberRange: number; allowMinus: boolean; tenCrossing: boolean },
): Arithmetic[] {
  if (settings.numberRange < params.max) return []
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
      hint: 'Schau dir die Plättchen an und zähle.',
      solution: `${spoken} ist ${numberWord(task.result)}.`,
      data: { ...task, cells: params.max > 10 ? 20 : 10 },
    }
  },

  component: PlusMinusTask,
}
