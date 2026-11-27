/**
 * M8 "Ordnungszahlen": animals stand in a row behind a start flag – "Tippe auf das
 * dritte Tier." Numbers as order, not as amount (Mathematik 1/2, 1.1: Zählzahlen,
 * Platznummern).
 */
import lage from '@/data/common/lage.json'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import LageTask from '../../formen/lage/LageTask.vue'
import type { LageData } from '../../formen/lage'
import { itemPart } from '../shared'

export const ORDINALS = ['erste', 'zweite', 'dritte', 'vierte', 'fünfte']

export const ordnungszahl: ExerciseModule<Record<string, never>, LageData> = {
  id: 'rechnen.ordnungszahl',
  topic: 'rechnen',

  items() {
    return ORDINALS.map((_, i) => `rechnen.ordnungszahl:${i + 1}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const n = Number(itemPart(itemKey))
    const animals = shuffle(lage.tiere, rng).slice(0, ORDINALS.length)
    const ordinal = ORDINALS[n - 1]!
    return {
      instruction: `Tippe auf das ${ordinal} Tier. Fang bei der Fahne an zu zählen.`,
      caption: `Tippe auf das ${ordinal} Tier.`,
      hint: 'Zähle von der Fahne aus: erstes, zweites, drittes …',
      solution: `Das ${ordinal} Tier ist ${animals[n - 1]!.name}.`,
      data: {
        mode: 'reihe',
        start: true,
        places: animals.map((a, i) => ({ key: String(i + 1), image: a.image, place: String(i) })),
        correctKey: String(n),
      },
    }
  },

  component: LageTask,
}
