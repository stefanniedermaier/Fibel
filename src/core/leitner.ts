/**
 * Leitner boxes per item: what the child knows moves up, what was hard comes back.
 * Box 0 = never seen, 1 = hard/new, 5 = solid.
 */
import { shuffle, type Rng } from './random'
import type { ProgressRecord } from './types'

export const MAX_BOX = 5
/** From this box on an item counts as "safe". */
export const SAFE_BOX = 2
/** Share of safe items per unit, so the success rate stays around 80 %. */
export const SAFE_SHARE = 0.7

export type Outcome = 'first-try' | 'second-try' | 'revealed'

export function nextBox(box: number, outcome: Outcome): number {
  switch (outcome) {
    case 'first-try':
      return Math.min(MAX_BOX, Math.max(box, 0) + 1)
    case 'second-try':
      return Math.max(1, box)
    case 'revealed':
      return 1
  }
}

export function updateProgress(
  record: ProgressRecord | undefined,
  profileId: string,
  itemKey: string,
  outcome: Outcome,
  now: number = Date.now(),
): ProgressRecord {
  const base = record ?? { profileId, itemKey, box: 0, correct: 0, wrong: 0, lastSeen: 0 }
  return {
    ...base,
    box: nextBox(base.box, outcome),
    correct: base.correct + (outcome === 'revealed' ? 0 : 1),
    wrong: base.wrong + (outcome === 'first-try' ? 0 : 1),
    lastSeen: now,
  }
}

/**
 * Picks `count` candidates: about 70 % safe ones, the rest new or hard ones.
 * Hard items that were seen longest ago come first. If there are fewer candidates
 * than `count`, items repeat (never twice in a row).
 */
export function pickItems<T>(
  candidates: readonly T[],
  keyOf: (candidate: T) => string,
  progress: ReadonlyMap<string, ProgressRecord>,
  count: number,
  rng: Rng,
  safeShare: number = SAFE_SHARE,
): T[] {
  if (candidates.length === 0 || count <= 0) return []
  const boxOf = (c: T) => progress.get(keyOf(c))?.box ?? 0
  const seenOf = (c: T) => progress.get(keyOf(c))?.lastSeen ?? 0

  const mixed = shuffle(candidates, rng)
  const safe = mixed.filter((c) => boxOf(c) >= SAFE_BOX).sort((a, b) => boxOf(a) - boxOf(b))
  const hard = mixed.filter((c) => boxOf(c) === 1).sort((a, b) => seenOf(a) - seenOf(b))
  const fresh = mixed.filter((c) => boxOf(c) === 0)
  const learn = [...hard, ...fresh]

  const wanted = Math.min(count, candidates.length)
  let nSafe = Math.min(safe.length, Math.round(wanted * safeShare))
  let nLearn = Math.min(learn.length, wanted - nSafe)
  // Fill up from the other bucket if one runs short.
  nSafe = Math.min(safe.length, wanted - nLearn)
  nLearn = Math.min(learn.length, wanted - nSafe)

  const chosen = shuffle([...safe.slice(0, nSafe), ...learn.slice(0, nLearn)], rng)
  const result = [...chosen]
  let i = 0
  while (result.length < count) {
    const next = chosen[i % chosen.length] as T
    if (chosen.length === 1 || keyOf(next) !== keyOf(result[result.length - 1] as T)) {
      result.push(next)
    }
    i++
  }
  return result
}
