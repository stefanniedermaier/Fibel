/**
 * M9 "Lagebegriffe" (Mathematik 1/2, 2.1): links/rechts, über/unter, neben, zwischen.
 * `kreuz`: four animals around a tree or house – "Tippe das Tier links vom Baum."
 * `reihe`: animals in a row – "Wer ist zwischen dem Hasen und der Maus?"
 * Left and right are meant as seen by the child (on the screen).
 */
import lage from '@/data/common/lage.json'
import { pickOne, shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import LageTask from './LageTask.vue'

export type Relation =
  'links' | 'rechts' | 'ueber' | 'unter' | 'zwischen' | 'links-neben' | 'rechts-neben'

export interface LageParams {
  mode: 'kreuz' | 'reihe'
}

export interface LageData {
  mode: 'kreuz' | 'reihe'
  centre?: string
  /** kreuz: image per place; reihe: images from left to right. */
  places: { key: string; image: string; place: string }[]
  correctKey: string
}

const KREUZ: Relation[] = ['links', 'rechts', 'ueber', 'unter']
const REIHE: Relation[] = ['zwischen', 'links-neben', 'rechts-neben']

export const lageBegriffe: ExerciseModule<LageParams, LageData> = {
  id: 'formen.lage',
  topic: 'rechnen',

  items(_ctx, params) {
    return (params.mode === 'kreuz' ? KREUZ : REIHE).map((r) => `formen.lage:${params.mode}:${r}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const relation = itemKey.split(':')[2] as Relation
    if (params.mode === 'kreuz') {
      const centre = pickOne(lage.mitte, rng)
      const animals = shuffle(lage.tiere, rng).slice(0, 4)
      const places = KREUZ.map((place, i) => ({ key: place, image: animals[i]!.image, place }))
      const target = animals[KREUZ.indexOf(relation)]!
      const where = {
        links: `links ${centre.von}`,
        rechts: `rechts ${centre.von}`,
        ueber: `über ${centre.dem}`,
        unter: `unter ${centre.dem}`,
      }[relation as 'links' | 'rechts' | 'ueber' | 'unter']
      return {
        instruction: `Tippe auf das Tier ${where}.`,
        hint:
          relation === 'links' || relation === 'rechts'
            ? 'Streck Daumen und Zeigefinger aus: Die linke Hand macht ein L.'
            : undefined,
        solution: `${target.name.charAt(0).toUpperCase()}${target.name.slice(1)} ist ${where}.`,
        data: { mode: 'kreuz', centre: centre.image, places, correctKey: relation },
      }
    }
    const animals = shuffle(lage.tiere, rng).slice(0, 4)
    const places = animals.map((a, i) => ({ key: String(i), image: a.image, place: String(i) }))
    let answer: number
    let instruction: string
    if (relation === 'zwischen') {
      answer = 1 + Math.floor(rng() * 2)
      instruction = `Wer ist zwischen ${animals[answer - 1]!.dem} und ${animals[answer + 1]!.dem}?`
    } else if (relation === 'links-neben') {
      const ref = 1 + Math.floor(rng() * 3)
      answer = ref - 1
      instruction = `Wer ist links neben ${animals[ref]!.dem}?`
    } else {
      const ref = Math.floor(rng() * 3)
      answer = ref + 1
      instruction = `Wer ist rechts neben ${animals[ref]!.dem}?`
    }
    const name = animals[answer]!.name
    return {
      instruction,
      solution: `Das ist ${name}.`,
      data: { mode: 'reihe', places, correctKey: String(answer) },
    }
  },

  component: LageTask,
}
