/**
 * D2/D3 "Satz lesen": the child reads a sentence and picks the matching picture
 * (`mode: 'waehlen'`) or decides whether one picture fits (`mode: 'stimmt'`).
 * Distractor pictures come from sentences of the same pattern, so the child has to read
 * every word: "Oma malt." against "Opa malt." and "Oma badet."
 */
import {
  baseSentences,
  readableSentences,
  sceneKey,
  sentenceTokens,
  type Sentence,
  type SentenceToken,
} from '@/core/saetze'
import { pickOne, shuffle, type Rng } from '@/core/random'
import { resolveWords } from '@/core/words'
import type { ExerciseModule } from '../../types'
import { itemId } from '../shared'
import SatzBildTask from './SatzBildTask.vue'

export interface SatzBildParams {
  mode: 'waehlen' | 'stimmt'
}

export interface SatzBildData {
  mode: 'waehlen' | 'stimmt'
  tokens: SentenceToken[]
  coloring: boolean
  arcs: boolean
  /** waehlen: the pictures to choose from. */
  choices: { key: string; scene: string[] }[]
  correctKey: string
  /** stimmt: the one picture shown. */
  scene: string[]
}

/** Sentences with readable words – at least this many before the exercise appears. */
export const MIN_SENTENCES = 4
export const CHOICES = 3

/** Shared words count: "Oma malt" is closer to "Opa malt" than to "Papa badet". */
function overlap(a: Sentence, b: Sentence): number {
  const words = new Set(a.text.toLowerCase().split(/\s+/))
  return b.text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => words.has(w)).length
}

/**
 * Pictures that look too much alike in OpenMoji to be told apart reliably (woman and
 * grandmother, man and grandfather) – never used against each other.
 */
export const LOOKALIKES: readonly (readonly string[])[] = [
  ['1F469', '1F475'],
  ['1F468', '1F474'],
]

/** Do the two pictures differ only in look-alike pictures? */
export function confusable(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  let differs = false
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue
    differs = true
    if (!LOOKALIKES.some((set) => set.includes(a[i]!) && set.includes(b[i]!))) return false
  }
  return differs
}

/** Other sentences of the group with a different picture, the most similar first. */
export function distractorSentences(
  target: Sentence,
  all: readonly Sentence[],
  count: number,
  rng: Rng,
): Sentence[] {
  const seen = new Set([sceneKey(target)])
  const candidates = shuffle(
    all.filter((s) => s.group === target.group && s.id !== target.id),
    rng,
  ).sort((a, b) => overlap(target, b) - overlap(target, a))
  const result: Sentence[] = []
  for (const s of candidates) {
    if (result.length >= count) break
    if (seen.has(sceneKey(s))) continue
    if ([target, ...result].some((r) => confusable(r.scene, s.scene))) continue
    seen.add(sceneKey(s))
    result.push(s)
  }
  return result
}

export const satzBild: ExerciseModule<SatzBildParams, SatzBildData> = {
  id: 'lesen.satz-bild',
  topic: 'lesen',

  items(ctx, params) {
    const sentences = readableSentences(ctx.land, ctx.grade, ctx.settings)
    if (sentences.length < MIN_SENTENCES) return []
    return sentences.map((s) => `lesen.satz-bild:${params.mode}:${s.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const id = itemId(itemKey).slice(params.mode.length + 1)
    // Distractor pictures may come from sentences the child cannot read yet.
    const group = baseSentences(ctx.grade)
    const sentence = group.find((s) => s.id === id)
    if (!sentence) throw new Error(`Unbekannter Satz: ${id}`)
    const words = resolveWords(ctx.land, ctx.grade)
    const others = distractorSentences(sentence, group, CHOICES - 1, rng)
    const base = {
      mode: params.mode,
      tokens: sentenceTokens(sentence, words),
      coloring: ctx.settings.syllableColoring,
      arcs: ctx.settings.syllableArcs,
    }
    if (params.mode === 'stimmt') {
      const fits = others.length === 0 || rng() < 0.5
      const shown = fits ? sentence : pickOne(others, rng)
      return {
        instruction: 'Lies den Satz. Passt das Bild dazu?',
        solution: fits ? 'Ja, das Bild passt.' : `Nein. Das Bild passt nicht zu: ${sentence.text}`,
        data: {
          ...base,
          choices: [
            { key: 'ja', scene: [] },
            { key: 'nein', scene: [] },
          ],
          correctKey: fits ? 'ja' : 'nein',
          scene: shown.scene,
        },
      }
    }
    return {
      instruction: 'Lies den Satz. Welches Bild passt?',
      solution: `Der Satz heißt: ${sentence.text}`,
      data: {
        ...base,
        choices: shuffle([sentence, ...others], rng).map((s) => ({ key: s.id, scene: s.scene })),
        correctKey: sentence.id,
        scene: sentence.scene,
      },
    }
  },

  component: SatzBildTask,
}
