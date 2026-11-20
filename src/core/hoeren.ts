/**
 * Listening vocabulary: picture words that are only heard, never read – so they need
 * not be lauttreu (Hund, Kuh, Sonne …). Together with the reading words that have a
 * picture they form the pool for syllable clapping, rhymes and initial sounds.
 */
import type { LandCode, WordEntry } from './types'
import { resolveWords } from './words'

export interface ListenWord {
  id: string
  text: string
  syllables: string[]
  image: string
  say?: string
  reim?: string
  /** Spoken initial sound (derived or set by hand). */
  anlaut: string
  /** 'lesen' = from the reading dictionary, 'hoeren' = listening list. */
  source: 'lesen' | 'hoeren'
}

const LISTEN_FILES = import.meta.glob<WordEntry[]>('../data/basis/klasse-*/hoerwoerter.json', {
  eager: true,
  import: 'default',
})

export function listenEntries(grade: number): WordEntry[] {
  return LISTEN_FILES[`../data/basis/klasse-${grade}/hoerwoerter.json`] ?? []
}

/** Multi-letter beginnings and what they sound like. Longest first. */
const ANLAUT_PREFIXES: [string, string][] = [
  ['sch', 'sch'],
  ['sp', 'sch'], // Spinne: "schp"
  ['st', 'sch'], // Stern: "scht"
  ['pf', 'pf'],
  ['ph', 'f'],
  ['qu', 'k'],
  ['ei', 'ei'],
  ['ai', 'ei'],
  ['eu', 'eu'],
  ['äu', 'eu'],
  ['au', 'au'],
]
const ANLAUT_LETTERS: Record<string, string> = { v: 'f', c: 'k', ä: 'e', y: 'j' }

/**
 * Initial sound as heard, not as written: Vogel and Fisch start alike (f),
 * Stern and Sonne do not (sch vs. s). Exceptions (Vase) are set by hand.
 */
export function deriveAnlaut(text: string): string {
  const t = text.toLowerCase()
  for (const [prefix, sound] of ANLAUT_PREFIXES) if (t.startsWith(prefix)) return sound
  const first = t.charAt(0)
  return ANLAUT_LETTERS[first] ?? first
}

function toListen(entry: WordEntry, source: ListenWord['source']): ListenWord | undefined {
  if (!entry.image) return undefined
  return {
    id: entry.id,
    text: entry.text,
    syllables: entry.syllables,
    image: entry.image,
    say: entry.say,
    reim: entry.reim,
    anlaut: entry.anlaut ?? deriveAnlaut(entry.text),
    source,
  }
}

const cache = new Map<string, ListenWord[]>()

/** Reading words with a picture plus the listening list of the grade. */
export function resolveListenWords(land: LandCode, grade: number): ListenWord[] {
  const key = `${land}:${grade}`
  let words = cache.get(key)
  if (!words) {
    words = [
      ...resolveWords(land, grade).map((w) => toListen(w, 'lesen')),
      ...listenEntries(grade).map((w) => toListen(w, 'hoeren')),
    ].filter((w): w is ListenWord => w !== undefined)
    cache.set(key, words)
  }
  return words
}

/** Groups by a key; used for rhyme and initial-sound groups. */
export function groupBy<T>(items: readonly T[], keyOf: (item: T) => string | undefined) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    if (key === undefined) continue
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  return groups
}

/** Initial-sound groups need this many words to be usable in an exercise. */
export const MIN_ANLAUT_GROUP = 3
