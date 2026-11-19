/** Rules shared by the arithmetic exercises. */
import { numberWord } from '@/core/numbers'

export type Op = '+' | '-'

export interface Arithmetic {
  a: number
  op: Op
  b: number
  result: number
}

export function compute(a: number, op: Op, b: number): number {
  return op === '+' ? a + b : a - b
}

/**
 * Crossing the ten ("Zehnerübergang"): 8 + 5 or 13 − 5. Reaching it exactly
 * (8 + 2 = 10, 12 − 2 = 10) does not count.
 */
export function crossesTen({ a, op, result }: Arithmetic): boolean {
  return op === '+' ? a < 10 && result > 10 : a > 10 && result < 10
}

export function parseArithmetic(text: string): Arithmetic {
  const match = /^(\d+)([+-])(\d+)$/.exec(text)
  if (!match) throw new Error(`Ungültige Rechenaufgabe: ${text}`)
  const a = Number(match[1])
  const op = match[2] as Op
  const b = Number(match[3])
  return { a, op, b, result: compute(a, op, b) }
}

/** "3+4" → "drei plus vier" – the TTS never has to guess. */
export function spokenArithmetic({ a, op, b }: Arithmetic): string {
  return `${numberWord(a)} ${op === '+' ? 'plus' : 'minus'} ${numberWord(b)}`
}

/** Display with a real minus sign. */
export function shownOp(op: Op): string {
  return op === '+' ? '+' : '−'
}

/** The part after the colon of an item key. */
export function itemPart(itemKey: string): string {
  return itemKey.slice(itemKey.indexOf(':') + 1)
}
