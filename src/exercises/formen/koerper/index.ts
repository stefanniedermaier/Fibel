/**
 * F2-3 "Körper" (Mathematik 1/2, 2.2: Würfel, Quader, Kugel, Zylinder, Kegel, Pyramide;
 * Ecken, Kanten, Flächen; "rollt oder kippt"). Own pictures of the solids.
 */
import daten from '@/data/basis/klasse-2/koerper.json'
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import SacheTask from '@/exercises/sache/SacheTask.vue'
import type { SacheData } from '@/exercises/sache/shared'
import type { ExerciseModule } from '../../types'

export interface Koerper {
  id: string
  name: string
  wen: string
  image: string
  rollt: boolean
  ecken?: number
  kanten?: number
  flaechen?: number
}

export const KOERPER: readonly Koerper[] = daten.koerper
export const DINGE: readonly { id: string; text: string; image: string; koerper: string }[] =
  daten.dinge

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** "der Würfel" → "ein Würfel", "die Kugel" → "eine Kugel". */
const indef = (name: string) => name.replace(/^der /, 'ein ').replace(/^die /, 'eine ')

export interface KoerperParams {
  mode: 'name' | 'rollt' | 'ding' | 'ecken'
}

export const koerper: ExerciseModule<KoerperParams, SacheData> = {
  id: 'formen.koerper',
  topic: 'formen',

  items(_ctx, params) {
    if (params.mode === 'ding') return DINGE.map((d) => `formen.koerper:ding:${d.id}`)
    const list = params.mode === 'ecken' ? KOERPER.filter((k) => k.ecken) : KOERPER
    return list.map((k) => `formen.koerper:${params.mode}:${k.id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const id = itemKey.split(':')[2]!
    if (params.mode === 'ding') {
      const d = DINGE.find((x) => x.id === id)!
      const right = KOERPER.find((k) => k.id === d.koerper)!
      const others = shuffle(
        KOERPER.filter((k) => k.id !== right.id),
        rng,
      ).slice(0, 2)
      return {
        instruction: `Welche Form hat ${d.text}?`,
        hint: 'Kann es rollen? Hat es Ecken?',
        solution: `${cap(d.text)} sieht aus wie ${indef(right.name)}.`,
        afterword: `${cap(d.text)}: ${right.name}.`,
        data: {
          prompt: d.image,
          correctKey: right.id,
          choices: shuffle([right, ...others], rng).map((k) => ({ key: k.id, image: k.image })),
        },
      }
    }
    const k = KOERPER.find((x) => x.id === id)!
    if (params.mode === 'name') {
      const others = shuffle(
        KOERPER.filter((x) => x.id !== k.id),
        rng,
      ).slice(0, 3)
      return {
        instruction: `Tippe auf ${k.wen}.`,
        caption: 'Hör gut zu und tippe auf den Körper.',
        solution: `Das ist ${k.name}.`,
        data: {
          correctKey: k.id,
          choices: shuffle([k, ...others], rng).map((x) => ({ key: x.id, image: x.image })),
        },
      }
    }
    if (params.mode === 'rollt') {
      const pronoun = k.name.startsWith('die') ? 'sie' : 'er'
      return {
        instruction: `Kann ${k.name} rollen, oder kippt ${pronoun} nur?`,
        caption: 'Rollt der Körper oder kippt er?',
        hint: 'Hat der Körper eine runde Fläche?',
        solution: k.rollt
          ? `${cap(k.name)} kann rollen.`
          : `${cap(k.name)} kann nicht rollen, ${pronoun} kippt nur.`,
        data: {
          prompt: k.image,
          correctKey: k.rollt ? 'rollt' : 'kippt',
          choices: [
            { key: 'rollt', image: '26BD', label: 'rollt' },
            { key: 'kippt', image: '1F4E6', label: 'kippt' },
          ],
        },
      }
    }
    const n = k.ecken!
    const wrong = shuffle(
      [n - 2, n + 2, n - 1, n + 4].filter((x) => x > 0),
      rng,
    ).slice(0, 2)
    return {
      instruction: `Wie viele Ecken hat ${k.name}?`,
      hint: 'Zähle auch die Ecken hinten, die man nicht sieht.',
      solution: `${cap(k.name)} hat ${numberWord(n)} Ecken, ${numberWord(k.kanten!)} Kanten und ${numberWord(k.flaechen!)} Flächen.`,
      data: {
        prompt: k.image,
        correctKey: String(n),
        choices: shuffle([n, ...wrong], rng).map((x) => ({ key: String(x), label: String(x) })),
      },
    }
  },

  component: SacheTask,
}
