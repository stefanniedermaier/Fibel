/**
 * U2-3 "Digitale Uhrzeit" (Mathematik 1/2, 3.1): the same clock shows 7:30 and 19:30.
 * - 'tageszeit': an analogue clock with the time of day (sun, moon) → which digital time?
 * - 'analog': a digital time (14:15) → which clock?
 */
import { numberWord } from '@/core/numbers'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../../rechnen/shared'
import UhrWahlTask, { type UhrWahlData } from './UhrWahlTask.vue'
import { textChoices } from '../../choices'

export interface DigitalParams {
  mode: 'tageszeit' | 'analog'
}

/** 24-hour time "19:30". */
export const time24 = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`

/** Time of day with its picture: morgens, mittags, nachmittags, abends, nachts. */
export function tageszeit(h: number): { word: string; icon: string } {
  if (h >= 5 && h < 11) return { word: 'morgens', icon: '1F305' }
  if (h >= 11 && h < 14) return { word: 'mittags', icon: '2600' }
  if (h >= 14 && h < 18) return { word: 'nachmittags', icon: '1F324' }
  if (h >= 18 && h < 22) return { word: 'abends', icon: '1F307' }
  return { word: 'nachts', icon: '1F319' }
}

/** Minutes since 12:00 on the analogue clock. */
const total = (h: number, m: number) => ((h % 12) * 60 + m) % 720

export const uhrDigital: ExerciseModule<DigitalParams, UhrWahlData> = {
  id: 'uhr.digital',
  topic: 'uhr',

  items(_ctx, params) {
    const keys: string[] = []
    for (let h = 6; h <= 22; h++)
      for (const m of params.mode === 'analog' ? [0, 15, 30, 45] : [0, 30])
        keys.push(`uhr.digital:${params.mode}:${h}-${m}`)
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    const [h, m] = itemPart(itemKey).split(':')[1]!.split('-').map(Number) as [number, number]
    const t = tageszeit(h)
    const shown = time24(h, m)
    if (params.mode === 'tageszeit') {
      const other = (h + 12) % 24
      const near = shuffle([time24(h === 23 ? 0 : h + 1, m), time24(h - 1, m)], rng)
      const wrong = [time24(other, m), near[0]!]
      return {
        instruction: `Es ist ${t.word}. Was zeigt die Digitaluhr?`,
        caption: `Es ist ${t.word}. Wie spät ist es?`,
        hint: 'Am Nachmittag und am Abend zählt man nach zwölf weiter: 13, 14, 15 …',
        solution: `Es ist ${shown} Uhr.`,
        data: {
          icon: t.icon,
          clocks: [{ total: total(h, m) }],
          correctKey: shown,
          choices: textChoices([shown, ...wrong], rng),
        },
      }
    }
    const right = total(h, m)
    const wrong = shuffle(
      [total(h + 1, m), total(h - 1, m), total(m / 5 || 12, (h % 12) * 5), total(h, (m + 30) % 60)],
      rng,
    )
      .filter((x, i, all) => x !== right && all.indexOf(x) === i)
      .slice(0, 2)
    return {
      instruction: `Die Digitaluhr zeigt ${numberWord(h)} Uhr${m ? ` ${numberWord(m)}` : ''}. Welche Uhr zeigt die gleiche Zeit?`,
      caption: 'Welche Uhr zeigt die gleiche Zeit?',
      hint:
        h > 12
          ? `${h} Uhr ist auf der Uhr mit Zeigern ${h - 12} Uhr.`
          : 'Schau zuerst auf den kleinen Zeiger.',
      solution: `${shown} Uhr sieht so aus.`,
      data: {
        prompt: shown,
        clocks: [],
        correctKey: String(right),
        choices: shuffle([right, ...wrong], rng).map((x) => ({ key: String(x), total: x })),
      },
    }
  },

  component: UhrWahlTask,
}
