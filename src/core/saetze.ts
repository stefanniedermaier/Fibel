/**
 * Sentences for reading in grade 1 (plaene/klasse-1-abgleich.md, Q3). Every word of a
 * sentence is a dictionary word or a Merkwort, so a sentence can be read as soon as all
 * its words are readable – it grows with the unlocked letters like the words do.
 */
import type { LandCode, ProfileSettings, Word } from './types'
import { resolveWords, wordsForSettings } from './words'

export interface Sentence {
  id: string
  /** With the full stop, e.g. "Oma malt." */
  text: string
  /** Sentences of one group share a pattern; their pictures are the distractors. */
  group: string
  /** OpenMoji codes shown side by side as the picture of the sentence. */
  scene: string[]
}

/** A token of a sentence with the syllables for colouring. */
export interface SentenceToken {
  text: string
  syllables: string[]
  merkwort: boolean
}

const FILES = import.meta.glob<Sentence[]>('../data/basis/klasse-*/saetze.json', {
  eager: true,
  import: 'default',
})

export function baseSentences(grade: number): Sentence[] {
  return FILES[`../data/basis/klasse-${grade}/saetze.json`] ?? []
}

/** "Da ist ein Hase." → ["Da", "ist", "ein", "Hase"] (punctuation dropped). */
export function wordsOf(text: string): string[] {
  return text
    .replace(/[.,!?;:„“"]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 0)
}

function byText(words: readonly Word[]): Map<string, Word> {
  const map = new Map<string, Word>()
  for (const w of words) if (!map.has(w.text.toLowerCase())) map.set(w.text.toLowerCase(), w)
  return map
}

/** Words of the sentence that are missing in the dictionary (for the data check). */
export function unknownWords(sentence: Sentence, words: readonly Word[]): string[] {
  const known = byText(words)
  return wordsOf(sentence.text).filter((t) => !known.has(t.toLowerCase()))
}

/** Sentences whose words are all readable with the unlocked letters. */
export function readableSentences(
  land: LandCode,
  grade: number,
  settings: ProfileSettings,
): Sentence[] {
  const readable = byText(wordsForSettings(resolveWords(land, grade), settings))
  return baseSentences(grade).filter((s) =>
    wordsOf(s.text).every((t) => readable.has(t.toLowerCase())),
  )
}

/** Tokens with syllables; the sentence's punctuation sticks to the last word. */
export function sentenceTokens(sentence: Sentence, words: readonly Word[]): SentenceToken[] {
  const known = byText(words)
  const tokens = sentence.text.split(/\s+/)
  return tokens.map((raw) => {
    const bare = raw.replace(/[.,!?;:]/g, '')
    const punct = raw.slice(bare.length)
    const word = known.get(bare.toLowerCase())
    const syllables = word ? syllablesIn(bare, word.syllables) : [bare]
    if (punct) syllables[syllables.length - 1] += punct
    return { text: raw, syllables, merkwort: !!word?.merkwort }
  })
}

/** The dictionary's syllables with the case of the sentence ("Da" vs. "da"). */
function syllablesIn(token: string, syllables: readonly string[]): string[] {
  const result: string[] = []
  let i = 0
  for (const s of syllables) {
    result.push(token.slice(i, i + s.length))
    i += s.length
  }
  return result
}

export const sceneKey = (s: Sentence) => s.scene.join(' ')
