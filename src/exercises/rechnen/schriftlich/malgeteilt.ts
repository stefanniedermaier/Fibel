/**
 * R4-6 to R4-8 "Schriftlich multiplizieren und dividieren" (Mathematik 3/4, 1.2:
 * "Multiplikation (ein- und zweistellige Multiplikatoren) und Division (Divisoren bis
 * einschließlich 10, auch mit Rest)").
 * The calculation is laid out on a grid of boxes as in the exercise book. The child taps
 * the digits one after another; after a mistake only this step is explained.
 * Multiplication with two digits: first times the tens digit (ending under it), then
 * times the ones digit (ending under it), then add.
 * Division: the child taps the digits of the result; the working below (product,
 * difference, next digit brought down) appears after each digit.
 */
import { numberWord } from '@/core/numbers'
import type { Rng } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import ZiffernTask from './ZiffernTask.vue'

/** A box of the grid: row and column from the top left. */
export interface Feld {
  row: number
  col: number
}

/** A digit the child taps, with what to say after a mistake. */
export interface Schritt extends Feld {
  digit: number
  explanation: string
  /** Small digit carried (in the box of the next column), shown once this step is done. */
  carry?: Feld & { value: number }
  /** Boxes that appear once this step is done (division: the working). */
  show?: (Feld & { text: string })[]
}

export interface ZiffernData {
  rows: number
  cols: number
  /** Always visible: the task. */
  fixed: (Feld & { text: string })[]
  steps: Schritt[]
  /** Lines under these rows (sums, differences). */
  lines: { row: number; from: number; to: number }[]
  result: string
}

const digitsR = (n: number) => String(n).split('').reverse().map(Number)
const w = numberWord

/** One partial product a · m, written so that its last digit is in column `end`. */
function product(a: number, m: number, row: number, end: number): Schritt[] {
  const steps: Schritt[] = []
  const ad = digitsR(a)
  let carry = 0
  const r = digitsR(a * m)
  for (let i = 0; i < r.length; i++) {
    const col = end - i
    let explanation: string
    if (i < ad.length) {
      const p = m * ad[i]!
      const total = p + carry
      explanation = `${w(m)} mal ${w(ad[i]!)} ist ${w(p)}${carry ? `, plus ${w(carry)} ist ${w(total)}` : ''}.`
      carry = Math.floor(total / 10)
      explanation +=
        i === ad.length - 1
          ? ` Schreibe ${w(total)}.`
          : ` Schreibe ${w(total % 10)}${carry ? `, merke ${w(carry)}` : ''}.`
    } else explanation = `Schreibe noch die ${w(r[i]!)} vorne hin.`
    steps.push({
      row,
      col,
      digit: r[i]!,
      explanation,
      ...(i < ad.length - 1 && carry ? { carry: { row, col: col - 1, value: carry } } : {}),
    })
    if (i >= ad.length - 1) carry = 0
  }
  return steps
}

/** Column sum of numbers that end in given columns (two-digit multiplication). */
function summe(parts: { n: number; end: number }[], row: number, end: number): Schritt[] {
  const total = parts.reduce((s, p) => s + p.n * 10 ** (end - p.end), 0)
  const steps: Schritt[] = []
  let carry = 0
  digitsR(total).forEach((d, i) => {
    const col = end - i
    const ds = parts
      .map((p) => {
        const k = p.end - col
        return k >= 0 && 10 ** k <= p.n ? Math.floor(p.n / 10 ** k) % 10 : undefined
      })
      .filter((x): x is number => x !== undefined)
    const s = ds.reduce((a, b) => a + b, 0) + carry
    const said = [...ds, ...(carry ? [carry] : [])]
    steps.push({
      row,
      col,
      digit: d,
      explanation:
        said.length > 1
          ? `${said.map(w).join(' plus ')} ist ${w(s)}. Schreibe ${w(s % 10)}.`
          : `Hier steht nur ${w(s)}. Schreibe ${w(s % 10)}.`,
      ...(Math.floor(s / 10) ? { carry: { row, col: col - 1, value: Math.floor(s / 10) } } : {}),
    })
    carry = Math.floor(s / 10)
  })
  return steps
}

export function malLayout(a: number, b: number): ZiffernData {
  const task = `${a}·${b}`
  const bd = String(b).length
  const parts =
    bd === 1
      ? [{ n: a * b, m: b, end: task.length - 1 }]
      : String(b)
          .split('')
          .map((m, i) => ({ n: a * Number(m), m: Number(m), end: task.length - bd + i }))
  // Shift right if a partial product is longer than the space under the task.
  const longest = Math.max(
    ...parts.map((p) => String(p.n).length - p.end - 1),
    String(a * b).length - task.length,
  )
  const off = Math.max(0, longest)
  const fixed = task.split('').map((c, col) => ({ row: 0, col: col + off, text: c }))
  let steps: Schritt[] = []
  parts.forEach((p, i) => (steps = steps.concat(product(a, p.m, 1 + i, p.end + off))))
  const lines: ZiffernData['lines'] = [{ row: 0, from: 0, to: task.length + off - 1 }]
  let rows = 2
  if (bd > 1) {
    const sumRow = 1 + parts.length
    steps = steps.concat(
      summe(
        parts.map((p) => ({ n: p.n, end: p.end + off })),
        sumRow,
        task.length - 1 + off,
      ),
    )
    lines.push({ row: sumRow - 1, from: 0, to: task.length + off - 1 })
    rows = sumRow + 1
  }
  return { rows, cols: task.length + off, fixed, steps, lines, result: String(a * b) }
}

export function geteiltLayout(a: number, b: number): ZiffernData {
  const ad = String(a).split('').map(Number)
  const n = ad.length
  const q = Math.floor(a / b)
  const rest = a % b
  const qd = String(q).split('').map(Number)
  const fixed: ZiffernData['fixed'] = [
    ...ad.map((d, col) => ({ row: 0, col, text: String(d) })),
    { row: 0, col: n, text: ':' },
    { row: 0, col: n + 1, text: String(b) },
    { row: 0, col: n + 2, text: '=' },
  ]
  const steps: Schritt[] = []
  const lines: ZiffernData['lines'] = []
  // First part: as many digits as needed so that b fits.
  let pos = 0
  let cur = ad[0]!
  while (cur < b && pos < n - 1) cur = cur * 10 + ad[++pos]!
  let row = 1
  qd.forEach((digit, j) => {
    const p = digit * b
    const diff = cur - p
    const show: Schritt['show'] = []
    // Product under the current number, ending at column pos, with a minus sign.
    String(p)
      .padStart(String(cur).length, ' ')
      .split('')
      .forEach((c, k, all) => {
        if (c !== ' ') show.push({ row, col: pos - (all.length - 1 - k), text: c })
      })
    show.push({ row, col: pos - String(cur).length, text: '−' })
    lines.push({ row, from: pos - String(cur).length + 1, to: pos })
    const next = pos + 1 < n ? ad[pos + 1]! : undefined
    const shownDiff = next !== undefined ? `${diff}${next}` : String(diff)
    shownDiff
      .split('')
      .forEach((c, k) =>
        show.push({ row: row + 1, col: pos - String(diff).length + 1 + k, text: c }),
      )
    const said =
      cur < b
        ? `${w(b)} passt in ${w(cur)} null mal. Schreibe null.`
        : `Wie oft passt ${w(b)} in ${w(cur)}? ${w(digit)} mal, denn ${w(digit)} mal ${w(b)} ist ${w(p)}. Rest ${w(diff)}.`
    steps.push({
      row: 0,
      col: n + 3 + j,
      digit,
      explanation: next !== undefined ? `${said} Hole die ${w(next)} herunter.` : said,
      show,
    })
    if (next !== undefined) {
      cur = diff * 10 + next
      pos++
      row += 2
    }
  })
  const fixedRest: ZiffernData['fixed'] = []
  if (rest > 0) {
    fixedRest.push({ row: 0, col: n + 3 + qd.length, text: 'R' })
    steps.push({
      row: 0,
      col: n + 4 + qd.length,
      digit: rest,
      explanation: `Es bleibt ein Rest von ${w(rest)}. Schreibe ihn hinter das R.`,
    })
  }
  // One column on the left for the minus signs.
  const r = <T extends Feld>(f: T): T => ({ ...f, col: f.col + 1 })
  return {
    rows: row + 2,
    cols: n + 4 + qd.length + (rest > 0 ? 2 : 0),
    fixed: [...fixed, ...fixedRest].map(r),
    steps: steps.map((s) => ({ ...r(s), ...(s.show ? { show: s.show.map(r) } : {}) })),
    lines: lines.map((l) => ({ ...l, from: l.from + 1, to: l.to + 1 })),
    result: rest ? `${q} R ${rest}` : String(q),
  }
}

const rnd = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

export interface MalGeteiltParams {
  /** 'mal1': one-digit multiplier, 'mal2': two digits, 'geteilt': divisor 2 to 9. */
  art: 'mal1' | 'mal2' | 'geteilt'
}

export interface MalGeteiltData extends ZiffernData {
  task: string
}

const KINDS: Record<MalGeteiltParams['art'], string[]> = {
  mal1: ['klein', 'gross', 'null'],
  mal2: ['zwei', 'drei'],
  geteilt: ['glatt', 'rest', 'null'],
}

export function aufgabe(art: MalGeteiltParams['art'], kind: string, rng: Rng): [number, number] {
  if (art === 'mal1') {
    if (kind === 'null')
      return [rnd(rng, 1, 9) * 1000 + rnd(rng, 1, 9) * 10 + rnd(rng, 0, 9), rnd(rng, 3, 9)]
    return [kind === 'klein' ? rnd(rng, 112, 999) : rnd(rng, 1012, 9999), rnd(rng, 2, 9)]
  }
  if (art === 'mal2')
    return [
      kind === 'zwei' ? rnd(rng, 12, 99) : rnd(rng, 102, 999),
      rnd(rng, 1, 9) * 10 + rnd(rng, 1, 9),
    ]
  const b = rnd(rng, 2, 9)
  if (kind === 'null') {
    // A zero inside the result: 9156 : 7 = 1308.
    const q = rnd(rng, 1, 9) * 1000 + rnd(rng, 1, 9) * 100 + rnd(rng, 1, 9)
    return [q * b, b]
  }
  const q = rnd(rng, 112, 1999)
  return [q * b + (kind === 'rest' ? rnd(rng, 1, b - 1) : 0), b]
}

export const malGeteilt: ExerciseModule<MalGeteiltParams, MalGeteiltData> = {
  id: 'rechnen.schriftlich-malgeteilt',
  topic: 'rechnen',

  items(_ctx, params) {
    return KINDS[params.art].flatMap((k) =>
      ['a', 'b', 'c'].map((x) => `rechnen.schriftlich-malgeteilt:${params.art}-${k}-${x}`),
    )
  },

  generate(_ctx, params, itemKey, rng) {
    const kind = itemPart(itemKey).split('-')[1]!
    const [a, b] = aufgabe(params.art, kind, rng)
    const mal = params.art !== 'geteilt'
    const layout = mal ? malLayout(a, b) : geteiltLayout(a, b)
    const task = `${a} ${mal ? '·' : ':'} ${b}`
    return {
      instruction: `Rechne schriftlich: ${task}.${mal ? ' Fang rechts an.' : ' Fang links an.'}`,
      caption: mal
        ? 'Rechne schriftlich. Fang rechts an.'
        : 'Rechne schriftlich. Fang links an: Wie oft passt die Zahl hinein?',
      hint: mal
        ? 'Rechne Ziffer für Ziffer von rechts nach links und denk an den Übertrag.'
        : 'Nimm so viele Ziffern, bis die Zahl hineinpasst.',
      solution: `${task} = ${layout.result}.`,
      data: { ...layout, task },
    }
  },

  component: ZiffernTask,
}
