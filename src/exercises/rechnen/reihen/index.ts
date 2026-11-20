/**
 * E5 "Reihen erkennen und fortsetzen" – patterns and number sequences
 * ("Muster und Strukturen" in the LehrplanPLUS Mathematik 1/2).
 *
 * Level 1: AB with shapes · 2: AAB, ABB, ABC · 3: picture patterns (gap also in
 * the middle) · 4: number sequences +1, +2, −1 · 5: bigger steps up to 20.
 * The next level opens when 80 % of the current one sit solidly (box ≥ 3).
 */
import reihenBilder from '@/data/common/reihen-bilder.json'
import { numberWord } from '@/core/numbers'
import { randomInt, shuffle, type Rng } from '@/core/random'
import type { ProgressRecord } from '@/core/types'
import type { ExerciseModule, LearnerContext } from '../../types'
import { itemPart } from '../shared'
import ReihenTask from './ReihenTask.vue'

export type Shape = 'kreis' | 'quadrat' | 'dreieck' | 'stern' | 'raute'

/** Each shape has its own colour, so the patterns work without telling colours apart. */
export const SHAPES: { shape: Shape; color: string; name: string }[] = [
  { shape: 'kreis', color: '#d4351c', name: 'roter Kreis' },
  { shape: 'quadrat', color: '#1d70b8', name: 'blaues Viereck' },
  { shape: 'dreieck', color: '#ffb703', name: 'gelbes Dreieck' },
  { shape: 'stern', color: '#2a9d4b', name: 'grüner Stern' },
  { shape: 'raute', color: '#7b4fa0', name: 'lila Raute' },
]

/** Pictures for level 3 – clearly different, easy to name (src/data/common/reihen-bilder.json). */
export const PICTURES: { image: string; name: string }[] = reihenBilder

export type Token =
  | { kind: 'form'; key: string; shape: Shape; color: string; name: string }
  | { kind: 'bild'; key: string; image: string; name: string }
  | { kind: 'zahl'; key: string; value: number; name: string }

export interface ReihenData {
  tokens: Token[]
  /** Index of the missing element. */
  gap: number
  choices: { key: string; token: Token }[]
  correctKey: string
}

/** Item keys per level: "<level>-<pattern>". */
export const LEVEL_ITEMS: Record<number, string[]> = {
  1: ['1-AB'],
  2: ['2-AAB', '2-ABB', '2-ABC'],
  3: ['3-AB', '3-AAB', '3-ABB', '3-ABC', '3-AABB'],
  4: ['4-+1', '4-+2', '4--1'],
  5: ['5-+3', '5-+4', '5-+5', '5--2', '5--3'],
}
export const LEVELS = Object.keys(LEVEL_ITEMS).map(Number)
export const LEVEL_KEY = 'rechnen.reihen'
const MASTERY_SHARE = 0.8
const MASTERY_BOX = 3
const MAX = 20

const itemKeyOf = (part: string) => `rechnen.reihen:${part}`

/** Current level: set by hand, or the lowest level not yet mastered. */
export function reihenLevel(
  levels: Record<string, number>,
  progress: ReadonlyMap<string, ProgressRecord>,
): number {
  const manual = levels[LEVEL_KEY]
  if (manual !== undefined && LEVELS.includes(manual)) return manual
  for (const level of LEVELS.slice(0, -1)) {
    const items = LEVEL_ITEMS[level]!
    const solid = items.filter((p) => (progress.get(itemKeyOf(p))?.box ?? 0) >= MASTERY_BOX)
    if (solid.length / items.length < MASTERY_SHARE) return level
  }
  return LEVELS.at(-1)!
}

const shapeToken = (i: number): Token => {
  const s = SHAPES[i]!
  return { kind: 'form', key: `form:${s.shape}`, shape: s.shape, color: s.color, name: s.name }
}
const pictureToken = (i: number): Token => {
  const p = PICTURES[i]!
  return { kind: 'bild', key: `bild:${p.image}`, image: p.image, name: p.name }
}
const numberToken = (value: number): Token => ({
  kind: 'zahl',
  key: `zahl:${value}`,
  value,
  name: numberWord(value),
})

/** Repeats a pattern unit ("AAB") to a sequence of at least `min` letters. */
export function expand(unit: string, min: number): string[] {
  const result: string[] = []
  while (result.length < min) result.push(...unit)
  return result
}

function patternTask(level: number, unit: string, rng: Rng): ReihenData {
  const letters = [...new Set(unit)]
  const usePictures = level >= 3
  const pool = usePictures ? PICTURES.length : SHAPES.length
  const chosen = shuffle(
    Array.from({ length: pool }, (_, i) => i),
    rng,
  )
  const make = usePictures ? pictureToken : shapeToken
  const byLetter = new Map(letters.map((l, i) => [l, make(chosen[i]!)]))
  // Two full repeats plus the start of a third – enough to see the rule.
  const sequence = expand(unit, unit.length * 2 + 1)
    .slice(0, unit.length * 2 + 1)
    .map((l) => byLetter.get(l)!)
  // From level 3 the gap may also be in the middle (after the first repeat).
  const gap =
    level >= 3 && randomInt(rng, 0, 1) === 0
      ? randomInt(rng, unit.length, sequence.length - 2)
      : sequence.length - 1
  const correct = sequence[gap]!
  // Choices: the pattern's own elements plus one that does not belong to it.
  const extra = make(chosen[letters.length]!)
  const choices = shuffle(
    [...new Map([...byLetter.values(), extra].map((t) => [t.key, t])).values()],
    rng,
  ).slice(0, 3)
  if (!choices.some((c) => c.key === correct.key)) choices[0] = correct
  return {
    tokens: sequence,
    gap,
    choices: shuffle(choices, rng).map((token) => ({ key: token.key, token })),
    correctKey: correct.key,
  }
}

function numberTask(step: number, rng: Rng): ReihenData {
  const LENGTH = 5
  // Start so that every number stays within 0–20.
  const span = step * (LENGTH - 1)
  const start = step > 0 ? randomInt(rng, 0, MAX - span) : randomInt(rng, -span, MAX)
  const values = Array.from({ length: LENGTH }, (_, i) => start + i * step)
  const gap = LENGTH - 1
  const answer = values[gap]!
  const near = [
    answer + 1,
    answer - 1,
    answer + step,
    answer - step,
    answer + 2,
    answer - 2,
  ].filter((n) => n >= 0 && n <= MAX && n !== answer)
  const distractors = shuffle([...new Set(near)], rng).slice(0, 2)
  return {
    tokens: values.map(numberToken),
    gap,
    choices: shuffle([answer, ...distractors], rng).map((n) => ({
      key: `zahl:${n}`,
      token: numberToken(n),
    })),
    correctKey: `zahl:${answer}`,
  }
}

const spokenSequence = (data: ReihenData) =>
  data.tokens.map((t, i) => (i === data.gap ? '…' : t.name)).join(', ')

export interface ReihenParams {
  /** Highest level offered (default: all). */
  maxLevel?: number
}

function itemsFor(ctx: LearnerContext, params: ReihenParams): string[] {
  const level = Math.min(
    reihenLevel(ctx.settings.levels, ctx.progress ?? new Map()),
    params.maxLevel ?? LEVELS.at(-1)!,
  )
  return LEVELS.filter((l) => l <= level).flatMap((l) => LEVEL_ITEMS[l]!)
}

export const reihen: ExerciseModule<ReihenParams, ReihenData> = {
  id: 'rechnen.reihen',
  topic: 'rechnen',

  items(ctx, params) {
    return itemsFor(ctx, params).map(itemKeyOf)
  },

  generate(_ctx, _params, itemKey, rng) {
    const part = itemPart(itemKey)
    const [levelText, rule] = [part.slice(0, part.indexOf('-')), part.slice(part.indexOf('-') + 1)]
    const level = Number(levelText)
    const isNumber = level >= 4
    const data = isNumber ? numberTask(Number(rule), rng) : patternTask(level, rule, rng)
    const atEnd = data.gap === data.tokens.length - 1
    const answer = data.tokens[data.gap]!
    const step = Number(rule)
    return {
      instruction: isNumber
        ? `Wie geht die Reihe weiter? ${spokenSequence(data)}`
        : atEnd
          ? 'Schau dir das Muster an. Was kommt als Nächstes?'
          : 'Schau dir das Muster an. Was fehlt in der Lücke?',
      caption: isNumber
        ? 'Wie geht die Reihe weiter?'
        : atEnd
          ? 'Was kommt als Nächstes?'
          : 'Was fehlt?',
      hint: isNumber
        ? 'Schau, wie viel von Zahl zu Zahl dazukommt.'
        : 'Sprich das Muster leise mit.',
      solution: isNumber
        ? `Es geht immer ${numberWord(Math.abs(step))} ${step > 0 ? 'weiter' : 'zurück'}. Die Lösung ist ${answer.name}.`
        : `${capitalize(answer.name)} passt in die Lücke.`,
      data,
    }
  },

  component: ReihenTask,
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
