/**
 * M12 "Symmetrisch oder nicht?" (Mathematik 1/2, 2.3, only recognising): a figure of
 * squares with a dashed mirror line; does one half fit exactly onto the other?
 */
import type { Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import SymmetrieTask from './SymmetrieTask.vue'

export const COLS = 6
export const ROWS = 6

export interface SymmetrieData {
  /** Filled cells as "x-y". */
  cells: string[]
  color: string
  correctKey: 'ja' | 'nein'
  choices: { key: string; image: string; label: string }[]
}

const COLORS = ['#EA5A47', '#61B2E4', '#B1CC33', '#F1B31C', '#B399C8']

export function isSymmetric(cells: readonly string[]): boolean {
  const set = new Set(cells)
  return cells.every((c) => {
    const [x, y] = c.split('-').map(Number) as [number, number]
    return set.has(`${COLS - 1 - x}-${y}`)
  })
}

/** A mirrored figure; for "nein" one or two squares of the right half are changed. */
export function makeFigure(symmetric: boolean, rng: Rng): string[] {
  for (;;) {
    const half: string[] = []
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS / 2; x++) if (rng() < 0.45) half.push(`${x}-${y}`)
    if (half.length < 4) continue
    const cells = new Set(half)
    for (const c of half) {
      const [x, y] = c.split('-').map(Number) as [number, number]
      cells.add(`${COLS - 1 - x}-${y}`)
    }
    if (!symmetric) {
      const changes = 1 + Math.floor(rng() * 2)
      for (let i = 0; i < changes; i++) {
        const key = `${COLS / 2 + Math.floor(rng() * (COLS / 2))}-${Math.floor(rng() * ROWS)}`
        if (cells.has(key)) cells.delete(key)
        else cells.add(key)
      }
    }
    const result = [...cells]
    if (isSymmetric(result) === symmetric && result.length > 0) return result
  }
}

export const symmetrie: ExerciseModule<Record<string, never>, SymmetrieData> = {
  id: 'formen.symmetrie',
  topic: 'rechnen',

  items() {
    return ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => `formen.symmetrie:${id}`)
  },

  generate(_ctx, _params, _itemKey, rng) {
    const symmetric = rng() < 0.5
    const answer = symmetric ? 'ja' : 'nein'
    return {
      instruction:
        'Ist die Figur symmetrisch? Dann passt die eine Hälfte genau auf die andere, wie bei einem Spiegel.',
      caption: 'Ist die Figur symmetrisch?',
      hint: 'Vergleiche Reihe für Reihe: links und rechts vom Strich.',
      solution: symmetric
        ? 'Die Figur ist symmetrisch. Beide Hälften sind gleich.'
        : 'Die Figur ist nicht symmetrisch. Links und rechts sind verschieden.',
      data: {
        cells: makeFigure(symmetric, rng),
        color: COLORS[Math.floor(rng() * COLORS.length)]!,
        correctKey: answer,
        choices: [
          { key: 'ja', image: '1F44D', label: 'symmetrisch' },
          { key: 'nein', image: '1F44E', label: 'nicht symmetrisch' },
        ],
      },
    }
  },

  component: SymmetrieTask,
}
