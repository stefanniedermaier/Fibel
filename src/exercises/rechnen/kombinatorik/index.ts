/**
 * R2-14 "Kombinieren" (Mathematik 1/2, 1.3; optional): 2 T-shirts and 3 trousers – how
 * many ways to dress? Every T-shirt goes with every pair of trousers: 2 · 3.
 */
import { numberWord } from '@/core/numbers'
import { pickOne, shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import KombinatorikTask from './KombinatorikTask.vue'

export const THEMEN = [
  {
    a: { image: '1F455', name: 'T-Shirts' },
    b: { image: '1F456', name: 'Hosen' },
    frage: 'Wie viele Möglichkeiten gibt es, sich anzuziehen?',
  },
  {
    a: { image: '1F366', name: 'Eissorten' },
    b: { image: '1F95B', name: 'Becher' },
    frage: 'Wie viele verschiedene Eisbecher kann man machen?',
  },
  {
    a: { image: '1F9E2', name: 'Mützen' },
    b: { image: '1F9E3', name: 'Schals' },
    frage: 'Wie viele Möglichkeiten gibt es, Mütze und Schal zu tragen?',
  },
] as const

/** Colours by turning the hue of the picture. */
export const HUES = [0, 120, 220, 300]

export interface KombinatorikData {
  a: { image: string; count: number }
  b: { image: string; count: number }
  correctKey: string
  choices: { key: string; label: string }[]
}

export const kombinatorik: ExerciseModule<Record<string, never>, KombinatorikData> = {
  id: 'rechnen.kombinatorik',
  topic: 'rechnen',

  items() {
    const keys: string[] = []
    for (let a = 2; a <= 4; a++)
      for (let b = 2; b <= 3; b++) keys.push(`rechnen.kombinatorik:${a}-${b}`)
    return keys
  },

  generate(_ctx, _params, itemKey, rng) {
    const [a, b] = itemKey.split(':')[1]!.split('-').map(Number) as [number, number]
    const t = pickOne(THEMEN, rng)
    const n = a * b
    const wrong = [a + b, n + 1, n - 1].filter((x, i, all) => x !== n && all.indexOf(x) === i)
    return {
      instruction: `Es gibt ${numberWord(a)} ${t.a.name} und ${numberWord(b)} ${t.b.name}. ${t.frage}`,
      caption: t.frage,
      hint: `Nimm das erste ${t.a.name.replace(/s$/, '')}: Wie oft kannst du es kombinieren? Und dann das nächste.`,
      solution: `Jedes passt zu jedem: ${numberWord(a)} mal ${numberWord(b)} sind ${numberWord(n)} Möglichkeiten.`,
      data: {
        a: { image: t.a.image, count: a },
        b: { image: t.b.image, count: b },
        correctKey: String(n),
        choices: shuffle([n, ...wrong.slice(0, 2)], rng).map((x) => ({
          key: String(x),
          label: String(x),
        })),
      },
    }
  },

  component: KombinatorikTask,
}
