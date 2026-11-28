/**
 * R2-13 "Sachaufgaben" (Mathematik 1/2, 1.3 and 3.3): a short text to read (it is also
 * read aloud), first the matching calculation, then the result – with plus, minus,
 * mal and geteilt. Mode `pruefen`: "Kann das stimmen?" – is the given answer plausible?
 */
import aufgaben from '@/data/basis/klasse-2/sachaufgaben.json'
import zweischritt from '@/data/basis/klasse-3/sachaufgaben.json'
import mehrschritt from '@/data/basis/klasse-4/sachaufgaben.json'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import SachaufgabenTask from './SachaufgabenTask.vue'
import { textChoices } from '../../choices'

export type SachOp = '+' | '-' | '·' | ':'

export interface Sachaufgabe {
  id: string
  image: string
  text: string
  op: SachOp
  a: number
  b: number
}

export const SACHAUFGABEN: readonly Sachaufgabe[] = aufgaben as Sachaufgabe[]

export function rechne(op: SachOp, a: number, b: number): number {
  return op === '+' ? a + b : op === '-' ? a - b : op === '·' ? a * b : a / b
}

const shown = (op: SachOp) => (op === '-' ? '−' : op)

/** R3-11: two steps, "a op b op c", worked out from left to right. */
export interface Zweischritt {
  id: string
  image: string
  text: string
  ops: [SachOp, SachOp]
  a: number
  b: number
  c: number
}

export const ZWEISCHRITT: readonly Zweischritt[] = zweischritt as Zweischritt[]

/** The term as written in grade 3: brackets where Punkt vor Strich would change it. */
export function term(ops: readonly [SachOp, SachOp], a: number, b: number, c: number): string {
  const first = `${a} ${shown(ops[0])} ${b}`
  const strich = ops[0] === '+' || ops[0] === '-'
  const punkt = ops[1] === '·' || ops[1] === ':'
  return `${strich && punkt ? `(${first})` : first} ${shown(ops[1])} ${c}`
}

const zweiErgebnis = (ops: readonly [SachOp, SachOp], a: number, b: number, c: number) =>
  rechne(ops[1], rechne(ops[0], a, b), c)

/** R4-11: several steps and working backwards; the terms are written out in the data. */
export interface Mehrschritt {
  id: string
  image: string
  text: string
  richtig: string
  falsch: string[]
  ergebnis: number
  erklaerung: string
}
export const MEHRSCHRITT: readonly Mehrschritt[] = mehrschritt

export interface SachaufgabenParams {
  mode: 'rechnen' | 'pruefen' | 'zweischritt' | 'mehrschritt'
}

export interface SachaufgabenData {
  mode: 'rechnen' | 'pruefen'
  image: string
  text: string
  result: number
  /** rechnen: the calculations; pruefen: ja/nein. */
  choices: { key: string; label: string }[]
  correctKey: string
  /** pruefen: the claimed answer. */
  claim?: string
}

export const sachaufgaben: ExerciseModule<SachaufgabenParams, SachaufgabenData> = {
  id: 'rechnen.sachaufgaben',
  topic: 'rechnen',

  items(_ctx, params) {
    if (params.mode === 'zweischritt')
      return ZWEISCHRITT.map((s) => `rechnen.sachaufgaben:zweischritt:${s.id}`)
    if (params.mode === 'mehrschritt')
      return MEHRSCHRITT.map((s) => `rechnen.sachaufgaben:mehrschritt:${s.id}`)
    return SACHAUFGABEN.map((s) => `rechnen.sachaufgaben:${params.mode}:${s.id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const id = itemPart(itemKey).split(':')[1]
    if (params.mode === 'mehrschritt') {
      const m = MEHRSCHRITT.find((x) => x.id === id)
      if (!m) throw new Error(`Unbekannte Sachaufgabe: ${itemKey}`)
      return {
        instruction: m.text,
        caption: 'Lies die Aufgabe. Welche Rechnung passt?',
        hint: 'Was weißt du? Was ist gesucht? Was rechnest du zuerst?',
        solution: m.erklaerung,
        data: {
          mode: 'rechnen',
          image: m.image,
          text: m.text,
          result: m.ergebnis,
          correctKey: m.richtig,
          choices: textChoices([m.richtig, ...m.falsch], rng),
        },
      }
    }
    if (params.mode === 'zweischritt') {
      const z = ZWEISCHRITT.find((x) => x.id === id)
      if (!z) throw new Error(`Unbekannte Sachaufgabe: ${itemKey}`)
      const text = z.text
        .replace('{a}', String(z.a))
        .replace('{b}', String(z.b))
        .replace('{c}', String(z.c))
      const right = term(z.ops, z.a, z.b, z.c)
      const ok = (r: number) => Number.isInteger(r) && r >= 0
      const ops: SachOp[] = ['+', '-', '·', ':']
      const wrong = shuffle(
        [
          ...ops.map((o) => [o, z.ops[1]] as [SachOp, SachOp]),
          ...ops.map((o) => [z.ops[0], o] as [SachOp, SachOp]),
        ]
          .filter((o) => ok(rechne(o[0], z.a, z.b)) && ok(zweiErgebnis(o, z.a, z.b, z.c)))
          .map((o) => term(o, z.a, z.b, z.c))
          .filter((t, i, all) => t !== right && all.indexOf(t) === i),
        rng,
      ).slice(0, 2)
      const result = zweiErgebnis(z.ops, z.a, z.b, z.c)
      const zwischen = rechne(z.ops[0], z.a, z.b)
      return {
        instruction: text,
        caption: 'Lies die Aufgabe. Welche Rechnung passt? Es sind zwei Schritte.',
        hint: 'Was rechnest du zuerst? Was passiert danach?',
        solution: `Erst ${z.a} ${shown(z.ops[0])} ${z.b} = ${zwischen}, dann ${zwischen} ${shown(z.ops[1])} ${z.c} = ${result}.`,
        data: {
          mode: 'rechnen',
          image: z.image,
          text,
          result,
          correctKey: right,
          choices: textChoices([right, ...wrong], rng),
        },
      }
    }
    const s = SACHAUFGABEN.find((x) => x.id === id)
    if (!s) throw new Error(`Unbekannte Sachaufgabe: ${itemKey}`)
    const text = s.text.replace('{a}', String(s.a)).replace('{b}', String(s.b))
    const result = rechne(s.op, s.a, s.b)
    const right = `${s.a} ${shown(s.op)} ${s.b}`
    if (params.mode === 'pruefen') {
      // Plausible or clearly off: the wrong operation gives a result far away.
      const plausible = rng() < 0.5
      const other: SachOp = { '+': '-', '-': '+', '·': '+', ':': '·' }[s.op] as SachOp
      const claim = plausible ? result : rechne(other, s.a, s.b)
      return {
        instruction: `${text} Jemand sagt: ${claim}. Kann das stimmen?`,
        caption: 'Kann das stimmen?',
        hint: 'Überlege: Wird es mehr oder weniger? Ungefähr wie viel?',
        solution: `${right} = ${result}. ${plausible ? 'Das stimmt.' : `${claim} kann nicht stimmen.`}`,
        data: {
          mode: 'pruefen',
          image: s.image,
          text,
          result,
          claim: String(claim),
          correctKey: plausible ? 'ja' : 'nein',
          choices: [
            { key: 'ja', label: '👍 kann stimmen' },
            { key: 'nein', label: '👎 kann nicht stimmen' },
          ],
        },
      }
    }
    const ops: SachOp[] = ['+', '-', '·', ':']
    const wrong = shuffle(
      ops
        .filter((o) => o !== s.op)
        .filter((o) => Number.isInteger(rechne(o, s.a, s.b)) && rechne(o, s.a, s.b) >= 0)
        .map((o) => `${s.a} ${shown(o)} ${s.b}`),
      rng,
    ).slice(0, 2)
    return {
      instruction: text,
      caption: 'Lies die Aufgabe. Welche Rechnung passt?',
      hint: 'Wird es mehr oder weniger? Kommt etwas dazu, geht etwas weg, oder geht es um gleich viele?',
      solution: `${right} = ${result}.`,
      data: {
        mode: 'rechnen',
        image: s.image,
        text,
        result,
        correctKey: right,
        choices: textChoices([right, ...wrong], rng),
      },
    }
  },

  component: SachaufgabenTask,
}
