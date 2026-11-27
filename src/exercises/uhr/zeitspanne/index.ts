/**
 * U2-4 "Zeitspannen" (Mathematik 1/2, 3.1: "bestimmen einfache Zeitspannen über
 * Anfangs- und Endzeitpunkt, z. B. vor vier Stunden, drei Stunden später").
 * - 'spaeter' / 'frueher': a clock → what time is it in / was it two hours ago?
 * - 'dauer': start and end clock → how long does it take?
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../../rechnen/shared'
import { digital, fromTotal, spokenTime } from '../time'
import UhrWahlTask, { type UhrWahlData } from '../digital/UhrWahlTask.vue'

export interface ZeitspanneParams {
  mode: 'spaeter' | 'frueher' | 'dauer'
}

/** "2 Stunden", "eine halbe Stunde", "1 Stunde und 30 Minuten" (in minutes). */
export function dauerText(min: number): string {
  if (min === 30) return 'eine halbe Stunde'
  const h = Math.floor(min / 60)
  const rest = min % 60
  const hours = h === 1 ? '1 Stunde' : `${h} Stunden`
  return rest ? `${hours} und ${rest} Minuten` : hours
}

const spokenDauer = (min: number) =>
  dauerText(min).replace(/\d+/g, (d) => (d === '1' ? 'eine' : numberWord(Number(d))))

export const zeitspanne: ExerciseModule<ZeitspanneParams, UhrWahlData> = {
  id: 'uhr.zeitspanne',
  topic: 'uhr',

  items(_ctx, params) {
    const keys: string[] = []
    for (let h = 1; h <= 12; h++)
      for (const m of [0, 30]) {
        if (params.mode === 'dauer') {
          for (const d of [30, 60, 90, 120, 180]) keys.push(`uhr.zeitspanne:dauer:${h}-${m}-${d}`)
        } else {
          for (const d of [1, 2, 3, 4]) keys.push(`uhr.zeitspanne:${params.mode}:${h}-${m}-${d}`)
        }
      }
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    const [h, m, d] = itemPart(itemKey).split(':')[1]!.split('-').map(Number) as [
      number,
      number,
      number,
    ]
    const start = (h % 12) * 60 + m
    if (params.mode === 'dauer') {
      const end = start + d
      const wrong = shuffle(
        [30, 60, 90, 120, 180, 240].filter((x) => x !== d),
        rng,
      ).slice(0, 2)
      return {
        instruction: `Es fängt um ${spokenTime(fromTotal(start))} an und hört um ${spokenTime(fromTotal(end))} auf. Wie lange dauert es?`,
        caption: 'Wie lange dauert es?',
        hint: 'Zähle die Stunden vom Anfang bis zum Ende.',
        solution: `Es dauert ${spokenDauer(d)}.`,
        data: {
          clocks: [
            { total: start, label: 'Anfang' },
            { total: end % 720, label: 'Ende' },
          ],
          correctKey: dauerText(d),
          choices: shuffle([d, ...wrong], rng).map((x) => ({
            key: dauerText(x),
            label: dauerText(x),
          })),
        },
      }
    }
    const sign = params.mode === 'spaeter' ? 1 : -1
    const answer = fromTotal(start + sign * d * 60)
    const right = digital(answer)
    const wrong = shuffle(
      [
        start - sign * d * 60,
        start + sign * (d + 1) * 60,
        start + sign * (d - 1) * 60,
        start + sign * d * 60 + 30,
      ]
        .map((t) => digital(fromTotal(t)))
        .filter((x, i, all) => x !== right && all.indexOf(x) === i),
      rng,
    ).slice(0, 2)
    const how =
      params.mode === 'spaeter'
        ? `Wie spät ist es in ${numberWord(d) === 'eins' ? 'einer Stunde' : `${numberWord(d)} Stunden`}?`
        : `Wie spät war es vor ${numberWord(d) === 'eins' ? 'einer Stunde' : `${numberWord(d)} Stunden`}?`
    return {
      instruction: `Es ist ${spokenTime(fromTotal(start))}. ${how}`,
      caption: how,
      hint:
        params.mode === 'spaeter'
          ? 'Dreh den kleinen Zeiger in Gedanken weiter.'
          : 'Dreh den kleinen Zeiger in Gedanken zurück.',
      solution: `Es ${params.mode === 'spaeter' ? 'ist dann' : 'war'} ${spokenTime(answer)}.`,
      data: {
        clocks: [{ total: start }],
        correctKey: right,
        choices: shuffle([right, ...wrong], rng).map((k) => ({ key: k, label: k })),
      },
    }
  },

  component: UhrWahlTask,
}
