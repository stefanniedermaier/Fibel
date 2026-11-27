/**
 * R2-13 "Sachaufgaben" (Mathematik 1/2, 1.3 and 3.3): a short text to read (it is also
 * read aloud), first the matching calculation, then the result – with plus, minus,
 * mal and geteilt. Mode `pruefen`: "Kann das stimmen?" – is the given answer plausible?
 */
import aufgaben from '@/data/basis/klasse-2/sachaufgaben.json'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemPart } from '../shared'
import SachaufgabenTask from './SachaufgabenTask.vue'

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

export interface SachaufgabenParams {
  mode: 'rechnen' | 'pruefen'
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
    return SACHAUFGABEN.map((s) => `rechnen.sachaufgaben:${params.mode}:${s.id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const id = itemPart(itemKey).split(':')[1]
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
        choices: shuffle([right, ...wrong], rng).map((l) => ({ key: l, label: l })),
      },
    }
  },

  component: SachaufgabenTask,
}
