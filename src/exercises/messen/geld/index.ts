/**
 * M13 "Geld" (Mathematik 1/2, 3.1 and 3.2): euro coins and notes, from grade 2 up to
 * 100 € and also cent (M2-1 to M2-3).
 * `erkennen`: "Wie viel Geld ist das?" – a few coins and notes, three amounts to choose.
 * `legen`: "Lege 7 Euro." – the child puts coins and notes into the purse.
 * `wechseln`: "Wie viele 2-€-Münzen sind 10 €?" · `einkaufen`: change after paying.
 */
import { numberWord } from '@/core/numbers'
import { pickOne, shuffle, type Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import GeldTask from './GeldTask.vue'

export const PIECES = [1, 2, 5, 10, 20] as const
/** Grade 2: up to 100 € with the 50 € note, and the cent coins. */
export const PIECES_100 = [1, 2, 5, 10, 20, 50] as const

export interface GeldParams {
  max: number
  mode: 'erkennen' | 'legen' | 'wechseln' | 'einkaufen'
  /** Amounts in cent (coins 1 ct to 50 ct). */
  cent?: boolean
}

export interface GeldData {
  mode: 'erkennen' | 'legen' | 'wechseln' | 'einkaufen'
  cent: boolean
  /** Answer key when it is not the amount (wechseln: the number of pieces). */
  correctKey?: string
  /** Shown above the pieces (einkaufen: what is bought). */
  question?: string
  amount: number
  /** erkennen: the pieces shown. */
  shown: number[]
  choices: { key: string; label: string }[]
  /** legen: the pieces to choose from. */
  pieces: number[]
}

/** A random way to pay `amount` with 1 to 4 pieces (no single piece of exactly the amount). */
export function splitAmount(
  amount: number,
  rng: Rng,
  pieces: readonly number[] = PIECES,
  most = amount > 20 ? 6 : 4,
): number[] {
  for (let tries = 0; tries < 80; tries++) {
    const result: number[] = []
    let rest = amount
    while (rest > 0 && result.length < most) {
      const fits = pieces.filter((p) => p <= rest && !(p === amount && result.length === 0))
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
    if (params.mode === 'wechseln') {
      for (const big of [2, 5, 10, 20, 50, 100].filter((b) => b <= params.max))
        for (const small of PIECES_100)
          if (small < big && big % small === 0 && big / small <= 10)
            keys.push(`messen.geld:wechseln:${big}-${small}`)
      return keys
    }
    if (params.mode === 'einkaufen') {
      for (const bill of [5, 10, 20, 50].filter((b) => b <= params.max))
        for (let price = 1; price < bill; price += bill > 10 ? 3 : 1)
          keys.push(`messen.geld:einkaufen:${bill}-${price}`)
      return keys
    }
    // Up to 100 in steps, so the list stays manageable.
    const step = params.max > 20 ? 3 : 1
    for (let a = 3; a <= params.max; a += step) keys.push(`messen.geld:${params.mode}:${a}`)
    return keys
  },

  generate(_ctx, params, itemKey, rng) {
    const cent = !!params.cent
    const pieces = params.max > 20 || cent ? PIECES_100 : PIECES
    const unit = cent ? 'ct' : '€'
    if (params.mode === 'wechseln') {
      const [big, small] = itemKey.split(':')[2]!.split('-').map(Number) as [number, number]
      const n = big / small
      const near = shuffle(
        [n - 1, n + 1, n + 2, n * 2].filter(
          (x, i, all) => x > 0 && x !== n && all.indexOf(x) === i,
        ),
        rng,
      ).slice(0, 2)
      const name = (v: number) => (v >= 5 ? `${v}-Euro-Schein` : `${v}-Euro-Münze`)
      return {
        instruction: `Du wechselst ${big >= 5 ? 'den' : 'die'} ${name(big)}. Wie viele ${small >= 5 ? `${small}-Euro-Scheine` : `${small}-Euro-Münzen`} bekommst du?`,
        caption: `${big} € = ? × ${small} €`,
        hint: `Zähle in ${numberWord(small)}er-Schritten bis ${numberWord(big)}.`,
        solution: `${numberWord(big)} Euro sind ${numberWord(n)} mal ${numberWord(small)} Euro.`,
        data: {
          mode: 'wechseln',
          cent,
          amount: big,
          shown: [big],
          correctKey: String(n),
          choices: [n, ...near]
            .sort((a, b) => a - b)
            .map((x) => ({ key: String(x), label: `${x} ×` })),
          pieces: [small],
        },
      }
    }
    if (params.mode === 'einkaufen') {
      const [bill, price] = itemKey.split(':')[2]!.split('-').map(Number) as [number, number]
      const back = bill - price
      const thing = pickOne(['Das Buch', 'Die Mütze', 'Der Ball', 'Das Spiel', 'Die Puppe'], rng)
      const near = shuffle(
        [back - 1, back + 1, price, back + 2].filter(
          (x, i, all) => x > 0 && x !== back && all.indexOf(x) === i,
        ),
        rng,
      ).slice(0, 2)
      return {
        instruction: `${thing} kostet ${price === 1 ? 'einen' : numberWord(price)} Euro. Du bezahlst mit diesem Schein. Wie viel Geld bekommst du zurück?`,
        caption: `${thing} kostet ${price} €. Wie viel bekommst du zurück?`,
        hint: `Rechne: ${numberWord(bill)} minus ${numberWord(price)}.`,
        solution: `Du bekommst ${numberWord(back)} Euro zurück.`,
        data: {
          mode: 'einkaufen',
          cent,
          amount: back,
          question: `${thing}: ${price} €`,
          shown: [bill],
          choices: [back, ...near]
            .sort((a, b) => a - b)
            .map((x) => ({ key: String(x), label: `${x} €` })),
          pieces: [],
        },
      }
    }
    const amount = Number(itemKey.split(':')[2])
    const euro = (n: number) => `${numberWord(n)} ${cent ? 'Cent' : 'Euro'}`
    if (params.mode === 'legen') {
      return {
        instruction: `Lege ${euro(amount)}. Tippe auf die Münzen und Scheine.`,
        caption: `Lege ${amount} ${unit}.`,
        hint: 'Zähle zusammen, was schon im Geldbeutel liegt.',
        solution: `So kann man ${euro(amount)} legen: ${splitAmount(amount, rng, pieces).join(` ${unit} + `)} ${unit}.`,
        data: {
          mode: 'legen',
          cent,
          amount,
          shown: [],
          choices: [],
          pieces: pieces.filter((p) => p <= params.max),
        },
      }
    }
    const shown = splitAmount(amount, rng, pieces)
    const near = shuffle(
      [amount - 1, amount + 1, amount - 2, amount + 2, amount + 5].filter(
        (x) => x >= 1 && x <= params.max + 5,
      ),
      rng,
    ).slice(0, 2)
    return {
      instruction: 'Wie viel Geld ist das?',
      hint: 'Fang beim größten Schein oder bei der größten Münze an.',
      solution: `Das sind ${euro(amount)}: ${shown.join(` ${unit} + `)} ${unit}.`,
      data: {
        mode: 'erkennen',
        cent,
        amount,
        shown,
        choices: [amount, ...near]
          .sort((a, b) => a - b)
          .map((n) => ({ key: String(n), label: `${n} ${unit}` })),
        pieces: [],
      },
    }
  },

  component: GeldTask,
}
