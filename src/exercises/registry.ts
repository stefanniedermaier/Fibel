/** All exercise modules. A new exercise = new module + entry here + catalog entries. */
import { anlaut } from './lesen/anlaut'
import { bildWort } from './lesen/bild-wort'
import { silbenHoeren } from './lesen/silben-hoeren'
import { silbenKlatschen } from './lesen/silben-klatschen'
import { wortBild } from './lesen/wort-bild'
import { mengeLegen } from './rechnen/menge-legen'
import { mengen } from './rechnen/mengen'
import { plusMinus } from './rechnen/plus-minus'
import { vergleichen } from './rechnen/vergleichen'
import { zahlenhaus } from './rechnen/zahlenhaus'
import { abcTastatur } from './schreiben/abc-tastatur'
import { buchstabenLegen, luecke } from './schreiben/buchstaben-legen'
import { nachspuren } from './schreiben/nachspuren'
import { silbenLegen } from './schreiben/silben-legen'
import type { ExerciseModule } from './types'

const modules = new Map<string, ExerciseModule>()

function register<P, D>(module: ExerciseModule<P, D>) {
  if (modules.has(module.id)) throw new Error(`Übung "${module.id}" doppelt registriert`)
  modules.set(module.id, module as unknown as ExerciseModule)
}

register(silbenHoeren)
register(wortBild)
register(bildWort)
register(anlaut)
register(silbenKlatschen)
register(mengen)
register(mengeLegen)
register(vergleichen)
register(zahlenhaus)
register(plusMinus)
register(silbenLegen)
register(luecke)
register(buchstabenLegen)
register(abcTastatur)
register(nachspuren)

export function getExercise(id: string): ExerciseModule | undefined {
  return modules.get(id)
}

export function allExercises(): ExerciseModule[] {
  return [...modules.values()]
}
