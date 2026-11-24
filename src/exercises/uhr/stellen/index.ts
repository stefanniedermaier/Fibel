/**
 * "Uhr stellen": a time is read aloud and shown, the child drags the hands of the
 * clock. As on a learning clock, the hour hand moves along with the minute hand.
 */
import type { ExerciseModule } from '../../types'
import { itemPart } from '../../rechnen/shared'
import {
  digital,
  parseTime,
  sentence,
  spokenTime,
  stepsFor,
  timeKey,
  timesFor,
  toTotal,
  type ClockParams,
} from '../time'
import UhrStellenTask from './UhrStellenTask.vue'

export interface UhrStellenData {
  target: number
  spoken: string
  digital: string
  /** Minute steps the minute hand snaps to. */
  snap: number
}

/** The clock starts at twelve o'clock – unless that is the answer. */
export function startTotal(target: number): number {
  return target === 0 ? 6 * 60 : 0
}

export const uhrStellen: ExerciseModule<ClockParams, UhrStellenData> = {
  id: 'uhr.stellen',
  topic: 'uhr',

  items(ctx, params) {
    // Single minutes are too fiddly to set with a finger.
    const steps = stepsFor(ctx, params).filter((s) => s !== 1)
    return timesFor(steps).map((t) => `uhr.stellen:${timeKey(t)}`)
  },

  generate(_ctx, _params, itemKey) {
    const time = parseTime(itemPart(itemKey))
    const spoken = spokenTime(time)
    return {
      instruction: `Stelle die Uhr auf ${spoken}.`,
      caption: 'Stelle die Uhr.',
      hint:
        time.m === 0
          ? 'Der lange Zeiger muss auf die Zwölf. Der kurze Zeiger zeigt die Stunde.'
          : 'Der lange Zeiger zeigt die Minuten, der kurze Zeiger die Stunden.',
      solution: `So zeigt die Uhr ${spoken}.`,
      data: { target: toTotal(time), spoken: sentence(spoken), digital: digital(time), snap: 5 },
    }
  },

  component: UhrStellenTask,
  layout: 'fit',
}
