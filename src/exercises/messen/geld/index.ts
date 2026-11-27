/**
 * M13 "Geld" (Mathematik 1/2, 3.1 and 3.2): euro coins and notes up to 20 €.
 * `erkennen`: "Wie viel Geld ist das?" – a few coins and notes, three amounts to choose.
 * `legen`: "Lege 7 Euro." – the child puts coins and notes into the purse.
 */
import { numberWord } from '@/core/numbers'
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import GeldTask from './GeldTask.vue'

export const PIECES = [1, 2, 5, 10, 20] as const

export interface GeldParams {
  max: number
  mode: 'erkennen' | 'legen'
}

export interface GeldData {
  mode: 'erkennen' | 'legen'
  amount: number
  /** erkennen: the pieces shown. */
  shown: number[]
  choices: { key: string; label: string }[]
  /** legen: the pieces to choose from. */
  pieces: number[]
}

/** A random way to pay `amount` with 1 to 4 pieces (no single piece of exactly the amount). */
export function splitAmount(amount: number, rng: Rng): number[] {
  for (let tries = 0; tries < 50; tries++) {
    const result: number[] = []
    let rest = amount
    while (rest > 0 && result.length < 4) {
      const fits = PIECES.filter((p) => p <= rest && !(p === amount && result.length === 0))
      if (fits.length === 0) break
      const p = pickOne(fits, rng)
      result.push(p)
      rest -= p
    }
    if (rest === 0 && result.length >= 2) return result.sort((a, b) => b - a)
  }
  // Fallback: ones and twos.
  return [...Array(Math.floor(amount / 2)).fill(2), ...(amount % 2 ? [1] : [])]
}

export const geld: ExerciseModule<GeldParams, GeldData> = {
  id: 'messen.geld',
  topic: 'rechnen',

  items(_ctx, params) {
    const keys: string[] = []
    for (let a = 3; a <= params.max; a++) keys.push(`messen.geld:${params.mode}:${a}`)
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    const amount = Number(itemKey.split(':')[2])
    const euro = (n: number) => `${numberWord(n)} Euro`
    if (params.mode === 'legen') {
      return {
        instruction: `Lege ${euro(amount)}. Tippe auf die Münzen und Scheine.`,
        caption: `Lege ${amount} €.`,
        hint: 'Zähle zusammen, was schon im Geldbeutel liegt.',
        solution: `So kann man ${euro(amount)} legen: ${splitAmount(amount, rng).join(' € + ')} €.`,
        data: {
          mode: 'legen',
          amount,
          shown: [],
          choices: [],
          pieces: PIECES.filter((p) => p <= params.max),
        },
      }
    }
    const shown = splitAmount(amount, rng)
    const near = shuffle(
      [amount - 1, amount + 1, amount - 2, amount + 2, amount + 5].filter(
        (x) => x >= 1 && x <= params.max + 5,
      ),
      rng,
    ).slice(0, 2)
    return {
      instruction: 'Wie viel Geld ist das?',
      hint: 'Fang beim größten Schein oder bei der größten Münze an.',
      solution: `Das sind ${euro(amount)}: ${shown.join(' € + ')} €.`,
      data: {
        mode: 'erkennen',
        amount,
        shown,
        choices: [amount, ...near]
          .sort((a, b) => a - b)
          .map((n) => ({ key: String(n), label: `${n} €` })),
        pieces: [],
      },
    }
  },

  component: GeldTask,
}
