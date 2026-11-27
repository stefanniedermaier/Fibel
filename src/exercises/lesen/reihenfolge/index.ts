/**
 * D6 "Was passiert zuerst?": pictures of a sequence (Ei – Küken – Huhn, a day, washing
 * hands) are shuffled; the child taps them in the right order (Deutsch 1/2, 2.4:
 * "ordnen einfache Visualisierungen, um eine Abfolge … zu veranschaulichen").
 * The same exercise serves HSU with its own sequences (`source`).
 */
import ablaeufe from '@/data/basis/klasse-1/ablaeufe.json'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemId } from '../shared'
import ReihenfolgeTask from './ReihenfolgeTask.vue'

export interface Ablauf {
  id: string
  title: string
  images: string[]
  steps: string[]
  /** Own question instead of "Was passiert zuerst?", e.g. for food chains. */
  frage?: string
  /** Only for HSU (picked by id), not in the Deutsch unit. */
  sache?: boolean
}

/** HSU picks its sequences by id; without ids all of them (Deutsch). */
export interface ReihenfolgeParams {
  ids?: string[]
  /** Grade 2 (L2-7): the steps as sentences to read, with the pictures. */
  saetze?: boolean
}

export const ABLAEUFE: readonly Ablauf[] = ablaeufe

export interface ReihenfolgeData {
  /** In the right order; `order` is how they are shown. */
  images: string[]
  order: number[]
  steps: string[]
  /** Read and order sentences instead of pictures. */
  texts?: string[]
}

export const reihenfolge: ExerciseModule<ReihenfolgeParams, ReihenfolgeData> = {
  id: 'lesen.reihenfolge',
  topic: 'lesen',

  items(_ctx, params) {
    return ABLAEUFE.filter((a) => (params.ids ? params.ids.includes(a.id) : !a.sache)).map(
      (a) => `lesen.reihenfolge:${a.id}`,
    )
  },

  generate(_ctx, params, itemKey, rng) {
    const ablauf = ABLAEUFE.find((a) => a.id === itemId(itemKey))
    if (!ablauf) throw new Error(`Unbekannter Ablauf: ${itemKey}`)
    const indices = ablauf.images.map((_, i) => i)
    // Never shown in the right order already.
    let order = shuffle(indices, rng)
    while (order.every((v, i) => v === i)) order = shuffle(indices, rng)
    return {
      instruction: `${ablauf.title}. ${ablauf.frage ?? 'Was passiert zuerst?'} Tippe ${params.saetze ? 'die Sätze' : 'die Bilder'} der Reihe nach an.`,
      caption: params.saetze
        ? 'Lies die Sätze. Tippe sie der Reihe nach an.'
        : 'Tippe die Bilder der Reihe nach an.',
      hint: 'Was war ganz am Anfang?',
      solution: `Die Reihenfolge ist: ${ablauf.steps.join(', ')}.`,
      data: {
        images: ablauf.images,
        order,
        steps: ablauf.steps,
        texts: params.saetze
          ? ablauf.steps.map((s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}.`)
          : undefined,
      },
    }
  },

  component: ReihenfolgeTask,
}
