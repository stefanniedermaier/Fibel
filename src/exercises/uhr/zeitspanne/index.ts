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
  /** Grade 3 (U3-1): digital times in 5-minute steps, durations in minutes, over full hours. */
  minuten?: boolean
}

/** U3-1: start times of the day and durations in minutes. */
const STARTS = [
  '7:45',
  '8:20',
  '9:35',
  '10:50',
  '11:15',
  '13:40',
  '14:55',
  '16:25',
  '17:10',
  '18:35',
]
const DAUERN = [15, 25, 40, 45, 50, 75, 90, 105]

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number) as [number, number]
  return h * 60 + m
}
/** "9:05" – 24-hour digital time. */
export const uhrzeit = (min: number) => {
  const t = ((min % 1440) + 1440) % 1440
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}
/** "1 h 15 min", "40 min". */
export const dauerKurz = (min: number) =>
  min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}` : `${min} min`
/** Spoken: "9 Uhr 5", "1 Stunde und 15 Minuten". */
const sagZeit = (min: number) => {
  const [h, m] = uhrzeit(min).split(':').map(Number) as [number, number]
  return m ? `${h} Uhr ${m}` : `${h} Uhr`
}
const sagDauer = (min: number) => (min < 60 ? `${min} Minuten` : dauerText(min))

function minutenAufgabe(
  mode: ZeitspanneParams['mode'],
  start: number,
  d: number,
  rng: () => number,
) {
  if (mode === 'dauer') {
    const end = start + d
    const wrong = shuffle(
      [d + 10, d - 10, d + 60, d - 60, d + 5].filter((x) => x > 0 && x !== d),
      rng,
    ).slice(0, 2)
    return {
      instruction: `Es fängt um ${sagZeit(start)} an und hört um ${sagZeit(end)} auf. Wie lange dauert es?`,
      caption: 'Wie lange dauert es?',
      hint: 'Rechne erst bis zur vollen Stunde, dann weiter bis zum Ende.',
      solution: `Es dauert ${sagDauer(d)}.`,
      data: {
        clocks: [
          { total: start % 720, label: `Anfang ${uhrzeit(start)}` },
          { total: end % 720, label: `Ende ${uhrzeit(end)}` },
        ],
        correctKey: dauerKurz(d),
        choices: shuffle([d, ...wrong], rng).map((x) => ({
          key: dauerKurz(x),
          label: dauerKurz(x),
        })),
      },
    }
  }
  const sign = mode === 'spaeter' ? 1 : -1
  const end = start + sign * d
  const right = uhrzeit(end)
  // Typical mistakes: the hour not carried, ten minutes off, the wrong direction.
  const wrong = shuffle(
    [end - sign * 60, end + 10, end - 10, start - sign * d]
      .map(uhrzeit)
      .filter((x, i, all) => x !== right && all.indexOf(x) === i),
    rng,
  ).slice(0, 2)
  const how =
    mode === 'spaeter'
      ? `Wie spät ist es ${sagDauer(d)} später?`
      : `Wie spät war es ${sagDauer(d)} früher?`
  return {
    instruction: `Es ist ${sagZeit(start)}. ${how}`,
    caption: how,
    hint: 'Rechne in Schritten: erst bis zur vollen Stunde, dann den Rest.',
    solution: `Es ${mode === 'spaeter' ? 'ist dann' : 'war'} ${sagZeit(end)}.`,
    data: {
      prompt: uhrzeit(start),
      clocks: [],
      correctKey: right,
      choices: shuffle([right, ...wrong], rng).map((k) => ({ key: k, label: k })),
    },
  }
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
    if (params.minuten)
      return STARTS.flatMap((t) => DAUERN.map((d) => `uhr.zeitspanne:${params.mode}:m${t}-${d}`))
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
    const part = itemPart(itemKey).split(':').slice(1).join(':')
    if (part.startsWith('m')) {
      const [t, d] = part.slice(1).split('-') as [string, string]
      return minutenAufgabe(params.mode, toMin(t), Number(d), rng)
    }
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
