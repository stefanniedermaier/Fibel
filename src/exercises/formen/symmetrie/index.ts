/**
 * M12 "Symmetrisch oder nicht?" (Mathematik 1/2, 2.3, only recognising): a figure of
 * squares with a dashed mirror line; does one half fit exactly onto the other?
 */
import { shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import SymmetrieTask from './SymmetrieTask.vue'

export const COLS = 6
export const ROWS = 6

export interface SymmetrieData {
  /** 'ergaenzen' (grade 2, F2-4): only the left half is shown; pick the right half. */
  mode: 'erkennen' | 'ergaenzen'
  /** Filled cells as "x-y". */
  cells: string[]
  /** ergaenzen: right halves to choose from. */
  options?: { key: string; cells: string[] }[]
  color: string
  correctKey: string
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

export interface SymmetrieParams {
  mode?: 'erkennen' | 'ergaenzen'
}

const mirror = (cells: readonly string[]) =>
  cells.map((c) => {
    const [x, y] = c.split('-').map(Number) as [number, number]
    return `${COLS - 1 - x}-${y}`
  })
const shift = (cells: readonly string[]) =>
  cells.map((c) => {
    const [x, y] = c.split('-').map(Number) as [number, number]
    return `${x + COLS / 2}-${y}`
  })
const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((c) => b.includes(c))

/** Left half, the right (mirrored) half and two wrong halves – all different. */
export function halves(rng: Rng): { left: string[]; right: string[]; wrong: string[][] } {
  for (;;) {
    const left = makeFigure(true, rng).filter((c) => Number(c.split('-')[0]) < COLS / 2)
    const right = mirror(left)
    const shifted = shift(left)
    const changed = [...right]
    const key = `${COLS / 2 + Math.floor(rng() * (COLS / 2))}-${Math.floor(rng() * ROWS)}`
    if (changed.includes(key)) changed.splice(changed.indexOf(key), 1)
    else changed.push(key)
    if (
      !same(shifted, right) &&
      !same(changed, right) &&
      !same(changed, shifted) &&
      changed.length > 0
    )
      return { left, right, wrong: [shifted, changed] }
  }
}

export const symmetrie: ExerciseModule<SymmetrieParams, SymmetrieData> = {
  id: 'formen.symmetrie',
  topic: 'rechnen',

  items(_ctx, params) {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    return params.mode === 'ergaenzen'
      ? ids.map((id) => `formen.symmetrie:ergaenzen-${id}`)
      : ids.map((id) => `formen.symmetrie:${id}`)
  },

  generate(_ctx, params, _itemKey, rng) {
    if (params.mode === 'ergaenzen') {
      const h = halves(rng)
      const options = shuffle(
        [
          { key: 'richtig', cells: h.right },
          { key: 'verschoben', cells: h.wrong[0]! },
          { key: 'anders', cells: h.wrong[1]! },
        ],
        rng,
      )
      return {
        instruction: 'Ergänze die Figur, sodass sie symmetrisch ist. Welche Hälfte passt rechts?',
        caption: 'Welche Hälfte passt rechts?',
        hint: 'Die rechte Hälfte ist wie im Spiegel: was links außen ist, ist rechts außen.',
        solution: 'Die passende Hälfte ist das Spiegelbild der linken Hälfte.',
        data: {
          mode: 'ergaenzen',
          cells: h.left,
          options,
          color: COLORS[Math.floor(rng() * COLORS.length)]!,
          correctKey: 'richtig',
          choices: options.map((o, i) => ({
            key: o.key,
            image: '',
            label: String.fromCharCode(65 + i),
          })),
        },
      }
    }
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
        mode: 'erkennen',
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
