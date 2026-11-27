/**
 * R4-10 "Teiler, Vielfache und Muster" (Mathematik 3/4, 1.1 and 1.2: "Teiler und
 * Vielfache", "arithmetische Muster wie ANNA-Zahlen"):
 * - `teiler`: which number divides 36 without remainder?
 * - `vielfache`: which number is a multiple of 7?
 * - `folge`: how does the sequence go on (3, 6, 12, 24, …)?
 * - `anna`: ANNA numbers (4554) and their difference with the reversed number.
 */
import { pickOne, shuffle, type Rng } from '@/core/random'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule } from '../types'

export interface TeilerParams {
  mode: 'teiler' | 'vielfache' | 'folge' | 'anna'
}

const ZAHLEN = [12, 18, 24, 30, 36, 42, 45, 48, 56, 60, 63, 72, 81, 84, 90, 96]
const REIHEN = [3, 4, 6, 7, 8, 9, 11, 12, 15, 25]

/** Sequences: start, rule and its name. */
export const FOLGEN: { id: string; zahlen: number[]; regel: string }[] = [
  { id: 'mal2', zahlen: [3, 6, 12, 24, 48], regel: 'Jede Zahl ist das Doppelte der vorigen.' },
  { id: 'plus25', zahlen: [125, 150, 175, 200, 225], regel: 'Es kommt immer 25 dazu.' },
  { id: 'minus7', zahlen: [100, 93, 86, 79, 72], regel: 'Es werden immer 7 weniger.' },
  {
    id: 'plus-wachsend',
    zahlen: [1, 2, 4, 7, 11],
    regel: 'Es kommt immer eins mehr dazu: +1, +2, +3, +4.',
  },
  { id: 'mal10', zahlen: [4, 40, 400, 4000, 40000], regel: 'Jede Zahl ist zehnmal so groß.' },
  {
    id: 'halbe',
    zahlen: [6400, 3200, 1600, 800, 400],
    regel: 'Jede Zahl ist die Hälfte der vorigen.',
  },
  {
    id: 'quadrat',
    zahlen: [1, 4, 9, 16, 25],
    regel: 'Es sind die Malaufgaben 1 · 1, 2 · 2, 3 · 3 und so weiter.',
  },
  { id: 'plus1000', zahlen: [2500, 3500, 4500, 5500, 6500], regel: 'Es kommt immer 1000 dazu.' },
]

const teiler = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)

function wahl(right: number, wrong: number[], rng: Rng) {
  const others = [...new Set(wrong)].filter((x) => x !== right)
  return shuffle([right, ...shuffle(others, rng).slice(0, 2)], rng).map((x) => ({
    key: String(x),
    label: String(x),
  }))
}

export const teilerModul: ExerciseModule<TeilerParams, WahlData> = {
  id: 'rechnen.teiler',
  topic: 'rechnen',

  items(_ctx, params) {
    if (params.mode === 'folge') return FOLGEN.map((f) => `rechnen.teiler:folge:${f.id}`)
    if (params.mode === 'vielfache') return REIHEN.map((n) => `rechnen.teiler:vielfache:${n}`)
    if (params.mode === 'anna')
      return ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => `rechnen.teiler:anna:${k}`)
    return ZAHLEN.map((n) => `rechnen.teiler:teiler:${n}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const id = itemKey.split(':')[2]!
    if (params.mode === 'teiler') {
      const n = Number(id)
      const ts = teiler(n).filter((d) => d > 1 && d < n)
      const right = pickOne(ts, rng)
      const wrong = Array.from({ length: 12 }, (_, i) => i + 2).filter((d) => n % d !== 0)
      return {
        instruction: `Welche Zahl ist ein Teiler von ${n}? Sie geht ohne Rest auf.`,
        caption: `Welche Zahl ist ein Teiler von ${n}?`,
        hint: 'Prüfe mit dem Einmaleins: Geht die Zahl ohne Rest auf?',
        solution: `${n} geteilt durch ${right} ist ${n / right}. Die Teiler von ${n} sind ${teiler(n).join(', ')}.`,
        data: {
          prompt: `${n} : ? = ohne Rest`,
          correctKey: String(right),
          choices: wahl(right, wrong, rng),
        },
      }
    }
    if (params.mode === 'vielfache') {
      const n = Number(id)
      const right = n * (2 + Math.floor(rng() * 8))
      const wrong = [right + 1, right - 1, right + Math.ceil(n / 2), right + 2, right + 3].filter(
        (x) => x % n !== 0,
      )
      return {
        instruction: `Welche Zahl ist ein Vielfaches von ${n}?`,
        hint: `Denk an die Reihe: ${n}, ${2 * n}, ${3 * n} …`,
        solution: `${right} ist ${right / n} mal ${n}.`,
        data: {
          prompt: `${n}, ${2 * n}, ${3 * n}, …`,
          correctKey: String(right),
          choices: wahl(right, wrong, rng),
        },
      }
    }
    if (params.mode === 'folge') {
      const f = FOLGEN.find((x) => x.id === id)!
      const right = f.zahlen[4]!
      const prev = f.zahlen[3]!
      const d = prev - f.zahlen[2]!
      const wrong = [prev + d, right + d, prev * 2, right + 1, right - 1].filter(
        (x) => x !== right && x > 0,
      )
      return {
        instruction: 'Wie geht die Zahlenfolge weiter?',
        hint: 'Wie kommst du von einer Zahl zur nächsten?',
        solution: `Die nächste Zahl ist ${right}. ${f.regel}`,
        data: {
          prompt: `${f.zahlen.slice(0, 4).join(', ')}, ?`,
          correctKey: String(right),
          choices: wahl(right, [...new Set(wrong)], rng),
        },
      }
    }
    // ANNA: a number that reads the same backwards (abba).
    const a = 1 + Math.floor(rng() * 9)
    let b = Math.floor(rng() * 10)
    if (b === a) b = (b + 1) % 10
    const anna = Number(`${a}${b}${b}${a}`)
    const palindrom = (x: number) => String(x) === String(x).split('').reverse().join('')
    const wrong = [
      Number(`${a}${b}${a}${b}`),
      Number(`${a}${a}${b}${b}`),
      Number(`${a}${b}${b}${(a % 9) + 1}`),
    ].filter((x) => !palindrom(x))
    return {
      instruction:
        'Welche Zahl ist eine ANNA-Zahl? Man kann sie vorwärts und rückwärts gleich lesen.',
      caption: 'Welche Zahl ist eine ANNA-Zahl?',
      hint: 'Lies die Zahl rückwärts. Bleibt sie gleich?',
      solution: `${anna} ist eine ANNA-Zahl: rückwärts gelesen wieder ${anna}.`,
      data: { correctKey: String(anna), choices: wahl(anna, wrong, rng) },
    }
  },

  component: WahlTask,
}
