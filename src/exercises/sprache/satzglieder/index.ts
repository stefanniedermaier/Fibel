/**
 * SP3-8 "Umstellprobe, Subjekt und Prädikat" (Deutsch 3/4, 4.3): a sentence as blocks
 * (Satzglieder). Tap the subject ("Wer oder was?") or the predicate (the verb), or
 * pick the sentence that is correctly rearranged – the verb always stays second.
 */
import sprache3 from '@/data/basis/klasse-3/sprache.json'
import { pickOne, shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import SatzgliederTask from './SatzgliederTask.vue'

interface Satz {
  id: string
  glieder: string[]
  subjekt: number
  praedikat: number
}
export const SAETZE: readonly Satz[] = sprache3.satzglieder

export interface SatzgliederParams {
  mode: 'subjekt' | 'praedikat' | 'umstellen'
}

export interface SatzgliederData {
  mode: SatzgliederParams['mode']
  glieder: string[]
  /** subjekt/praedikat: index of the block; umstellen: key of the right sentence. */
  correctKey: string
  choices: { key: string; label: string }[]
}

const lowerFirst = (s: string) =>
  /^(Der|Die|Das|Meine|Mein|Unser|Am|Im)\b/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Builds a sentence with `first` in front and the verb second. */
export function umgestellt(s: Satz, first: number): string {
  const rest = s.glieder.filter((_, i) => i !== first && i !== s.praedikat)
  const g = [s.glieder[first]!, s.glieder[s.praedikat]!, ...rest]
  return `${upperFirst(g[0]!)} ${g.slice(1).map(lowerFirst).join(' ')}.`
}

export const satzglieder: ExerciseModule<SatzgliederParams, SatzgliederData> = {
  id: 'sprache.satzglieder',
  topic: 'sprache',

  items(_ctx, params) {
    return SAETZE.map((s) => `sprache.satzglieder:${params.mode}:${s.id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const s = SAETZE.find((x) => x.id === itemKey.split(':')[2])!
    const blocks = s.glieder.map((g, i) => ({ key: String(i), label: g }))
    if (params.mode === 'subjekt' || params.mode === 'praedikat') {
      const subj = params.mode === 'subjekt'
      const idx = subj ? s.subjekt : s.praedikat
      return {
        instruction: subj
          ? 'Tippe auf das Subjekt. Frag: Wer oder was?'
          : 'Tippe auf das Prädikat. Das ist das Verb.',
        caption: subj
          ? 'Wer oder was? Tippe auf das Subjekt.'
          : 'Was tut jemand? Tippe auf das Prädikat.',
        hint: subj
          ? `Frag: Wer oder was ${s.glieder[s.praedikat]}?`
          : 'Das Prädikat steht im Aussagesatz an zweiter Stelle.',
        solution: `${subj ? 'Das Subjekt' : 'Das Prädikat'} ist: ${s.glieder[idx]}.`,
        data: { mode: params.mode, glieder: s.glieder, correctKey: String(idx), choices: blocks },
      }
    }
    // Umstellen: another block in front, the verb second. Wrong: verb at the end or third.
    const fronts = s.glieder.map((_, i) => i).filter((i) => i !== s.praedikat && i !== 0)
    const first = pickOne(fronts, rng)
    const right = umgestellt(s, first)
    const order = [
      first,
      ...s.glieder.map((_, i) => i).filter((i) => i !== first && i !== s.praedikat),
    ]
    const verbLast = `${upperFirst(s.glieder[order[0]!]!)} ${order
      .slice(1)
      .map((i) => lowerFirst(s.glieder[i]!))
      .join(' ')} ${s.glieder[s.praedikat]}.`
    const verbThird =
      `${upperFirst(s.glieder[order[0]!]!)} ${lowerFirst(s.glieder[order[1]!]!)} ${s.glieder[s.praedikat]} ${order
        .slice(2)
        .map((i) => lowerFirst(s.glieder[i]!))
        .join(' ')}.`.replace(/ \./, '.')
    return {
      instruction: 'Stell den Satz um. Welcher Satz ist richtig?',
      hint: 'Das Verb bleibt an der zweiten Stelle.',
      solution: `Richtig ist: ${right}`,
      data: {
        mode: 'umstellen',
        glieder: s.glieder,
        correctKey: right,
        choices: shuffle([...new Set([right, verbLast, verbThird])], rng).map((t) => ({
          key: t,
          label: t,
        })),
      },
    }
  },

  component: SatzgliederTask,
}
