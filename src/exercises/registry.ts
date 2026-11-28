/**
 * All exercise modules: every module exported from a file under src/exercises is found
 * here by itself. A new exercise = new module (exported) + catalog entries.
 */
import type { ExerciseModule } from './types'

const FILES = import.meta.glob<Record<string, unknown>>(
  ['./**/*.ts', '!./registry.ts', '!./types.ts'],
  { eager: true },
)

function isModule(value: unknown): value is ExerciseModule {
  const m = value as Partial<ExerciseModule> | null
  return (
    typeof m === 'object' &&
    m !== null &&
    typeof m.id === 'string' &&
    typeof m.topic === 'string' &&
    typeof m.items === 'function' &&
    typeof m.generate === 'function' &&
    'component' in m
  )
}

const modules = new Map<string, ExerciseModule>()
for (const [file, exports] of Object.entries(FILES)) {
  for (const value of Object.values(exports)) {
    if (!isModule(value)) continue
    const known = modules.get(value.id)
    // The same module re-exported elsewhere is fine; two modules with one id are not.
    if (known && known !== value) throw new Error(`Übung "${value.id}" doppelt (${file})`)
    modules.set(value.id, value)
  }
}

export function getExercise(id: string): ExerciseModule | undefined {
  return modules.get(id)
}

export function allExercises(): ExerciseModule[] {
  return [...modules.values()]
}
