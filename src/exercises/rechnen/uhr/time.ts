/**
 * Clock times for the "Uhr" exercises: levels, spoken German forms and typical
 * reading mistakes (used as distractors).
 */
import { numberWord } from '@/core/numbers'
import { SAFE_BOX } from '@/core/leitner'
import { shuffle, type Rng } from '@/core/random'
import type { ProgressRecord } from '@/core/types'
import type { LearnerContext } from '../../types'

/** A time on the analogue clock face: hour 1–12, minute 0–59. */
export interface ClockTime {
  h: number
  m: number
}

/**
 * Levels, from coarse to fine. Every time belongs to exactly one level, so the
 * catalog entries of different levels never share an item:
 * 60 = full hour, 30 = half past, 15 = quarter past/to, 5 = five-minute steps, 1 = any minute.
 */
export type ClockStep = 60 | 30 | 15 | 5 | 1
export const CLOCK_STEPS: readonly ClockStep[] = [60, 30, 15, 5, 1]

/** Level 1–5 = full hours, half past, quarters, five minutes, single minutes. */
export const CLOCK_LEVELS = CLOCK_STEPS.map((_, i) => i + 1)
export const CLOCK_LEVEL_KEY = 'rechnen.uhr'
const lastLevel = CLOCK_LEVELS.length

export interface ClockParams {
  /** Level the automatic progression starts at (default 1). */
  minLevel?: number
  /** Highest level offered (default: all). */
  maxLevel?: number
}

/** A level counts as learnt once this many of its times are safe (Leitner box ≥ 2). */
export const MASTERY_COUNT = 6

const readingKey = (t: ClockTime) => `rechnen.uhr-lesen:${timeKey(t)}`

/**
 * Current level: set by hand in the parent area, otherwise the lowest level from
 * `minLevel` on that is not learnt yet. Progress comes from reading the clock.
 */
export function clockLevel(
  levels: Record<string, number>,
  progress: ReadonlyMap<string, ProgressRecord>,
  params: ClockParams = {},
): number {
  const max = Math.min(params.maxLevel ?? lastLevel, lastLevel)
  const manual = levels[CLOCK_LEVEL_KEY]
  if (manual !== undefined && CLOCK_LEVELS.includes(manual)) return Math.min(manual, max)
  for (let level = Math.max(params.minLevel ?? 1, 1); level < max; level++) {
    const times = timesFor([CLOCK_STEPS[level - 1]!])
    const safe = times.filter((t) => (progress.get(readingKey(t))?.box ?? 0) >= SAFE_BOX)
    if (safe.length < Math.min(MASTERY_COUNT, times.length)) return level
  }
  return max
}

/** The steps practised: everything up to the current level, so earlier ones are repeated. */
export function stepsFor(ctx: LearnerContext, params: ClockParams): ClockStep[] {
  if (!ctx.settings.clock) return []
  const level = clockLevel(ctx.settings.levels, ctx.progress ?? new Map(), params)
  return CLOCK_STEPS.slice(0, level)
}

export function levelOf(m: number): ClockStep {
  if (m === 0) return 60
  if (m === 30) return 30
  if (m % 15 === 0) return 15
  if (m % 5 === 0) return 5
  return 1
}

/** All times of the given levels, ordered by hour and minute. */
export function timesFor(steps: readonly ClockStep[]): ClockTime[] {
  const times: ClockTime[] = []
  for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m++) if (steps.includes(levelOf(m))) times.push({ h, m })
  }
  return times
}

export function timeKey({ h, m }: ClockTime): string {
  return `${h}-${m}`
}

export function parseTime(text: string): ClockTime {
  const match = /^(\d{1,2})-(\d{1,2})$/.exec(text)
  const h = Number(match?.[1])
  const m = Number(match?.[2])
  if (!match || h < 1 || h > 12 || m > 59) throw new Error(`Ungültige Uhrzeit: ${text}`)
  return { h, m }
}

/** Minutes since 12:00 on the clock face (0–719). */
export function toTotal({ h, m }: ClockTime): number {
  return (h % 12) * 60 + m
}

export function fromTotal(total: number): ClockTime {
  const t = ((Math.round(total) % 720) + 720) % 720
  return { h: Math.floor(t / 60) || 12, m: t % 60 }
}

/** "3:05" */
export function digital({ h, m }: ClockTime): string {
  return `${h}:${String(m).padStart(2, '0')}`
}

const next = (h: number) => (h % 12) + 1
/** "eins" in "halb eins", but "ein Uhr". */
const hourWord = (h: number) => numberWord(h)
const hourWithUhr = (h: number) => `${h === 1 ? 'ein' : numberWord(h)} Uhr`

/**
 * How the time is said, as children learn it at school:
 * "drei Uhr", "Viertel nach drei", "halb vier", "Viertel vor vier", "zehn nach drei",
 * "fünf vor halb vier", "zwanzig vor vier" – and for single minutes "drei Uhr siebzehn".
 */
export function spokenTime({ h, m }: ClockTime): string {
  if (m === 0) return hourWithUhr(h)
  if (m === 15) return `Viertel nach ${hourWord(h)}`
  if (m === 30) return `halb ${hourWord(next(h))}`
  if (m === 45) return `Viertel vor ${hourWord(next(h))}`
  if (m === 25) return `fünf vor halb ${hourWord(next(h))}`
  if (m === 35) return `fünf nach halb ${hourWord(next(h))}`
  if (m % 5 === 0) {
    return m < 30
      ? `${numberWord(m)} nach ${hourWord(h)}`
      : `${numberWord(60 - m)} vor ${hourWord(next(h))}`
  }
  return `${hourWithUhr(h)} ${numberWord(m)}`
}

/** Capitalised start, for whole sentences. */
export function sentence(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

/** A distractor may only use minutes the child already knows at this level. */
function fitsLevel(m: number, steps: readonly ClockStep[]): boolean {
  const finest = Math.min(...steps)
  return m % finest === 0
}

const wrapHour = (h: number) => ((((h - 1) % 12) + 12) % 12) + 1

/**
 * Wrong times a child typically reads, most likely first:
 * - wrong hour (above all "halb vier" read as "halb drei"),
 * - "nach" and "vor" mixed up (3:15 ↔ 3:45, 3:10 ↔ 3:50),
 * - the two hands mixed up (3:00 read as 12:15).
 */
export function typicalMistakes(time: ClockTime, steps: readonly ClockStep[]): ClockTime[] {
  const { h, m } = time
  const candidates: ClockTime[] = [
    m >= 30 ? { h: next(h), m } : { h: wrapHour(h - 1), m },
    m >= 30 ? { h: wrapHour(h - 1), m } : { h: next(h), m },
    { h, m: (60 - m) % 60 },
    { h: m >= 30 ? next(h) : h, m: (60 - m) % 60 },
  ]
  if (m % 5 === 0) candidates.push({ h: m === 0 ? 12 : m / 5, m: (h * 5) % 60 })
  candidates.push({ h: wrapHour(h + 2), m }, { h: wrapHour(h - 2), m })
  const seen = new Set([timeKey(time)])
  return candidates.filter((c) => {
    const key = timeKey(c)
    if (seen.has(key) || !fitsLevel(c.m, steps)) return false
    seen.add(key)
    return true
  })
}

/** The right time plus `count - 1` likely wrong ones, shuffled. */
export function clockChoices(
  time: ClockTime,
  steps: readonly ClockStep[],
  count: number,
  rng: Rng,
): ClockTime[] {
  const mistakes = typicalMistakes(time, steps)
  // A little variety: draw from the most likely mistakes, not always the same two.
  const pool = shuffle(mistakes.slice(0, count + 1), rng).slice(0, count - 1)
  return shuffle([time, ...pool], rng)
}
