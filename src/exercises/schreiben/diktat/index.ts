/**
 * "Diktat": a word is spoken, the child types it without a picture or boxes.
 * `source: 'merkwoerter'` – the Merkwörter (und, der, die …) with a short example;
 * `source: 'lernwoerter'` – the words of the week the parents typed in (D9).
 */
import type { Word } from '@/core/types'
import diktatSaetze from '@/data/basis/klasse-3/diktat.json'

/** S3-8 Satz-Diktat: sentences made of words of the basic vocabulary 3/4. */
export const DIKTAT_SAETZE: readonly { id: string; text: string }[] = diktatSaetze
import type { ExerciseModule, LearnerContext } from '../../types'
import { readableWords } from '../../lesen/shared'
import { itemId } from '../shared'
import { type TippenData } from '../tippen'
import TippenTask from '../tippen/TippenTask.vue'

export interface DiktatParams {
  /** 'haeufig': the frequent words of grade 2 (S2-9), with an example phrase. */
  source: 'merkwoerter' | 'lernwoerter' | 'haeufig' | 'saetze'
  wordGrade?: number
}

/** Lernwörter as the parents typed them: only letters, trimmed, no doubles. */
export function cleanLernwoerter(list: readonly string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of list) {
    const w = raw.trim().replace(/[^\p{L}-]/gu, '')
    if (w.length < 2 || w.length > 14 || seen.has(w.toLowerCase())) continue
    seen.add(w.toLowerCase())
    result.push(w)
  }
  return result
}

/** Item part for a Lernwort: lower case, safe for the item key. */
export const lernwortKey = (w: string) => w.toLowerCase()

export function merkwoerter(ctx: LearnerContext, params: DiktatParams): Word[] {
  return readableWords(ctx, params).filter((w) => w.merkwort)
}

interface DiktatWord {
  key: string
  text: string
  spoken: string
}

function words(ctx: LearnerContext, params: DiktatParams): DiktatWord[] {
  if (params.source === 'saetze')
    return DIKTAT_SAETZE.map((s) => ({ key: s.id, text: s.text, spoken: s.text }))
  if (params.source === 'lernwoerter') {
    return cleanLernwoerter(ctx.settings.lernwoerter ?? []).map((w) => ({
      key: lernwortKey(w),
      text: w,
      spoken: w,
    }))
  }
  const list =
    params.source === 'haeufig'
      ? readableWords(ctx, params).filter((w) => w.schwerpunkt === 'haeufig')
      : merkwoerter(ctx, params)
  return list.map((w) => ({
    key: w.id,
    text: w.text,
    spoken: w.beispiel ? `${w.text}. ${w.beispiel}` : w.text,
  }))
}

export const diktat: ExerciseModule<DiktatParams, TippenData> = {
  id: 'schreiben.diktat',
  topic: 'schreiben',

  items(ctx, params) {
    return words(ctx, params).map((w) => `schreiben.diktat:${params.source}:${w.key}`)
  },

  generate(ctx, params, itemKey) {
    const key = itemId(itemKey).slice(params.source.length + 1)
    const word = words(ctx, params).find((w) => w.key === key)
    if (!word) throw new Error(`Unbekanntes Wort im Diktat: ${itemKey}`)
    const capital = word.text.charAt(0) !== word.text.charAt(0).toLowerCase()
    return {
      instruction:
        params.source === 'saetze'
          ? `Schreibe den Satz: ${word.spoken}`
          : `Schreibe: ${word.spoken}`,
      caption:
        params.source === 'saetze'
          ? 'Hör zu und schreibe den Satz. Denk an Großschreibung und Satzzeichen.'
          : 'Hör zu und schreibe das Wort.',
      hint:
        params.source === 'lernwoerter' ? undefined : 'Das ist ein Merkwort. Denk an das Wortbild.',
      solution: `So schreibt man ${word.text}.`,
      data: {
        spoken: word.spoken,
        target: word.text,
        strictCase: params.source === 'saetze' || ctx.settings.strictCase,
        autoCapitalize: params.source !== 'saetze' && !ctx.settings.strictCase && capital,
        slots: false,
        sentence: params.source === 'saetze',
      },
    }
  },

  component: TippenTask,
}
