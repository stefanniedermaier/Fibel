/** Rules of a unit: which tasks, when a star, when the crown. Pure functions. */
import type { ExerciseModule, GeneratedTask, LearnerContext } from '@/exercises/types'
import { pickItems, type Outcome } from './leitner'
import { shuffle, type Rng } from './random'
import { TOPICS } from './types'
import type { CatalogEntry, ProgressRecord, SessionRecord, TaskResult, Topic } from './types'

/** After this many wrong answers the solution is shown. */
export const MAX_WRONG = 2

export interface PlannedTask {
  id: string
  entry: CatalogEntry
  module: ExerciseModule
  itemKey: string
  task: GeneratedTask
}

type ModuleLookup = (id: string) => ExerciseModule | undefined

export function availableEntries(
  entries: readonly CatalogEntry[],
  ctx: LearnerContext,
  lookup: ModuleLookup,
): CatalogEntry[] {
  return entries.filter((e) => {
    const module = lookup(e.exercise)
    return module !== undefined && module.items(ctx, e.params).length > 0
  })
}

export function planSession(
  entries: readonly CatalogEntry[],
  ctx: LearnerContext,
  progress: ReadonlyMap<string, ProgressRecord>,
  count: number,
  rng: Rng,
  lookup: ModuleLookup,
): PlannedTask[] {
  // The modules see the progress, e.g. to unlock the next word level.
  const learner: LearnerContext = { ...ctx, progress }
  const groups = entries
    .map((entry) => {
      const module = lookup(entry.exercise)
      const items = module ? module.items(learner, entry.params) : []
      return { entry, module, items }
    })
    .filter((g): g is typeof g & { module: ExerciseModule } => !!g.module && g.items.length > 0)
  if (groups.length === 0) return []

  // Every exercise gets a share of the tasks by its weight (default: equal shares; the
  // remainder goes to random exercises), so an exercise with many items does not crowd
  // out the others.
  const quotas = weightedShares(
    count,
    groups.map((g) => g.entry.weight ?? 1),
    rng,
  )
  const picked = groups.flatMap((g, i) =>
    pickItems(g.items, (key) => key, progress, quotas[i] ?? 0, rng).map((itemKey) => ({
      ...g,
      itemKey,
    })),
  )
  return spreadOut(shuffle(picked, rng), (p) => p.entry.id).map((c, i) => ({
    id: `${i}-${c.entry.id}-${c.itemKey}`,
    entry: c.entry,
    module: c.module,
    itemKey: c.itemKey,
    task: c.module.generate(learner, c.entry.params, c.itemKey, rng),
  }))
}

/** Splits `count` into `parts` nearly equal shares; the extra ones go to random parts. */
export function sharesOf(count: number, parts: number, rng: Rng): number[] {
  const base = Math.floor(count / parts)
  const shares = Array.from({ length: parts }, () => base)
  const extra = shuffle(
    Array.from({ length: parts }, (_, i) => i),
    rng,
  ).slice(0, count - base * parts)
  for (const i of extra) shares[i] = (shares[i] ?? 0) + 1
  return shares
}

/**
 * Splits `count` by the weights (largest remainder). Equal weights give the same result
 * as `sharesOf`; ties for the remainder are broken at random.
 */
export function weightedShares(count: number, weights: readonly number[], rng: Rng): number[] {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0)
  if (total <= 0) return sharesOf(count, weights.length, rng)
  const exact = weights.map((w) => (Math.max(0, w) / total) * count)
  const shares = exact.map(Math.floor)
  // Remainders rounded, so floating-point noise does not decide ties (random instead).
  const remainder = (i: number) => Math.round(((exact[i] ?? 0) - (shares[i] ?? 0)) * 1e6)
  const order = shuffle(
    weights.map((_, i) => i),
    rng,
  ).sort((a, b) => remainder(b) - remainder(a))
  let rest = count - shares.reduce((sum, s) => sum + s, 0)
  for (const i of order) {
    if (rest <= 0) break
    shares[i] = (shares[i] ?? 0) + 1
    rest--
  }
  return shares
}

/** Reorders so the same exercise does not come twice in a row where avoidable. */
export function spreadOut<T>(items: readonly T[], keyOf: (item: T) => string): T[] {
  // Always continue with the exercise that has the most tasks left (but not the one
  // just used) – otherwise the frequent one piles up at the end.
  const rest = [...items]
  const result: T[] = []
  while (rest.length > 0) {
    const last = result.length > 0 ? keyOf(result[result.length - 1] as T) : undefined
    const counts = new Map<string, number>()
    for (const item of rest) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1)
    let best: string | undefined
    for (const [key, n] of counts) {
      if (key !== last && (best === undefined || n > (counts.get(best) ?? 0))) best = key
    }
    const index = best === undefined ? 0 : rest.findIndex((item) => keyOf(item) === best)
    result.push(...rest.splice(index, 1))
  }
  return result
}

export function outcomeOf(wrongAttempts: number, revealed: boolean): Outcome {
  if (revealed) return 'revealed'
  return wrongAttempts === 0 ? 'first-try' : 'second-try'
}

/** A star for every task solved without the solution being shown. */
export function earnsStar(wrongAttempts: number, revealed: boolean): boolean {
  return !revealed && wrongAttempts < MAX_WRONG
}

export function starsNeeded(total: number, crownRatio: number): number {
  return crownRatio <= 0 ? 0 : Math.ceil(total * crownRatio - 1e-9)
}

export function earnsCrown(stars: number, total: number, crownRatio: number): boolean {
  return stars >= starsNeeded(total, crownRatio)
}

export interface RewardTotals {
  stars: number
  crowns: number
  units: number
  byTopic: Record<Topic, { stars: number; crowns: number }>
}

/** How long stars, crowns and statistics last: 14 days or one month. */
export const REWARD_DAYS = [14, 30] as const

/**
 * Units that started before this moment have expired: the start of the local day
 * `days - 1` days ago, so "14 days" means today and the 13 days before (like the chart).
 */
export function expiryCutoff(days: number, now = Date.now()): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (days - 1))
  return d.getTime()
}

/** Stars and crowns are derived from the sessions – one source of truth. */
export function rewardTotals(sessions: readonly SessionRecord[]): RewardTotals {
  const totals: RewardTotals = {
    stars: 0,
    crowns: 0,
    units: 0,
    byTopic: Object.fromEntries(
      TOPICS.map((t) => [t, { stars: 0, crowns: 0 }]),
    ) as RewardTotals['byTopic'],
  }
  for (const s of sessions) {
    const crown = s.crown ? 1 : 0
    totals.stars += s.stars
    totals.crowns += crown
    totals.units += s.completed ? 1 : 0
    totals.byTopic[s.topic].stars += s.stars
    totals.byTopic[s.topic].crowns += crown
  }
  return totals
}

export function countStars(results: readonly TaskResult[]): number {
  return results.filter((r) => r.star).length
}
