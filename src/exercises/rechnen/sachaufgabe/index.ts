/**
 * M6 "Rechengeschichten": a short story with a picture is read aloud (Mathematik 1/2,
 * 1.2 and 1.3). First the child picks the matching calculation, then works it out.
 * Numbers stay in the number range of the profile (10 or 20), never below 2, so the
 * story can always use the plural.
 */
import stories from '@/data/basis/klasse-1/rechengeschichten.json'
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart, shownOp, type Op } from '../shared'
import SachaufgabeTask from './SachaufgabeTask.vue'

export interface Rechengeschichte {
  id: string
  image: string
  plus: string
  minus: string
}

export const GESCHICHTEN: readonly Rechengeschichte[] = stories

export interface SachaufgabeParams {
  max: number
}

export interface SachaufgabeData {
  image: string
  a: number
  op: Op
  b: number
  result: number
  /** The calculations to choose from, e.g. "5 + 3". */
  choices: { key: string; label: string }[]
  correctKey: string
}

export const MAX_SECOND = 5

/** Fills in the numbers as words: "{a} Enten" → "fünf Enten". */
export function storyText(story: Rechengeschichte, op: Op, a: number, b: number): string {
  const text = (op === '+' ? story.plus : story.minus)
    .replace('{a}', numberWord(a))
    .replace('{b}', numberWord(b))
  // Every sentence starts with a capital, also when it starts with a number word.
  return text.replace(
    /(^|[.!?] )(\p{Ll})/gu,
    (_, before: string, ch: string) => before + ch.toUpperCase(),
  )
}

export const sachaufgabe: ExerciseModule<SachaufgabeParams, SachaufgabeData> = {
  id: 'rechnen.sachaufgabe',
  topic: 'rechnen',

  items(ctx, params) {
    const max = Math.min(params.max, ctx.settings.numberRange)
    const keys: string[] = []
    for (const s of GESCHICHTEN) {
      for (let a = 2; a <= max; a++) {
        for (let b = 2; b <= MAX_SECOND; b++) {
          if (a + b <= max) keys.push(`rechnen.sachaufgabe:${s.id}:${a}+${b}`)
          if (a - b >= 1 && a <= max) keys.push(`rechnen.sachaufgabe:${s.id}:${a}-${b}`)
        }
      }
    }
    return keys
  },

  generate(_ctx, _params, itemKey, rng) {
    const [id, calc] = itemPart(itemKey).split(':') as [string, string]
    const story = GESCHICHTEN.find((s) => s.id === id)
    const match = /^(\d+)([+-])(\d+)$/.exec(calc)
    if (!story || !match) throw new Error(`Unbekannte Rechengeschichte: ${itemKey}`)
    const a = Number(match[1])
    const op = match[2] as Op
    const b = Number(match[3])
    const result = op === '+' ? a + b : a - b
    const label = (x: number, o: Op, y: number) => `${x} ${shownOp(o)} ${y}`
    const right = label(a, op, b)
    const other: Op = op === '+' ? '-' : '+'
    // Typical mistakes: the wrong operation, the wrong number taken from the story.
    const wrong = [label(a, other, b), label(a, op, b + 1), label(b, op, a), label(a + b, op, b)]
      .filter((l, i, all) => l !== right && all.indexOf(l) === i)
      .filter((l) => !l.includes('−') || Number(l.split(' − ')[0]) >= Number(l.split(' − ')[1]))
    const choices = shuffle([right, ...shuffle(wrong, rng).slice(0, 2)], rng)
    return {
      instruction: storyText(story, op, a, b),
      caption: 'Hör die Geschichte. Welche Rechnung passt?',
      hint: op === '+' ? 'Es kommen welche dazu.' : 'Es gehen welche weg.',
      solution: `${right} = ${result}. ${storyText(story, op, a, b).split('. ')[0]}.`,
      data: {
        image: story.image,
        a,
        op,
        b,
        result,
        choices: choices.map((c) => ({ key: c, label: c })),
        correctKey: right,
      },
    }
  },

  component: SachaufgabeTask,
}
