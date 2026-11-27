/**
 * M5/M7 "Päckchen": calculation strategies up to 20 (Mathematik 1/2, 1.2).
 * A solved task helps with the next one:
 * - verdoppeln: 7 + 7 · halbieren: the half of 14
 * - nachbar: 6 + 6 = 12 → 6 + 7 = ?
 * - tausch: 3 + 8 = 11 → 8 + 3 = ?
 * - umkehr: 9 + 5 = 14 → 14 − 5 = ?
 * `mode: 'pruefen'`: "Stimmt die Rechnung?" – find the mistake (7 + 5 = 13).
 */
import { numberWord } from '@/core/numbers'
import { pickOne, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart, shownOp, spokenArithmetic, type Arithmetic } from '../shared'
import PaeckchenTask from './PaeckchenTask.vue'

export type Strategie =
  | 'verdoppeln'
  | 'halbieren'
  | 'nachbar'
  | 'tausch'
  | 'umkehr'
  | 'analog'
  | 'analog100'
  | 'analog10'
  | 'analogmal'

export interface PaeckchenParams {
  max: number
  mode: 'strategie' | 'pruefen'
}

export interface PaeckchenData {
  mode: 'strategie' | 'pruefen'
  /** The solved helper task (shown), if any. */
  helper?: string
  /** The task to solve or to check. */
  task: string
  answer: number
  /** pruefen: is the shown result right? */
  correctKey: 'ja' | 'nein'
}

const show = (t: Arithmetic) => `${t.a} ${shownOp(t.op)} ${t.b}`

/** Up to 100 (R2-7): doubling bigger numbers, swap, inverse and analogous tasks. */
function tasks100(): string[] {
  const keys: string[] = []
  for (const a of [11, 12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50]) {
    keys.push(`verdoppeln:${a}`, `halbieren:${2 * a}`)
    if (2 * a + 1 <= 100) keys.push(`nachbar:${a}`)
  }
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; a + b <= 10; b++) keys.push(`analog:${a}+${b}`)
    for (const b of [23, 35, 46, 52, 64, 71]) keys.push(`tausch:${a}+${b}`)
  }
  for (const a of [24, 37, 45, 56, 63, 78]) {
    for (let b = 3; b <= 9; b += 2) keys.push(`umkehr:${a}+${b}`)
  }
  return keys
}

/** Up to 1000 (R3-4): analogous tasks with tens and hundreds, also with times. */
function tasks1000(): string[] {
  const keys: string[] = []
  for (let a = 1; a <= 9; a++) for (let b = 1; a + b <= 10; b++) keys.push(`analog100:${a}+${b}`)
  for (const a of [12, 15, 23, 34, 41, 56, 62, 75])
    for (const b of [3, 4, 5, 6]) if ((a % 10) + b < 10) keys.push(`analog10:${a}+${b}`)
  for (let k = 2; k <= 9; k++) for (const r of [3, 4, 6, 7, 8]) keys.push(`analogmal:${k}x${r}`)
  return keys
}

function tasks(max: number): string[] {
  if (max > 100) return tasks1000()
  if (max > 20) return tasks100()
  const keys: string[] = []
  for (let a = 1; 2 * a <= max; a++) {
    keys.push(`verdoppeln:${a}`, `halbieren:${2 * a}`)
    if (2 * a + 1 <= max) keys.push(`nachbar:${a}`)
  }
  for (let a = 1; a <= 9; a++) {
    for (let b = a + 2; a + b <= max; b++) keys.push(`tausch:${a}+${b}`)
  }
  for (let a = 2; a <= max - 1; a++) {
    for (let b = 2; a + b <= max && b <= 9; b++) {
      if (a + b > 10) keys.push(`umkehr:${a}+${b}`)
    }
  }
  return keys
}

function strategie(
  kind: Strategie,
  value: string,
): Omit<PaeckchenData, 'mode' | 'correctKey'> & {
  spoken: string
  hint: string
} {
  if (kind === 'verdoppeln') {
    const a = Number(value)
    return {
      task: `${a} + ${a}`,
      answer: 2 * a,
      spoken: `Verdopple ${numberWord(a)}. Wie viel ist ${numberWord(a)} plus ${numberWord(a)}?`,
      hint: 'Verdoppeln heißt: die gleiche Zahl noch einmal dazu.',
    }
  }
  if (kind === 'halbieren') {
    const n = Number(value)
    return {
      task: `Hälfte von ${n}`,
      answer: n / 2,
      spoken: `Was ist die Hälfte von ${numberWord(n)}?`,
      hint: 'Welche Zahl und noch einmal die gleiche Zahl ergeben das?',
    }
  }
  if (kind === 'nachbar') {
    const a = Number(value)
    return {
      helper: `${a} + ${a} = ${2 * a}`,
      task: `${a} + ${a + 1}`,
      answer: 2 * a + 1,
      spoken: `${numberWord(a)} plus ${numberWord(a)} ist ${numberWord(2 * a)}. Wie viel ist ${numberWord(a)} plus ${numberWord(a + 1)}?`,
      hint: 'Es ist einer mehr als bei der Aufgabe darüber.',
    }
  }
  if (kind === 'analogmal') {
    const [k, r] = value.split('x').map(Number) as [number, number]
    return {
      helper: `${k} · ${r} = ${k * r}`,
      task: `${k * 10} · ${r}`,
      answer: k * r * 10,
      spoken: `${numberWord(k)} mal ${numberWord(r)} ist ${numberWord(k * r)}. Wie viel ist ${numberWord(k * 10)} mal ${numberWord(r)}?`,
      hint: 'Zehnmal so viel: hänge eine Null an.',
    }
  }
  const [a, b] = value.split('+').map(Number) as [number, number]
  if (kind === 'analog100' || kind === 'analog10') {
    const f = kind === 'analog100' ? 100 : 10
    return {
      helper: `${a} + ${b} = ${a + b}`,
      task: `${a * f} + ${b * f}`,
      answer: (a + b) * f,
      spoken: `${numberWord(a)} plus ${numberWord(b)} ist ${numberWord(a + b)}. Wie viel ist ${numberWord(a * f)} plus ${numberWord(b * f)}?`,
      hint:
        f === 100 ? 'Rechne mit Hundertern wie mit Einern.' : 'Rechne mit Zehnern wie mit Einern.',
    }
  }
  if (kind === 'analog') {
    return {
      helper: `${a} + ${b} = ${a + b}`,
      task: `${10 * a} + ${10 * b}`,
      answer: 10 * (a + b),
      spoken: `${numberWord(a)} plus ${numberWord(b)} ist ${numberWord(a + b)}. Wie viel ist ${numberWord(10 * a)} plus ${numberWord(10 * b)}?`,
      hint: 'Mit Zehnern rechnest du wie mit Einern: drei Zehner plus vier Zehner.',
    }
  }
  if (kind === 'tausch') {
    return {
      helper: `${a} + ${b} = ${a + b}`,
      task: `${b} + ${a}`,
      answer: a + b,
      spoken: `${numberWord(a)} plus ${numberWord(b)} ist ${numberWord(a + b)}. Wie viel ist ${numberWord(b)} plus ${numberWord(a)}?`,
      hint: 'Die Zahlen sind nur vertauscht.',
    }
  }
  return {
    helper: `${a} + ${b} = ${a + b}`,
    task: `${a + b} − ${b}`,
    answer: a,
    spoken: `${numberWord(a)} plus ${numberWord(b)} ist ${numberWord(a + b)}. Wie viel ist ${numberWord(a + b)} minus ${numberWord(b)}?`,
    hint: 'Minus ist die Umkehrung von plus.',
  }
}

/** "Stimmt die Rechnung?": right in about half of the cases, otherwise off by one or two. */
function pruefen(max: number, value: string, rng: Rng) {
  const [a, b] = value.split('+').map(Number) as [number, number]
  const minus = rng() < 0.5
  const t: Arithmetic = minus
    ? { a: a + b, op: '-', b, result: a }
    : { a, op: '+', b, result: a + b }
  const right = rng() < 0.5
  const shown = right
    ? t.result
    : pickOne(
        [t.result - 2, t.result - 1, t.result + 1, t.result + 2].filter((x) => x >= 0 && x <= max),
        rng,
      )
  return { t, shown, right }
}

export const paeckchen: ExerciseModule<PaeckchenParams, PaeckchenData> = {
  id: 'rechnen.paeckchen',
  topic: 'rechnen',

  items(_ctx, params) {
    if (params.mode === 'pruefen') {
      const keys: string[] = []
      for (let a = 1; a < params.max; a++) {
        for (let b = 1; a + b <= params.max && b <= 9; b++)
          keys.push(`rechnen.paeckchen:pruefen:${a}+${b}`)
      }
      return keys
    }
    return tasks(params.max).map((k) => `rechnen.paeckchen:${k}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const [kind, value] = itemPart(itemKey).split(':') as [string, string]
    if (kind === 'pruefen') {
      const { t, shown, right } = pruefen(params.max, value, rng)
      const spoken = spokenArithmetic(t)
      return {
        instruction: `Stimmt das? ${spoken} ist ${numberWord(shown)}.`,
        caption: 'Stimmt die Rechnung?',
        hint: 'Rechne selbst nach.',
        solution: right
          ? `Ja, ${spoken} ist ${numberWord(t.result)}.`
          : `Nein. ${spoken} ist ${numberWord(t.result)}.`,
        data: {
          mode: 'pruefen',
          task: `${show(t)} = ${shown}`,
          answer: t.result,
          correctKey: right ? 'ja' : 'nein',
        },
      }
    }
    const s = strategie(kind as Strategie, value)
    return {
      instruction: s.spoken,
      caption: s.helper ? 'Die Aufgabe oben hilft dir.' : 'Rechne aus.',
      hint: s.hint,
      solution: `Das Ergebnis ist ${numberWord(s.answer)}.`,
      data: {
        mode: 'strategie',
        ...(s.helper ? { helper: s.helper } : {}),
        task: s.task,
        answer: s.answer,
        correctKey: 'ja',
      },
    }
  },

  component: PaeckchenTask,
}
