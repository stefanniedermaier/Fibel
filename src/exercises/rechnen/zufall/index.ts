/**
 * R2-16 "Zufall" (Mathematik 1/2, 4.2): balls in a box.
 * - 'sicher': "Du ziehst eine Kugel. Sie ist rot." – sicher, möglich oder unmöglich?
 * - 'chance': two boxes – where is the chance of a red ball bigger?
 */
import { pickOne, shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import ZufallTask from './ZufallTask.vue'

export const FARBEN = { rot: '#EA5A47', blau: '#61B2E4', gelb: '#F1B31C' } as const
type Farbe = keyof typeof FARBEN

export interface ZufallParams {
  mode: 'sicher' | 'chance'
}

export interface ZufallData {
  /** One or two boxes, each a list of ball colours. */
  boxes: Farbe[][]
  colors: typeof FARBEN
  correctKey: string
  choices: { key: string; label: string }[]
}

const box = (counts: Partial<Record<Farbe, number>>): Farbe[] =>
  (Object.entries(counts) as [Farbe, number][]).flatMap(([f, n]) => Array<Farbe>(n).fill(f))

export const zufall: ExerciseModule<ZufallParams, ZufallData> = {
  id: 'rechnen.zufall',
  topic: 'rechnen',

  items(_ctx, params) {
    if (params.mode === 'chance')
      return ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => `rechnen.zufall:chance:${k}`)
    return ['sicher', 'moeglich', 'unmoeglich'].flatMap((k) =>
      [1, 2, 3].map((n) => `rechnen.zufall:sicher:${k}-${n}`),
    )
  },

  generate(_ctx, params, itemKey, rng) {
    const part = itemKey.split(':')[2]!
    if (params.mode === 'chance') {
      // Clear differences only: 5 of 6 red against 1 of 6, or 4 of 5 against 2 of 5.
      const [many, few] = pickOne(
        [
          [5, 1],
          [4, 2],
          [6, 2],
          [3, 0],
        ] as const,
        rng,
      )
      const size = many + (6 - many)
      const a = box({ rot: many, blau: size - many })
      const b = box({ rot: few, blau: size - few })
      const first = rng() < 0.5
      return {
        instruction: 'In welcher Dose ist die Chance größer, eine rote Kugel zu ziehen?',
        hint: 'In welcher Dose sind mehr rote Kugeln?',
        solution: `In Dose ${first ? 'A' : 'B'} sind mehr rote Kugeln. Dort ist die Chance größer.`,
        data: {
          boxes: first ? [shuffle(a, rng), shuffle(b, rng)] : [shuffle(b, rng), shuffle(a, rng)],
          colors: FARBEN,
          correctKey: first ? 'A' : 'B',
          choices: [
            { key: 'A', label: 'Dose A' },
            { key: 'B', label: 'Dose B' },
          ],
        },
      }
    }
    const kind = part.split('-')[0] as 'sicher' | 'moeglich' | 'unmoeglich'
    const want: Farbe = pickOne(['rot', 'blau', 'gelb'] as const, rng)
    const other: Farbe = want === 'rot' ? 'blau' : 'rot'
    const n = 2 + Math.floor(rng() * 4)
    const content =
      kind === 'sicher'
        ? box({ [want]: n })
        : kind === 'moeglich'
          ? box({ [want]: 1 + Math.floor(rng() * 3), [other]: 2 })
          : box({ [other]: n, ...(rng() < 0.5 ? { gelb: want === 'gelb' ? 0 : 1 } : {}) })
    const label = { sicher: 'sicher', moeglich: 'möglich', unmoeglich: 'unmöglich' }[kind]
    return {
      instruction: `Du ziehst ohne hinzusehen eine Kugel. Sie ist ${want}. Ist das sicher, möglich oder unmöglich?`,
      caption: `Die Kugel ist ${want}. Sicher, möglich oder unmöglich?`,
      hint: `Wie viele ${want}e Kugeln sind in der Dose? Sind auch andere drin?`,
      solution: `Das ist ${label}.`,
      data: {
        boxes: [shuffle(content, rng)],
        colors: FARBEN,
        correctKey: kind,
        choices: [
          { key: 'sicher', label: 'sicher' },
          { key: 'moeglich', label: 'möglich' },
          { key: 'unmoeglich', label: 'unmöglich' },
        ],
      },
    }
  },

  component: ZufallTask,
}
