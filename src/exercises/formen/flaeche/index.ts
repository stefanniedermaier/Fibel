/**
 * F2-6 "Flächen vergleichen" (Mathematik 1/2, 2.5: "vergleichen Flächen durch Auslegen
 * mit Einheitsquadraten"): figures of squares on a grid – how many squares, and which
 * figure is bigger? The figures have different shapes, so the eye alone can deceive.
 */
import { shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import FlaecheTask from './FlaecheTask.vue'

export const GRID_W = 5
export const GRID_H = 5

/** A connected figure of `n` squares, grown square by square. */
export function figure(n: number, rng: Rng): string[] {
  const cells = new Set([`${Math.floor(GRID_W / 2)}-${Math.floor(GRID_H / 2)}`])
  while (cells.size < n) {
    const [x, y] = [...cells][Math.floor(rng() * cells.size)]!.split('-').map(Number) as [
      number,
      number,
    ]
    const [dx, dy] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ][Math.floor(rng() * 4)]!
    const nx = x + dx!
    const ny = y + dy!
    if (nx >= 0 && ny >= 0 && nx < GRID_W && ny < GRID_H) cells.add(`${nx}-${ny}`)
  }
  return [...cells]
}

export interface FlaecheParams {
  /** 'umfang': how many square sides long is the border of a rectangle? */
  mode: 'zaehlen' | 'vergleichen' | 'umfang'
}

export interface FlaecheData {
  /** `border`: the outline is drawn thick (perimeter). */
  figures: { cells: string[]; color: string; label?: string; border?: boolean }[]
  correctKey: string
  choices: { key: string; label: string }[]
}

const COLORS = ['#61B2E4', '#EA5A47', '#B1CC33', '#F1B31C']

export const flaeche: ExerciseModule<FlaecheParams, FlaecheData> = {
  id: 'formen.flaeche',
  topic: 'formen',

  items(_ctx, params) {
    if (params.mode === 'umfang') {
      const keys: string[] = []
      for (let w = 1; w <= 4; w++)
        for (let h = 1; h <= 4; h++) if (w * h > 1) keys.push(`formen.flaeche:umfang:${w}x${h}`)
      return keys
    }
    if (params.mode === 'vergleichen')
      return ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => `formen.flaeche:vergleichen:${k}`)
    return Array.from({ length: 9 }, (_, i) => `formen.flaeche:zaehlen:${i + 4}`)
  },

  generate(_ctx, params, itemKey, rng) {
    if (params.mode === 'umfang') {
      const [w, h] = itemKey.split(':')[2]!.split('x').map(Number) as [number, number]
      const u = 2 * (w + h)
      const cells: string[] = []
      for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) cells.push(`${x}-${y}`)
      const wrong = shuffle(
        [w * h, u - 2, u + 2, w + h].filter((v, i, all) => v !== u && all.indexOf(v) === i),
        rng,
      ).slice(0, 2)
      return {
        instruction: 'Wie lang ist der Rand der Fläche? Zähle die Kästchenseiten rundherum.',
        caption: 'Wie viele Kästchenseiten lang ist der Rand?',
        hint: 'Fahre mit dem Finger einmal um die Fläche herum und zähle jede Seite.',
        solution: `Der Rand ist ${u} Kästchenseiten lang: ${w} + ${h} + ${w} + ${h}.`,
        data: {
          figures: [{ cells, color: COLORS[2]!, border: true }],
          correctKey: String(u),
          choices: shuffle([u, ...wrong], rng).map((x) => ({ key: String(x), label: String(x) })),
        },
      }
    }
    if (params.mode === 'zaehlen') {
      const n = Number(itemKey.split(':')[2])
      const wrong = shuffle([n - 1, n + 1, n + 2, n - 2], rng).slice(0, 2)
      return {
        instruction: 'Wie viele Kästchen groß ist die Fläche?',
        hint: 'Zähle Reihe für Reihe.',
        solution: `Die Fläche ist ${n} Kästchen groß.`,
        data: {
          figures: [{ cells: figure(n, rng), color: COLORS[n % 4]! }],
          correctKey: String(n),
          choices: shuffle([n, ...wrong], rng).map((x) => ({ key: String(x), label: String(x) })),
        },
      }
    }
    // Sometimes equal: then "gleich groß" is right.
    const equal = rng() < 0.25
    const a = 5 + Math.floor(rng() * 6)
    const b = equal ? a : a + (rng() < 0.5 ? -1 : 1) * (1 + Math.floor(rng() * 2))
    const key = a === b ? 'gleich' : a > b ? 'A' : 'B'
    return {
      instruction: 'Welche Fläche ist größer? Zähle die Kästchen.',
      hint: 'Zähle bei beiden Flächen die Kästchen.',
      solution:
        key === 'gleich'
          ? `Beide Flächen sind ${a} Kästchen groß.`
          : `Fläche ${key} ist größer: ${Math.max(a, b)} Kästchen statt ${Math.min(a, b)}.`,
      data: {
        figures: [
          { cells: figure(a, rng), color: COLORS[0]!, label: 'A' },
          { cells: figure(b, rng), color: COLORS[1]!, label: 'B' },
        ],
        correctKey: key,
        choices: [
          { key: 'A', label: 'A' },
          { key: 'B', label: 'B' },
          { key: 'gleich', label: 'gleich groß' },
        ],
      },
    }
  },

  component: FlaecheTask,
}
