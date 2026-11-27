/**
 * What the child can practise right now: switched-on units, available exercises, and
 * the categories they belong to (plaene/README.md, section 4).
 */
import type { ExerciseModule, LearnerContext } from '@/exercises/types'
import { activeCatalog, categoriesOf } from './content'
import { availableEntries } from './session'
import type { CatalogEntry, ExerciseCategory, Topic } from './types'

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
