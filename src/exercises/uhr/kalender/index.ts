/**
 * M16 "Kalender" (Mathematik 1/2, 3.1: Woche, Monat, Jahr; HSU 1/2, 4.1):
 * `wochentage`: "Welcher Tag kommt nach Dienstag?"
 * `monate`: "Welcher Monat kommt vor März?"
 * `gestern`: "Heute ist Montag. Welcher Tag ist morgen?"
 * The choices are read aloud with the question – the names are hard to read in grade 1.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import KalenderTask from './KalenderTask.vue'
import { textChoice } from '../../choices'

export const WOCHENTAGE = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
]
export const MONATE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

export interface KalenderParams {
  mode: 'wochentage' | 'monate' | 'gestern'
}

export interface KalenderData {
  choices: { key: string; label: string }[]
  correctKey: string
}

const at = (list: readonly string[], i: number) => list[(i + list.length) % list.length]!

export const kalender: ExerciseModule<KalenderParams, KalenderData> = {
  id: 'uhr.kalender',
  topic: 'uhr',

  items(_ctx, params) {
    const list = params.mode === 'monate' ? MONATE : WOCHENTAGE
    const sides = params.mode === 'gestern' ? ['gestern', 'morgen'] : ['vor', 'nach']
    return sides.flatMap((s) => list.map((_, i) => `uhr.kalender:${params.mode}:${s}:${i}`))
  },

  generate(_ctx, params, itemKey, rng) {
    const [, , side, index] = itemKey.split(':') as [string, string, string, string]
    const i = Number(index)
    const list = params.mode === 'monate' ? MONATE : WOCHENTAGE
    const forward = side === 'nach' || side === 'morgen'
    const answer = at(list, forward ? i + 1 : i - 1)
    // The typical mistake: the other direction; plus one more name.
    const wrong = at(list, forward ? i - 1 : i + 1)
    const extra = shuffle(
      list.filter((x) => x !== answer && x !== wrong && x !== list[i]),
      rng,
    )[0]!
    const choices = shuffle([answer, wrong, extra], rng)
    const spokenChoices = `${choices.slice(0, 2).join(', ')} oder ${choices[2]}?`
    const question =
      params.mode === 'gestern'
        ? `Heute ist ${list[i]}. Welcher Tag ${forward ? 'ist morgen' : 'war gestern'}?`
        : `Welcher ${params.mode === 'monate' ? 'Monat' : 'Tag'} kommt ${forward ? 'nach' : 'vor'} ${list[i]}?`
    return {
      instruction: `${question} ${spokenChoices}`,
      caption: question,
      hint:
        params.mode === 'monate'
          ? 'Sag die Monate der Reihe nach auf: Januar, Februar, März …'
          : 'Sag die Wochentage der Reihe nach auf: Montag, Dienstag, Mittwoch …',
      solution:
        params.mode === 'gestern'
          ? `${forward ? 'Morgen ist' : 'Gestern war'} ${answer}.`
          : `${forward ? 'Nach' : 'Vor'} ${list[i]} kommt ${answer}.`,
      data: { choices: choices.map(textChoice), correctKey: answer },
    }
  },

  component: KalenderTask,
}
