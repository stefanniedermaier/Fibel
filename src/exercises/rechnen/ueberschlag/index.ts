/**
 * R3-10 "Überschlag" (Mathematik 3/4, 1.2: "überprüfen Ergebnisse durch Überschlag"):
 * - 'ungefaehr': 398 + 207 is about …? (round to hundreds)
 * - 'pruefen': 398 + 207 = 905 – can that be right?
 */
import { numberWord } from '@/core/numbers'
import { shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import { itemPart } from '../shared'

const rnd = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

export interface UeberschlagParams {
  mode: 'ungefaehr' | 'pruefen' | 'wahl'
  /** Grade 4: round to full thousands (numbers up to 100 000). */
  tausend?: boolean
}

/** R4-9: easy in the head, or better in writing? Only clear cases. */
export const WAHL = [
  { task: '3000 + 4000', key: 'kopf' },
  { task: '25 000 − 5 000', key: 'kopf' },
  { task: '600 · 3', key: 'kopf' },
  { task: '1000 − 999', key: 'kopf' },
  { task: '4 800 : 4', key: 'kopf' },
  { task: '90 000 + 10 000', key: 'kopf' },
  { task: '48 375 + 29 868', key: 'schriftlich' },
  { task: '70 412 − 38 579', key: 'schriftlich' },
  { task: '3 487 · 6', key: 'schriftlich' },
  { task: '256 · 37', key: 'schriftlich' },
  { task: '9 156 : 7', key: 'schriftlich' },
  { task: '102 345 + 67 989', key: 'schriftlich' },
] as const

export const ueberschlag: ExerciseModule<UeberschlagParams, WahlData> = {
  id: 'rechnen.ueberschlag',
  topic: 'rechnen',

  items(_ctx, params) {
    if (params.mode === 'wahl') return WAHL.map((_, i) => `rechnen.ueberschlag:wahl${i}`)
    return ['+a', '+b', '+c', '-a', '-b', '-c'].map((k) => `rechnen.ueberschlag:${params.mode}${k}`)
  },

  generate(_ctx, params, itemKey, rng) {
    if (params.mode === 'wahl') {
      const w = WAHL[Number(itemPart(itemKey).slice(4))]!
      return {
        instruction: `Wie rechnest du ${w.task} am besten: im Kopf oder schriftlich?`,
        caption: 'Im Kopf oder schriftlich?',
        hint: 'Sind die Zahlen rund und leicht? Dann geht es im Kopf.',
        solution:
          w.key === 'kopf'
            ? 'Das geht gut im Kopf: Die Zahlen sind rund.'
            : 'Hier ist schriftlich sicherer: Die Zahlen sind groß und krumm.',
        data: {
          prompt: w.task,
          correctKey: w.key,
          choices: [
            { key: 'kopf', label: '🧠 im Kopf' },
            { key: 'schriftlich', label: '✍️ schriftlich' },
          ],
        },
      }
    }
    const plus = itemPart(itemKey).includes('+')
    const f = params.tausend ? 10 : 1
    const round100 = (n: number) => Math.round(n / (100 * f)) * 100 * f
    // Numbers near a hundred (a thousand), so rounding is easy: 398, 207, 612 …
    const near = () =>
      rnd(rng, 1, 8) * 100 * f + (rng() < 0.5 ? rnd(rng, 1, 15 * f) : -rnd(rng, 1, 15 * f))
    const word = (n: number) => (n > 1000 ? String(n) : numberWord(n))
    let a = near()
    let b = near()
    if (plus) while (a + b > 1000 * f) b = near()
    else {
      if (a < b) [a, b] = [b, a]
      // Different hundreds, so the estimate is not zero.
      while (round100(a) <= round100(b)) {
        a = near()
        b = near()
        if (a < b) [a, b] = [b, a]
      }
    }
    const exact = plus ? a + b : a - b
    const estimate = plus ? round100(a) + round100(b) : round100(a) - round100(b)
    const task = `${a} ${plus ? '+' : '−'} ${b}`
    const how = `${round100(a)} ${plus ? '+' : '−'} ${round100(b)} = ${estimate}`
    if (params.mode === 'ungefaehr') {
      const wrong = [estimate + 100 * f, estimate - 100 * f, estimate + 200 * f]
        .filter((x) => x >= 0)
        .slice(0, 2)
      return {
        instruction: `Überschlage: Wie viel ist ${word(a)} ${plus ? 'plus' : 'minus'} ${word(b)} ungefähr?`,
        caption: `${task} ist ungefähr …`,
        hint: `Runde beide Zahlen auf volle ${f > 1 ? 'Tausender' : 'Hunderter'}.`,
        solution: `Ungefähr ${estimate}: ${how}. Genau sind es ${exact}.`,
        data: {
          prompt: `${task} ≈ ?`,
          correctKey: String(estimate),
          choices: shuffle([estimate, ...wrong], rng).map((x) => ({
            key: String(x),
            label: String(x),
          })),
        },
      }
    }
    // Plausible: the exact result. Not plausible: off by about a hundred or more.
    const right = rng() < 0.5
    const off = rnd(rng, 2, 4) * 100 * f
    const shown = right ? exact : exact - off >= 0 && rng() < 0.5 ? exact - off : exact + off
    return {
      instruction: `${task} = ${shown}. Kann das stimmen? Mach einen Überschlag.`,
      caption: 'Kann das stimmen?',
      hint: `Runde beide Zahlen auf volle ${f > 1 ? 'Tausender' : 'Hunderter'} und rechne.`,
      solution: right
        ? `Das kann stimmen: ${how}.`
        : `Das kann nicht stimmen: ${how}. Genau sind es ${exact}.`,
      data: {
        prompt: `${task} = ${shown}`,
        correctKey: right ? 'ja' : 'nein',
        choices: [
          { key: 'ja', label: '👍 kann stimmen' },
          { key: 'nein', label: '👎 kann nicht stimmen' },
        ],
      },
    }
  },

  component: WahlTask,
}
