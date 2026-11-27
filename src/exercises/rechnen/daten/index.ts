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
  mode: 'zaehlen' | 'meiste' | 'unterschied'
  /** Grade 2 (R2-15): also a bar chart or a table with numbers. */
  display?: 'striche' | 'balken' | 'tabelle'
}

export interface DatenData {
  display: 'striche' | 'balken' | 'tabelle'
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
    if (params.mode === 'unterschied')
      return ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => `rechnen.daten:unterschied:${k}`)
    if (params.mode === 'meiste')
      return ['a', 'b', 'c', 'd', 'e'].map((k) => `rechnen.daten:meiste:${k}`)
    return Array.from({ length: maxCount(ctx) - 2 }, (_, i) => `rechnen.daten:zaehlen:${i + 3}`)
  },

  generate(ctx, params, itemKey, rng) {
    const max = maxCount(ctx)
    const display = params.display ?? 'striche'
    const look = display === 'striche' ? 'Striche' : display === 'balken' ? 'Balken' : 'Zahlen'
    if (params.mode === 'unterschied') {
      let r = rows(rng, max)
      while (r[0]!.count === r[1]!.count) r = rows(rng, max)
      const [x, y] = r[0]!.count > r[1]!.count ? [r[0]!, r[1]!] : [r[1]!, r[0]!]
      const d = x.count - y.count
      const others = shuffle(
        [d + 1, d - 1, d + 2, x.count, y.count].filter(
          (v, i, all) => v > 0 && v !== d && all.indexOf(v) === i,
        ),
        rng,
      ).slice(0, 2)
      return {
        instruction: `Schau dir die ${look} an. Wie viele ${x.name} sind es mehr als ${y.name}?`,
        hint: `Zähle die ${x.name} und die ${y.name}. Dann rechne minus.`,
        solution: `${x.count} minus ${y.count} ist ${d}. Es sind ${d} ${x.name} mehr.`,
        data: {
          display,
          rows: r.map((z) => ({ key: z.id, image: z.image, count: z.count })),
          correctKey: String(d),
          choices: shuffle([d, ...others], rng).map((v) => ({ key: String(v), label: String(v) })),
        },
      }
    }
    if (params.mode === 'zaehlen') {
      const n = Number(itemKey.split(':')[2])
      const r = rows(rng, max, n)
      const asked = r[0]!
      const others = shuffle(
        [n - 1, n + 1, n - 5, n + 5, n - 2, n + 2].filter((v) => v > 0 && v <= max + 5 && v !== n),
        rng,
      ).slice(0, 2)
      return {
        instruction: `Schau dir die ${look} an. Wie viele ${asked.name} sind es?`,
        hint: 'Ein Bündel mit Querstrich sind fünf.',
        solution: `Es sind ${n} ${asked.name}.`,
        data: {
          display,
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
      instruction: `Schau dir die ${look} an. Wovon gibt es am meisten?`,
      hint: 'Welche Reihe hat die meisten Striche?',
      solution: `Am meisten gibt es ${most.name}: ${most.count}.`,
      data: {
        display,
        rows: r.map((x) => ({ key: x.id, image: x.image, count: x.count })),
        correctKey: most.id,
        choices: r.map((x) => ({ key: x.id, image: x.image })),
      },
    }
  },

  component: DatenTask,
}
