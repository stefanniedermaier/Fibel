/**
 * Einmaleins und Teilen (Mathematik 1/2, 1.2; plaene/klasse-2.md R2-8 bis R2-11).
 * - bild: a dot field → which multiplication fits? (understand multiplication)
 * - rechnen: tasks of chosen times tables, square numbers and "mal 0", with division as
 *   the inverse; the hint names the nearest core task (10 · 8 → 9 · 8).
 * - rest: sharing with a remainder (17 : 5 = 3 Rest 2).
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import EinmaleinsTask from './EinmaleinsTask.vue'
import { textChoices } from '../../choices'

export interface EinmaleinsParams {
  mode: 'bild' | 'rechnen' | 'rest'
  /** Times tables (Reihen), e.g. [1, 2, 5, 10] for the core tasks. */
  reihen?: number[]
  /** Square numbers 1 · 1 to 10 · 10. */
  quadrat?: boolean
  /** Also division as the inverse (12 : 3). */
  geteilt?: boolean
}

export interface EinmaleinsData {
  mode: 'bild' | 'rechnen' | 'rest'
  /** The task as shown, e.g. "3 · 4" or "12 : 3". */
  task: string
  answer: number
  /** bild: dot field rows × columns. */
  rows?: number
  cols?: number
  choices?: { key: string; label: string }[]
  correctKey?: string
}

const CORE = [1, 2, 5, 10]

/** The nearest core task for k · r: 9 · 8 → 10 · 8, 4 · 6 → 5 · 6 (R2-10). */
export function coreHint(k: number, r: number): string | undefined {
  if (CORE.includes(k) || k === 0) return undefined
  const c = CORE.reduce((best, x) => (Math.abs(x - k) < Math.abs(best - k) ? x : best))
  const diff = k - c
  const how =
    diff > 0
      ? `plus ${numberWord(diff)} mal ${numberWord(r)}`
      : `minus ${numberWord(-diff)} mal ${numberWord(r)}`
  return `Denk an ${numberWord(c)} mal ${numberWord(r)}, das ist ${numberWord(c * r)}. Dann ${how}.`
}

function items(params: EinmaleinsParams): string[] {
  const keys = new Set<string>()
  if (params.mode === 'bild') {
    for (let r = 2; r <= 5; r++) for (let c = 2; c <= 6; c++) keys.add(`bild-${r}x${c}`)
    return [...keys]
  }
  if (params.mode === 'rest') {
    for (let d = 2; d <= 5; d++)
      for (let a = d + 1; a <= 30; a++) if (a % d !== 0) keys.add(`${a}r${d}`)
    return [...keys]
  }
  for (const r of params.reihen ?? []) {
    for (let k = 0; k <= 10; k++) {
      keys.add(`${k}x${r}`)
      if (params.geteilt && k > 0) keys.add(`${k * r}d${r}`)
    }
  }
  if (params.quadrat) {
    for (let k = 1; k <= 10; k++) {
      keys.add(`${k}x${k}`)
      if (params.geteilt) keys.add(`${k * k}d${k}`)
    }
  }
  return [...keys]
}

export const einmaleins: ExerciseModule<EinmaleinsParams, EinmaleinsData> = {
  id: 'rechnen.einmaleins',
  topic: 'rechnen',

  items(_ctx, params) {
    return items(params).map((k) => `rechnen.einmaleins:${k}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const part = itemPart(itemKey)
    if (part.startsWith('bild-')) {
      const [rows, cols] = part.slice(5).split('x').map(Number) as [number, number]
      const right = `${rows} · ${cols}`
      const wrong = shuffle(
        [
          `${rows} + ${cols}`,
          `${rows} · ${cols + 1}`,
          `${rows + 1} · ${cols}`,
          `${rows - 1} · ${cols}`,
        ],
        rng,
      ).slice(0, 2)
      return {
        instruction: `Schau dir das Punktefeld an. ${numberWord(rows)} Reihen mit je ${numberWord(cols)} Punkten. Welche Malaufgabe passt?`,
        caption: 'Welche Malaufgabe passt zum Punktefeld?',
        hint: 'Zähle die Reihen und wie viele Punkte in einer Reihe sind.',
        solution: `${numberWord(rows)} mal ${numberWord(cols)} ist ${numberWord(rows * cols)}.`,
        data: {
          mode: 'bild',
          task: right,
          answer: rows * cols,
          rows,
          cols,
          correctKey: right,
          choices: textChoices([right, ...wrong], rng),
        },
      }
    }
    if (part.includes('r')) {
      const [a, d] = part.split('r').map(Number) as [number, number]
      const q = Math.floor(a / d)
      const rest = a % d
      const right = `${q} Rest ${rest}`
      const near = [
        `${q + 1} Rest ${rest}`,
        `${q} Rest ${rest + 1 < d ? rest + 1 : rest - 1}`,
        `${q - 1} Rest ${rest + d}`,
      ].filter((l, i, all) => l !== right && all.indexOf(l) === i)
      return {
        instruction: `${numberWord(a)} Äpfel werden an ${numberWord(d)} Kinder verteilt. Jedes Kind bekommt gleich viele. Wie viele bekommt jedes Kind, und wie viele bleiben übrig?`,
        caption: `${a} : ${d} = ?`,
        hint: `Wie oft passt die ${numberWord(d)} in die ${numberWord(a)}?`,
        solution: `${numberWord(a)} geteilt durch ${numberWord(d)} ist ${numberWord(q)}, Rest ${numberWord(rest)}.`,
        data: {
          mode: 'rest',
          task: `${a} : ${d}`,
          answer: q,
          correctKey: right,
          choices: textChoices([right, ...near.slice(0, 2)], rng),
        },
      }
    }
    if (part.includes('d')) {
      const [a, d] = part.split('d').map(Number) as [number, number]
      const q = a / d
      return {
        instruction: `Wie viel ist ${numberWord(a)} geteilt durch ${numberWord(d)}?`,
        caption: 'Rechne aus.',
        hint: `Wie viel mal ${numberWord(d)} ist ${numberWord(a)}?`,
        solution: `${numberWord(a)} geteilt durch ${numberWord(d)} ist ${numberWord(q)}, denn ${numberWord(q)} mal ${numberWord(d)} ist ${numberWord(a)}.`,
        data: { mode: 'rechnen', task: `${a} : ${d}`, answer: q },
      }
    }
    const [k, r] = part.split('x').map(Number) as [number, number]
    return {
      instruction: `Wie viel ist ${numberWord(k)} mal ${numberWord(r)}?`,
      caption: 'Rechne aus.',
      hint: coreHint(k, r) ?? (k === 0 ? 'Null mal eine Zahl ist immer null.' : undefined),
      solution: `${numberWord(k)} mal ${numberWord(r)} ist ${numberWord(k * r)}.`,
      data: { mode: 'rechnen', task: `${k} · ${r}`, answer: k * r },
    }
  },

  component: EinmaleinsTask,
}
