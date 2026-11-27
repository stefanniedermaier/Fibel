/**
 * What the child can practise right now: switched-on units, available exercises, and
 * the categories they belong to (plaene/README.md, section 4).
 */
import type { ExerciseModule, LearnerContext } from '@/exercises/types'
import { activeCatalog, categoriesOf } from './content'
import { availableEntries } from './session'
import { pickItems } from './leitner'
import { shuffle, type Rng } from './random'
import { planSession, spreadOut, type PlannedTask } from './session'
import type {
  CatalogEntry,
  ExerciseCategory,
  ProfileSettings,
  ProgressRecord,
  Topic,
} from './types'

type ModuleLookup = (id: string) => ExerciseModule | undefined

/** Revising a lower grade: all its units count as done. */
export interface PracticeOptions {
  revision?: boolean
}

/** Exercises of a subject (optionally one category) that have items for the learner. */
export function practiceEntries(
  ctx: LearnerContext,
  topic: Topic,
  lookup: ModuleLookup,
  category?: string,
  options: PracticeOptions = {},
): CatalogEntry[] {
  return availableEntries(
    activeCatalog(ctx.land, ctx.grade, ctx.settings, topic, category, options.revision),
    ctx,
    lookup,
  )
}

/** Categories with something to practise, in their fixed order. */
export function practiceCategories(
  ctx: LearnerContext,
  topic: Topic,
  lookup: ModuleLookup,
  options: PracticeOptions = {},
): ExerciseCategory[] {
  return categoriesOf(practiceEntries(ctx, topic, lookup, undefined, options))
}

/**
 * The subject page with categories only pays off with at least two of them;
 * otherwise the tile starts a unit directly.
 */
export function showsCategories(
  ctx: LearnerContext,
  topic: Topic,
  lookup: ModuleLookup,
  options: PracticeOptions = {},
): boolean {
  return practiceCategories(ctx, topic, lookup, options).length >= 2
}

/** Where a subject tile leads: the subject page with categories or straight to a unit. */
export function topicRoute(
  ctx: LearnerContext,
  topic: Topic,
  lookup: ModuleLookup,
  options: PracticeOptions = {},
) {
  const params = { grade: ctx.grade, topic }
  return showsCategories(ctx, topic, lookup, options)
    ? { name: 'topic', params }
    : { name: 'session', params }
}

// --- Schwerpunkt (focus of the week) ----------------------------------------

/** Focus of a subject, if set and not yet expired. */
export function activeFocus(
  settings: Pick<ProfileSettings, 'focus'>,
  topic: Topic,
  now = Date.now(),
): string | undefined {
  const f = settings.focus?.[topic]
  return f && f.until > now ? f.unit : undefined
}

/**
 * "Alles gemischt" with a focus: half of the tasks (rounded up) come from the focus unit,
 * the rest from all other exercises. Without a focus it is an ordinary unit.
 */
export function planFocused(
  entries: readonly CatalogEntry[],
  unit: string | undefined,
  ctx: LearnerContext,
  progress: ReadonlyMap<string, ProgressRecord>,
  count: number,
  rng: Rng,
  lookup: ModuleLookup,
): PlannedTask[] {
  const inFocus = unit ? entries.filter((e) => e.unit === unit) : []
  const others = entries.filter((e) => !inFocus.includes(e))
  if (inFocus.length === 0 || others.length === 0)
    return planSession(entries, ctx, progress, count, rng, lookup)
  const half = Math.ceil(count / 2)
  const focused = planSession(inFocus, ctx, progress, half, rng, lookup)
  const rest = planSession(others, ctx, progress, count - focused.length, rng, lookup)
  return spreadOut(shuffle([...focused, ...rest], rng), (t) => t.entry.id)
}

// --- Stolpersteine -------------------------------------------------------------

/** Tasks that often went wrong and do not sit yet (same rule as the statistics). */
export function isStumble(p: ProgressRecord): boolean {
  return p.wrong >= 2 && p.box <= 3
}

/** At least this many stumbling blocks before the tile appears. */
export const MIN_STUMBLES = 4

/** Stumbling blocks among the items the child can practise in these exercises. */
export function stumbleItems(
  ctx: LearnerContext,
  entries: readonly CatalogEntry[],
  progress: ReadonlyMap<string, ProgressRecord>,
  lookup: ModuleLookup,
): { entry: CatalogEntry; itemKey: string }[] {
  const learner = { ...ctx, progress }
  const result: { entry: CatalogEntry; itemKey: string }[] = []
  const seen = new Set<string>()
  for (const entry of entries) {
    const module = lookup(entry.exercise)
    if (!module) continue
    for (const itemKey of module.items(learner, entry.params)) {
      const p = progress.get(itemKey)
      if (p && isStumble(p) && !seen.has(itemKey)) {
        seen.add(itemKey)
        result.push({ entry, itemKey })
      }
    }
  }
  return result
}

/**
 * A "Stolpersteine" unit: about half stumbling blocks, the rest ordinary tasks of the
 * subject, so it does not feel like a punishment round.
 */
export function planStumbles(
  entries: readonly CatalogEntry[],
  ctx: LearnerContext,
  progress: ReadonlyMap<string, ProgressRecord>,
  count: number,
  rng: Rng,
  lookup: ModuleLookup,
): PlannedTask[] {
  const learner = { ...ctx, progress }
  const stumbles = stumbleItems(ctx, entries, progress, lookup)
  const hard = pickItems(
    stumbles,
    (s) => s.itemKey,
    progress,
    Math.min(Math.ceil(count / 2), stumbles.length),
    rng,
  )
  // Plan a full unit and drop what is already among the stumbling blocks.
  const rest = planSession(entries, ctx, progress, count, rng, lookup)
    .filter((t) => !hard.some((h) => h.itemKey === t.itemKey))
    .slice(0, count - hard.length)
  const planned: PlannedTask[] = hard.map((h, i) => {
    const module = lookup(h.entry.exercise)!
    return {
      id: `s${i}-${h.entry.id}-${h.itemKey}`,
      entry: h.entry,
      module,
      itemKey: h.itemKey,
      task: module.generate(learner, h.entry.params, h.itemKey, rng),
    }
  })
  return spreadOut(shuffle([...planned, ...rest], rng), (t) => t.entry.id)
}
