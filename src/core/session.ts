/** Rules of a unit: which tasks, when a star, when the crown. Pure functions. */
import type { ExerciseModule, GeneratedTask, LearnerContext } from '@/exercises/types'
import { pickItems, type Outcome } from './leitner'
import type { Rng } from './random'
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
  const candidates = entries.flatMap((entry) => {
    const module = lookup(entry.exercise)
    if (!module) return []
    return module.items(ctx, entry.params).map((itemKey) => ({ entry, module, itemKey }))
  })
  return pickItems(candidates, (c) => c.itemKey, progress, count, rng).map((c, i) => ({
    id: `${i}-${c.entry.id}-${c.itemKey}`,
    entry: c.entry,
    module: c.module,
    itemKey: c.itemKey,
    task: c.module.generate(ctx, c.entry.params, c.itemKey, rng),
  }))
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

/** Stars and crowns are derived from the sessions – one source of truth. */
export function rewardTotals(sessions: readonly SessionRecord[]): RewardTotals {
  const totals: RewardTotals = {
    stars: 0,
    crowns: 0,
    units: 0,
    byTopic: {
      lesen: { stars: 0, crowns: 0 },
      schreiben: { stars: 0, crowns: 0 },
      rechnen: { stars: 0, crowns: 0 },
    },
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
