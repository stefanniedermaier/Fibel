/**
 * F4-4 "Parkettieren" (Mathematik 3/4, 2.4): with which shape can you tile a floor
 * without gaps? Triangle, square and hexagon do; circle, pentagon and octagon do not.
 */
import { regularPolygon } from '@/core/geometry'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import WinkelTask from '../winkel/WinkelTask.vue'
import type { WinkelData, Zeichnung } from '../winkel'

export const PARKETT: Record<string, { name: string; passt: boolean; points: [number, number][] }> =
  {
    dreieck: { name: 'das Dreieck', passt: true, points: regularPolygon(3) },
    quadrat: { name: 'das Quadrat', passt: true, points: regularPolygon(4, 42, -45) },
    sechseck: { name: 'das Sechseck', passt: true, points: regularPolygon(6) },
    kreis: { name: 'der Kreis', passt: false, points: regularPolygon(32) },
    fuenfeck: { name: 'das Fünfeck', passt: false, points: regularPolygon(5) },
    achteck: { name: 'das Achteck', passt: false, points: regularPolygon(8, 42, -22.5) },
  }

const keys = (passt: boolean) => Object.keys(PARKETT).filter((k) => PARKETT[k]!.passt === passt)
const zeichnung = (k: string): Zeichnung => ({ key: k, points: PARKETT[k]!.points, closed: true })

export const parkett: ExerciseModule<Record<string, never>, WinkelData> = {
  id: 'formen.parkett',
  topic: 'formen',

  items() {
    return keys(true).map((k) => `formen.parkett:${k}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const id = itemKey.split(':')[1]!
    const wrong = shuffle(keys(false), rng).slice(0, 2)
    return {
      instruction: 'Mit welcher Form kannst du einen Boden ganz ohne Lücken auslegen?',
      hint: 'Stell dir viele gleiche Fliesen nebeneinander vor. Bleiben Lücken?',
      solution: `Mit ${PARKETT[id]!.name} geht es ohne Lücken. Bei den anderen Formen bleiben Lücken.`,
      data: { correctKey: id, choices: shuffle([id, ...wrong].map(zeichnung), rng) },
    }
  },

  component: WinkelTask,
}
