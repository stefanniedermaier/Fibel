/**
 * F3-6 "Bandornamente" (Mathematik 3/4, 2.4): a motif repeats along a band – shifted,
 * mirrored or turned. The child picks the motif that comes next.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import OrnamentTask from './OrnamentTask.vue'

/** How a motif is drawn: unchanged, mirrored left-right, mirrored up-down, turned. */
export type Lage = 'normal' | 'spiegel-x' | 'spiegel-y' | 'gedreht'
export const LAGEN: readonly Lage[] = ['normal', 'spiegel-x', 'spiegel-y', 'gedreht']

/** Rules: the positions of the band in turn. */
export const REGELN: Record<string, { lagen: Lage[]; text: string }> = {
  schieben: { lagen: ['normal'], text: 'Das Muster wird immer nur weitergeschoben.' },
  spiegeln: { lagen: ['normal', 'spiegel-x'], text: 'Das Muster wird abwechselnd gespiegelt.' },
  kippen: {
    lagen: ['normal', 'spiegel-y'],
    text: 'Das Muster wird abwechselnd nach unten geklappt.',
  },
  drehen: { lagen: ['normal', 'gedreht'], text: 'Das Muster wird abwechselnd halb gedreht.' },
  vier: {
    lagen: ['normal', 'spiegel-x', 'gedreht', 'spiegel-y'],
    text: 'Vier Lagen wiederholen sich: normal, gespiegelt, gedreht, geklappt.',
  },
}

/** Motifs without any symmetry, so all four positions look different (40 × 40). */
export const MOTIVE: Record<string, { d: string; color: string }> = {
  fahne: { d: 'M8 36V4h22l-6 7 6 7H14v18z', color: '#EA5A47' },
  haken: { d: 'M6 6h12v18h16v10H6z', color: '#61B2E4' },
  blitz: { d: 'M22 2L8 22h10l-6 16 22-24H22l6-12z', color: '#F1B31C' },
  welle: {
    d: 'M4 30c0-14 8-24 18-24c6 0 10 4 10 10c0 4-3 6-6 6c-3 0-5-2-5-5h-7c0 8 5 13 12 13v4H4z',
    color: '#B1CC33',
  },
}

export interface OrnamentParams {
  regeln?: string[]
}

export interface OrnamentData {
  motiv: { d: string; color: string }
  /** The band; the last position is the gap. */
  band: Lage[]
  correctKey: Lage
  choices: { key: Lage }[]
}

const SICHTBAR = 5

export const ornament: ExerciseModule<OrnamentParams, OrnamentData> = {
  id: 'formen.ornament',
  topic: 'formen',

  items(_ctx, params) {
    const regeln = params.regeln ?? Object.keys(REGELN)
    return regeln.flatMap((r) => Object.keys(MOTIVE).map((m) => `formen.ornament:${r}-${m}`))
  },

  generate(_ctx, _params, itemKey, rng) {
    const [regel, motiv] = itemKey.split(':')[1]!.split('-') as [string, string]
    const { lagen, text } = REGELN[regel]!
    const band = Array.from({ length: SICHTBAR + 1 }, (_, i) => lagen[i % lagen.length]!)
    const right = band[SICHTBAR]!
    const wrong = shuffle(
      LAGEN.filter((l) => l !== right),
      rng,
    ).slice(0, 2)
    return {
      instruction: 'Wie geht das Bandornament weiter? Tippe auf das passende Muster.',
      hint: 'Schau genau: Wird das Muster verschoben, gespiegelt oder gedreht?',
      solution: text,
      data: {
        motiv: MOTIVE[motiv]!,
        band: band.slice(0, SICHTBAR),
        correctKey: right,
        choices: shuffle([right, ...wrong], rng).map((key) => ({ key })),
      },
    }
  },

  component: OrnamentTask,
}
