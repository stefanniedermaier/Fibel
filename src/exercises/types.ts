import type { Component } from 'vue'
import type { Rng } from '@/core/random'
import type { LandCode, ProfileSettings, ProgressRecord, Topic } from '@/core/types'

export interface LearnerContext {
  land: LandCode
  grade: number
  settings: ProfileSettings
  /** Learning progress per item key; used e.g. to unlock the next word level. */
  progress?: ReadonlyMap<string, ProgressRecord>
}

export interface GeneratedTask<D = unknown> {
  /** Spoken automatically when the task appears. */
  instruction: string
  /**
   * Shown as text above the task (default: the instruction). Listening tasks set their
   * own text, so the written words do not give the answer away ("Wo steht mo?").
   */
  caption?: string
  /** Spoken after the first wrong answer (optional). */
  hint?: string
  /** Spoken when the solution is revealed after the second wrong answer. */
  solution: string
  /** Spoken after the praise of a right answer, e.g. a fact to remember (HSU). */
  afterword?: string
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
  /**
   * 'fit': the task fills exactly the screen height in portrait (no scrolling), e.g.
   * for drawing with the finger, where scrolling would get in the way.
   */
  layout?: 'fit'
}
