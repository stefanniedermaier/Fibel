/**
 * Englisch 3/4 (plaene/klasse-3.md, section 10): own core vocabulary per topic area of
 * the curriculum and short dialogues. English text is spoken with the English voice: in
 * instructions it is marked as [[en:…]] (core/speech.ts).
 */
import dialoge from '@/data/basis/englisch/dialoge.json'
import words from '@/data/basis/englisch/words.json'

export interface EnglishWord {
  id: string
  en: string
  de: string
  /** classroom, farben, zahlen, familie, tiere, schule, faecher. */
  thema: string
  klasse: number
  /** OpenMoji code; numbers without a picture show the digits. */
  image?: string
}

export interface Dialog {
  id: string
  frage: string
  antwort: string
  falsch: string[]
}

export const WORDS: readonly EnglishWord[] = words.woerter
export const DIALOGE: readonly Dialog[] = dialoge

export interface EnglischParams {
  themen: string[]
  /** Highest grade of the words (default: the learner's grade). */
  klasse?: number
}

export function wordsFor(themen: readonly string[], grade: number): EnglishWord[] {
  return WORDS.filter((w) => themen.includes(w.thema) && w.klasse <= grade)
}

export function getWord(id: string): EnglishWord {
  const word = WORDS.find((w) => w.id === id)
  if (!word) throw new Error(`Unbekanntes englisches Wort: ${id}`)
  return word
}

/** How a word looks on a button: its picture, or the digits for numbers. */
export const look = (w: EnglishWord) => w.image ?? (w.thema === 'zahlen' ? w.de : w.en)

export const en = (text: string) => `[[en:${text}]]`

export interface EnglischData {
  /** Shown above the choices: a picture, digits or an English word. */
  prompt?: { image?: string; text?: string }
  correctKey: string
  choices: { key: string; image?: string; label?: string }[]
  /** English labels are spoken when tapped. */
  speakLabels?: boolean
}

/** Up to `n - 1` other words of the same topics that do not look like `word`. */
export function others<T extends EnglishWord>(
  word: T,
  pool: readonly T[],
  n: number,
  pick: (list: T[]) => T[],
): T[] {
  const seen = new Set([look(word), word.en.toLowerCase()])
  const out: T[] = []
  for (const w of pick(pool.filter((x) => x.id !== word.id && x.thema === word.thema))) {
    if (seen.has(look(w)) || seen.has(w.en.toLowerCase())) continue
    seen.add(look(w))
    seen.add(w.en.toLowerCase())
    out.push(w)
    if (out.length === n - 1) break
  }
  return out
}

export const choiceOf = (w: EnglishWord) =>
  w.image ? { key: w.id, image: w.image } : { key: w.id, label: look(w) }
