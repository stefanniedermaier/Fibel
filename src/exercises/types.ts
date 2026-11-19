import type { Component } from 'vue'
import type { Rng } from '@/core/random'
import type { LandCode, ProfileSettings, Topic } from '@/core/types'

export interface LearnerContext {
  land: LandCode
  grade: number
  settings: ProfileSettings
}

export interface GeneratedTask<D = unknown> {
  /** Spoken automatically when the task appears. */
  instruction: string
  /** Spoken after the first wrong answer (optional). */
  hint?: string
  /** Spoken when the solution is revealed after the second wrong answer. */
  solution: string
  data: D
}

/** Props every exercise component receives. */
export interface ExerciseProps<D = unknown> {
  data: D
  /** The solution is shown (after two wrong answers). */
  revealed: boolean
  /** Input blocked (e.g. while the praise is playing). */
  locked: boolean
}

/** An exercise type. It knows nothing about grades – content comes via params. */
export interface ExerciseModule<P = Record<string, unknown>, D = unknown> {
  id: string
  topic: Topic
  /** Item keys the module can practise with these params (empty = not available). */
  items(ctx: LearnerContext, params: P): string[]
  generate(ctx: LearnerContext, params: P, itemKey: string, rng: Rng): GeneratedTask<D>
  /** Emits `answer` with `true`/`false`. */
  component: Component
}
