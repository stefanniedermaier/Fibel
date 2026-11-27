/**
 * M11 "Pfeilweg" (Mathematik 1/2, 2.1 "beschreiben und verfolgen Wege nach Anweisung"):
 * a mouse on a 5 × 5 grid, a row of arrows; the child taps the field where it arrives.
 */
import type { Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import PfeilwegTask from './PfeilwegTask.vue'

export const SIZE = 5
export type Pfeil = 'hoch' | 'runter' | 'links' | 'rechts'
export const MOVES: Record<Pfeil, [number, number]> = {
  hoch: [0, -1],
  runter: [0, 1],
  links: [-1, 0],
  rechts: [1, 0],
}
const SPOKEN: Record<Pfeil, string> = {
  hoch: 'nach oben',
  runter: 'nach unten',
  links: 'nach links',
  rechts: 'nach rechts',
}
const NUMBERS = ['', 'eins', 'zwei', 'drei', 'vier']

export interface PfeilwegData {
  start: [number, number]
  arrows: Pfeil[]
  correctKey: string
}

export const cellKey = (x: number, y: number) => `${x}-${y}`

/** A path of `steps` arrows inside the grid that does not end where it started. */
export function makePath(steps: number, rng: Rng): { start: [number, number]; arrows: Pfeil[] } {
  for (;;) {
    const start: [number, number] = [Math.floor(rng() * SIZE), Math.floor(rng() * SIZE)]
    let [x, y] = start
    const arrows: Pfeil[] = []
    const dirs = Object.keys(MOVES) as Pfeil[]
    for (let i = 0; i < steps; i++) {
      const options = dirs.filter((d) => {
        const [dx, dy] = MOVES[d]
        const nx = x + dx
        const ny = y + dy
        // No going straight back: that makes the path pointless.
        const back = arrows.length > 0 && MOVES[arrows.at(-1)!].every((v, k) => v === -[dx, dy][k]!)
        return nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && !back
      })
      const d = options[Math.floor(rng() * options.length)]!
      arrows.push(d)
      x += MOVES[d][0]
      y += MOVES[d][1]
    }
    if (x !== start[0] || y !== start[1]) return { start, arrows }
  }
}

export function endOf(start: [number, number], arrows: readonly Pfeil[]): [number, number] {
  return arrows.reduce<[number, number]>(([x, y], a) => [x + MOVES[a][0], y + MOVES[a][1]], start)
}

/** "zwei nach rechts, eins nach unten" – equal arrows in a row are counted. */
export function spokenPath(arrows: readonly Pfeil[]): string {
  const parts: string[] = []
  for (let i = 0; i < arrows.length;) {
    let n = 1
    while (arrows[i + n] === arrows[i]) n++
    parts.push(`${NUMBERS[n]} ${SPOKEN[arrows[i]!]}`)
    i += n
  }
  return parts.join(', ')
}

export const pfeilweg: ExerciseModule<Record<string, never>, PfeilwegData> = {
  id: 'formen.pfeilweg',
  topic: 'rechnen',

  items() {
    return [2, 3, 4].map((n) => `formen.pfeilweg:${n}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const steps = Number(itemKey.split(':')[1])
    const { start, arrows } = makePath(steps, rng)
    const [ex, ey] = endOf(start, arrows)
    return {
      instruction: `Die Maus geht so, wie die Pfeile zeigen: ${spokenPath(arrows)}. Wo kommt sie an? Tippe auf das Feld.`,
      caption: 'Wo kommt die Maus an? Tippe auf das Feld.',
      hint: 'Geh mit dem Finger Feld für Feld, Pfeil für Pfeil.',
      solution: `Die Maus kommt hier an: ${spokenPath(arrows)}.`,
      data: { start, arrows, correctKey: cellKey(ex, ey) },
    }
  },

  component: PfeilwegTask,
}
