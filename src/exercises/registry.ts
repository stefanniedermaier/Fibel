/** All exercise modules. A new exercise = new module + entry here + catalog entries. */
import { mengen } from './rechnen/mengen'
import type { ExerciseModule } from './types'

const modules = new Map<string, ExerciseModule>()

function register<P, D>(module: ExerciseModule<P, D>) {
  if (modules.has(module.id)) throw new Error(`Übung "${module.id}" doppelt registriert`)
  modules.set(module.id, module as unknown as ExerciseModule)
}

register(mengen)

export function getExercise(id: string): ExerciseModule | undefined {
  return modules.get(id)
}

export function allExercises(): ExerciseModule[] {
  return [...modules.values()]
}
