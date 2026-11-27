/** Sentences for the language exercises: statements (saetze.json) and questions. */
import fragen from '@/data/basis/klasse-1/fragesaetze.json'
import { baseSentences, textReadable } from '@/core/saetze'
import type { LearnerContext } from '../types'

export interface PlainSentence {
  id: string
  text: string
}

export const FRAGESAETZE: readonly PlainSentence[] = fragen

/** All readable sentences: statements and questions. */
export function readablePlain(ctx: LearnerContext): PlainSentence[] {
  const all = [...baseSentences(ctx.grade), ...(ctx.grade === 1 ? FRAGESAETZE : [])]
  return all.filter((s) => textReadable(s.text, ctx.land, ctx.grade, ctx.settings))
}

export function findPlain(ctx: LearnerContext, id: string): PlainSentence {
  const s = [...baseSentences(ctx.grade), ...FRAGESAETZE].find((x) => x.id === id)
  if (!s) throw new Error(`Unbekannter Satz: ${id}`)
  return s
}
