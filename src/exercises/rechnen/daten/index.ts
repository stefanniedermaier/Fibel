/**
 * M15 "Strichliste" (Mathematik 1/2, 4.1 "entnehmen Daten aus … Strichlisten"):
 * three rows with a picture and tally marks. "Wie viele Äpfel sind es?" or
 * "Wovon gibt es am meisten?". Collecting data stays in class.
 */
import { shuffle, type Rng } from '@/core/random'
import type { ExerciseModule, LearnerContext } from '../../types'
import DatenTask from './DatenTask.vue'

export const SORTEN = [
  { id: 'apfel', image: '1F34E', name: 'Äpfel', wen: 'Äpfel' },
  { id: 'birne', image: '1F350', name: 'Birnen', wen: 'Birnen' },
  { id: 'banane', image: '1F34C', name: 'Bananen', wen: 'Bananen' },
  { id: 'erdbeere', image: '1F353', name: 'Erdbeeren', wen: 'Erdbeeren' },
  { id: 'katze', image: '1F408', name: 'Katzen', wen: 'Katzen' },
  { id: 'hund', image: '1F415', name: 'Hunde', wen: 'Hunde' },
  { id: 'auto', image: '1F697', name: 'Autos', wen: 'Autos' },
  { id: 'fahrrad', image: '1F6B2', name: 'Fahrräder', wen: 'Fahrräder' },
] as const

export interface DatenParams {
  mode: 'zaehlen' | 'meiste'
}

export interface DatenData {
  rows: { key: string; image: string; count: number }[]
  /** The row asked about ("zaehlen"), highlighted. */
  asked?: string
  correctKey: string
  choices: { key: string; image?: string; label?: string }[]
}

const maxCount = (ctx: LearnerContext) => (ctx.settings.numberRange >= 20 ? 15 : 10)

function rows(rng: Rng, max: number, count?: number) {
  const sorts = shuffle([...SORTEN], rng).slice(0, 3)
  return sorts.map((s, i) => ({
    ...s,
    count: i === 0 && count ? count : 1 + Math.floor(rng() * max),
  }))
}

export const daten: ExerciseModule<DatenParams, DatenData> = {
  id: 'rechnen.daten',
  topic: 'rechnen',

  items(ctx, params) {
    if (params.mode === 'meiste')
      return ['a', 'b', 'c', 'd', 'e'].map((k) => `rechnen.daten:meiste:${k}`)
    return Array.from({ length: maxCount(ctx) - 2 }, (_, i) => `rechnen.daten:zaehlen:${i + 3}`)
  },

  generate(ctx, params, itemKey, rng) {
    const max = maxCount(ctx)
    if (params.mode === 'zaehlen') {
      const n = Number(itemKey.split(':')[2])
      const r = rows(rng, max, n)
      const asked = r[0]!
      const others = shuffle(
        [n - 1, n + 1, n - 5, n + 5, n - 2, n + 2].filter((v) => v > 0 && v <= max + 5 && v !== n),
        rng,
      ).slice(0, 2)
      return {
        instruction: `Zähl die Striche. Wie viele ${asked.name} sind es?`,
        hint: 'Ein Bündel mit Querstrich sind fünf.',
        solution: `Es sind ${n} ${asked.name}.`,
        data: {
          rows: shuffle(r, rng).map((x) => ({ key: x.id, image: x.image, count: x.count })),
          asked: asked.id,
          correctKey: String(n),
          choices: shuffle([n, ...others], rng).map((v) => ({ key: String(v), label: String(v) })),
        },
      }
    }
    let r = rows(rng, max)
    // Exactly one row with the most marks.
    while (r.filter((x) => x.count === Math.max(...r.map((y) => y.count))).length > 1)
      r = rows(rng, max)
    const most = r.reduce((a, b) => (b.count > a.count ? b : a))
    return {
      instruction: 'Schau dir die Strichliste an. Wovon gibt es am meisten?',
      hint: 'Welche Reihe hat die meisten Striche?',
      solution: `Am meisten gibt es ${most.name}: ${most.count}.`,
      data: {
        rows: r.map((x) => ({ key: x.id, image: x.image, count: x.count })),
        correctKey: most.id,
        choices: r.map((x) => ({ key: x.id, image: x.image })),
      },
    }
  },

  component: DatenTask,
}
