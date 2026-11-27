/** Sentences for the language exercises: statements (saetze.json) and questions. */
import fragen from '@/data/basis/klasse-1/fragesaetze.json'
import sprache2 from '@/data/basis/klasse-2/sprache.json'
import { baseSentences, textReadable } from '@/core/saetze'
import type { LearnerContext } from '../types'

export interface PlainSentence {
  id: string
  text: string
}

export const FRAGESAETZE: readonly PlainSentence[] = fragen
/** Grade 2: questions and exclamations (SP2-7). */
export const SATZARTEN_2: readonly PlainSentence[] = sprache2.satzarten

const extra = (grade: number) => (grade === 1 ? FRAGESAETZE : grade === 2 ? SATZARTEN_2 : [])

/** All readable sentences: statements and questions. */
export function readablePlain(ctx: LearnerContext): PlainSentence[] {
  const all = [...baseSentences(ctx.grade), ...extra(ctx.grade)]
  return all.filter((s) => textReadable(s.text, ctx.land, ctx.grade, ctx.settings))
}

export function findPlain(ctx: LearnerContext, id: string): PlainSentence {
  const s = [...baseSentences(ctx.grade), ...extra(ctx.grade)].find((x) => x.id === id)
  if (!s) throw new Error(`Unbekannter Satz: ${id}`)
  return s
}
