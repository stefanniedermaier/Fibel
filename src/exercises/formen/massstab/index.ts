/**
 * F4-1 and F4-2 "Maßstab" (Mathematik 3/4, 2.1 and 2.3: "vergrößern und verkleinern
 * Figuren im Gitternetz", "Lagepläne"):
 * - `vergroessern`: a figure on squared paper → which one is twice as big (2 : 1)?
 * - `verkleinern`: which one is half as big (1 : 2)?
 * - `plan`: 1 cm on the plan is 100 m in reality – how long is the way?
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import MassstabTask from './MassstabTask.vue'
import { textChoices } from '../../choices'

/** A figure as rows of '#' on squared paper. */
export type Figur = string[]

export const FIGUREN: Record<string, Figur> = {
  l: ['#.', '#.', '##'],
  t: ['###', '.#.'],
  z: ['##.', '.##'],
  stufe: ['#..', '##.', '###'],
  u: ['#.#', '###'],
  kreuz: ['.#.', '###', '.#.'],
  haken: ['##', '#.', '#.'],
  pfeil: ['.#', '##', '.#'],
}

/** Every square becomes fx · fy squares. */
export function skalieren(f: Figur, fx: number, fy = fx): Figur {
  return f.flatMap((row) => {
    const wide = [...row].map((c) => c.repeat(fx)).join('')
    return Array.from({ length: fy }, () => wide)
  })
}

export interface Plan {
  id: string
  massstab: string
  frage: string
  richtig: string
  falsch: string[]
  hilfe: string
}

export const PLAENE: Plan[] = [
  {
    id: 'schulweg',
    massstab: '1 cm ≙ 100 m',
    frage: 'Im Plan ist der Schulweg 7 cm lang. Wie lang ist er in Wirklichkeit?',
    richtig: '700 m',
    falsch: ['70 m', '7 km'],
    hilfe: 'Jeder Zentimeter im Plan sind 100 Meter.',
  },
  {
    id: 'park',
    massstab: '1 cm ≙ 50 m',
    frage: 'Der Weg durch den Park ist im Plan 6 cm lang. Wie lang ist er wirklich?',
    richtig: '300 m',
    falsch: ['56 m', '600 m'],
    hilfe: 'Sechsmal 50 Meter.',
  },
  {
    id: 'zimmer',
    massstab: '1 cm ≙ 1 m',
    frage: 'Das Zimmer ist im Plan 4 cm lang und 3 cm breit. Wie lang ist es wirklich?',
    richtig: '4 m',
    falsch: ['40 cm', '3 m'],
    hilfe: 'Jeder Zentimeter im Plan ist ein Meter.',
  },
  {
    id: 'karte',
    massstab: '1 cm ≙ 1 km',
    frage:
      'Auf der Karte sind die beiden Dörfer 5 cm voneinander entfernt. Wie weit ist es wirklich?',
    richtig: '5 km',
    falsch: ['500 m', '50 km'],
    hilfe: 'Jeder Zentimeter auf der Karte ist ein Kilometer.',
  },
  {
    id: 'zurueck',
    massstab: '1 cm ≙ 100 m',
    frage: 'Der Spielplatz ist in Wirklichkeit 400 m entfernt. Wie lang ist der Weg im Plan?',
    richtig: '4 cm',
    falsch: ['40 cm', '400 cm'],
    hilfe: 'Wie oft passen 100 Meter in 400 Meter?',
  },
  {
    id: 'doppelt',
    massstab: '2 : 1',
    frage:
      'Ein Käfer ist 2 cm lang. Im Bild ist er doppelt so groß gezeichnet. Wie lang ist er im Bild?',
    richtig: '4 cm',
    falsch: ['1 cm', '2 cm'],
    hilfe: '2 : 1 heißt: im Bild doppelt so groß wie in Wirklichkeit.',
  },
  {
    id: 'halb',
    massstab: '1 : 2',
    frage: 'Ein Tisch ist 80 cm breit. Im Modell ist er halb so groß. Wie breit ist er im Modell?',
    richtig: '40 cm',
    falsch: ['160 cm', '20 cm'],
    hilfe: '1 : 2 heißt: im Modell halb so groß.',
  },
]

export interface MassstabParams {
  mode: 'vergroessern' | 'verkleinern' | 'plan'
}

export interface MassstabData {
  mode: MassstabParams['mode']
  figur?: Figur
  prompt?: string
  correctKey: string
  choices: { key: string; figur?: Figur; label?: string }[]
}

export const massstab: ExerciseModule<MassstabParams, MassstabData> = {
  id: 'formen.massstab',
  topic: 'formen',

  items(_ctx, params) {
    if (params.mode === 'plan') return PLAENE.map((p) => `formen.massstab:plan:${p.id}`)
    return Object.keys(FIGUREN).map((id) => `formen.massstab:${params.mode}:${id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const id = itemKey.split(':')[2]!
    if (params.mode === 'plan') {
      const p = PLAENE.find((x) => x.id === id)!
      return {
        instruction: `Der Maßstab ist ${p.massstab.replace('≙', 'entspricht')}. ${p.frage}`,
        caption: p.frage,
        hint: p.hilfe,
        solution: `Richtig ist ${p.richtig}. ${p.hilfe}`,
        data: {
          mode: 'plan',
          prompt: p.massstab,
          correctKey: p.richtig,
          choices: textChoices([p.richtig, ...p.falsch], rng),
        },
      }
    }
    const small = FIGUREN[id]!
    const big = skalieren(small, 2)
    const gross = params.mode === 'vergroessern'
    const shown = gross ? small : big
    const right = gross ? big : small
    const wrong = gross
      ? [skalieren(small, 2, 1), skalieren(small, 3)]
      : [skalieren(small, 1, 2), skalieren(small, 2, 1)]
    return {
      instruction: gross
        ? 'Welche Figur ist doppelt so groß? Jedes Kästchen wird zu zwei mal zwei Kästchen.'
        : 'Welche Figur ist halb so groß? Zwei mal zwei Kästchen werden zu einem Kästchen.',
      caption: gross
        ? 'Vergrößern 2 : 1: Welche Figur passt?'
        : 'Verkleinern 1 : 2: Welche Figur passt?',
      hint: 'Zähle die Kästchen in der Breite und in der Höhe.',
      solution: gross
        ? 'Diese Figur ist doppelt so breit und doppelt so hoch.'
        : 'Diese Figur ist halb so breit und halb so hoch.',
      data: {
        mode: params.mode,
        figur: shown,
        correctKey: 'r',
        choices: shuffle(
          [
            { key: 'r', figur: right },
            { key: 'w0', figur: wrong[0]! },
            { key: 'w1', figur: wrong[1]! },
          ],
          rng,
        ),
      },
    }
  },

  component: MassstabTask,
}
