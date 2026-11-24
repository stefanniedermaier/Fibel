/**
 * "Uhr lesen": an analogue clock is shown, the child picks the matching time.
 * The wrong choices are typical reading mistakes (wrong hour at "halb", "nach" and
 * "vor" mixed up, hands mixed up).
 */
import type { ExerciseModule } from '../../types'
import { itemPart } from '../../rechnen/shared'
import {
  CLOCK_STEPS,
  clockChoices,
  digital,
  levelOf,
  parseTime,
  sentence,
  spokenTime,
  stepsFor,
  timeKey,
  timesFor,
  toTotal,
  type ClockParams,
  type ClockTime,
} from '../time'
import UhrLesenTask from './UhrLesenTask.vue'

export const CLOCK_CHOICE_COUNT = 3

export interface UhrLesenData {
  total: number
  minuteLabels: boolean
  correctKey: string
  choices: { key: string; spoken: string; digital: string }[]
}

export function hintFor({ m }: ClockTime): string {
  if (m === 0) return 'Der lange Zeiger zeigt auf die Zwölf. Der kurze Zeiger zeigt die Stunde.'
  if (m === 30)
    return 'Der lange Zeiger zeigt auf die Sechs. Der kurze Zeiger ist schon halb bis zur nächsten Stunde.'
  if (m === 15) return 'Der lange Zeiger zeigt auf die Drei. Das ist Viertel nach.'
  if (m === 45)
    return 'Der lange Zeiger zeigt auf die Neun. Das ist Viertel vor der nächsten Stunde.'
  if (m % 5 === 0) return 'Zähle in Fünferschritten, wie weit der lange Zeiger schon ist.'
  return 'Zähle die kleinen Striche bis zum langen Zeiger.'
}

export const uhrLesen: ExerciseModule<ClockParams, UhrLesenData> = {
  id: 'uhr.lesen',
  topic: 'uhr',

  items(ctx, params) {
    return timesFor(stepsFor(ctx, params)).map((t) => `uhr.lesen:${timeKey(t)}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const time = parseTime(itemPart(itemKey))
    // Wrong choices only use minutes of the time's own level or coarser ones.
    const steps = CLOCK_STEPS.filter((s) => s >= levelOf(time.m))
    const choices = clockChoices(time, steps, CLOCK_CHOICE_COUNT, rng)
    return {
      instruction: 'Wie spät ist es?',
      hint: hintFor(time),
      solution: `Es ist ${spokenTime(time)}.`,
      data: {
        total: toTotal(time),
        minuteLabels: levelOf(time.m) === 1,
        correctKey: timeKey(time),
        choices: choices.map((c) => ({
          key: timeKey(c),
          spoken: sentence(spokenTime(c)),
          digital: digital(c),
        })),
      },
    }
  },

  component: UhrLesenTask,
}
