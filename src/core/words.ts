/**
 * Dictionaries: words, syllables and letters per grade – base plus the state's
 * word list adjustments (see PLAN.md, sections 4 and 5).
 */
import lettersData from '@/data/common/letters.json'
import { OVERLAYS } from './content'
import { graphemes, usesOnly } from './graphemes'
import { deriveLevel } from './lauttreue'
import { derivePhenomena } from './phenomena'
import type {
  LandCode,
  LandOverlay,
  Letter,
  ProfileSettings,
  Syllable,
  Word,
  WordEntry,
} from './types'

export const LETTERS: readonly Letter[] = lettersData as Letter[]

const BASE_WORD_FILES = import.meta.glob<WordEntry[]>('../data/basis/klasse-*/words.json', {
  eager: true,
  import: 'default',
})
const BASE_SYLLABLE_FILES = import.meta.glob<Syllable[]>('../data/basis/klasse-*/syllables.json', {
  eager: true,
  import: 'default',
})
const LAND_WORD_FILES = import.meta.glob<WordEntry[]>('../data/laender/*/klasse-*/words.json', {
  eager: true,
  import: 'default',
})

export function baseWordEntries(grade: number): WordEntry[] {
  return BASE_WORD_FILES[`../data/basis/klasse-${grade}/words.json`] ?? []
}

export function baseSyllables(grade: number): Syllable[] {
  return BASE_SYLLABLE_FILES[`../data/basis/klasse-${grade}/syllables.json`] ?? []
}

/** A state's extra word list, by its path relative to the state folder. */
export function landWordFile(land: LandCode, path: string): WordEntry[] | undefined {
  return LAND_WORD_FILES[`../data/laender/${land}/${path}`]
}

export function toWord(entry: WordEntry, source: string, grundwortschatz: boolean): Word {
  return {
    ...entry,
    graphemes: graphemes(entry.text),
    phenomena: [
      ...new Set([
        ...(entry.schwerpunkt ? [entry.schwerpunkt] : []),
        ...derivePhenomena(entry.text, entry.syllables),
      ]),
    ].filter(Boolean),
    level: deriveLevel(entry.text, entry.syllables),
    grundwortschatz,
    source,
  }
}

type FileLookup = (land: LandCode, path: string) => WordEntry[] | undefined

/** Base words of a grade plus the state's changes (remove, add, basic vocabulary). */
export function applyWordOverlay(
  base: readonly WordEntry[],
  grade: number,
  overlay: LandOverlay | undefined,
  lookup: FileLookup = landWordFile,
): Word[] {
  const changes = overlay?.words?.[String(grade)]
  if (!overlay || !changes) return base.map((w) => toWord(w, 'basis', false))
  const label = overlay.land

  const added = changes.add ? lookup(overlay.land, changes.add) : []
  if (added === undefined) throw new Error(`${label}: Wortliste „${changes.add}“ fehlt`)

  const baseIds = new Set(base.map((w) => w.id))
  for (const id of changes.remove ?? []) {
    if (!baseIds.has(id)) throw new Error(`${label}: unbekanntes Wort „${id}“ in remove`)
  }
  for (const w of added) {
    if (baseIds.has(w.id)) throw new Error(`${label}: Wort „${w.id}“ existiert schon`)
  }

  const removed = new Set(changes.remove ?? [])
  const gws = new Set(changes.grundwortschatz ?? [])
  const words = [
    ...base.filter((w) => !removed.has(w.id)).map((w) => toWord(w, 'basis', gws.has(w.id))),
    ...added.map((w) => toWord(w, overlay.land, gws.has(w.id))),
  ]
  const ids = new Set(words.map((w) => w.id))
  for (const id of gws) {
    if (!ids.has(id)) throw new Error(`${label}: Grundwortschatz-Wort „${id}“ fehlt in der Liste`)
  }
  return words
}

const cache = new Map<string, Word[]>()

export function resolveWords(land: LandCode, grade: number): Word[] {
  const key = `${land}:${grade}`
  let words = cache.get(key)
  if (!words) {
    words = applyWordOverlay(baseWordEntries(grade), grade, OVERLAYS[land])
    cache.set(key, words)
  }
  return words
}

/**
 * Only words whose graphemes are all unlocked (if the letter filter is on). A Merkwort
 * is learnt as a whole: its single letters must be known (d, i, e for "die"), not the
 * grapheme "ie".
 */
export function wordsForSettings(words: readonly Word[], settings: ProfileSettings): Word[] {
  if (!settings.letterFilter) return [...words]
  const unlocked = new Set(settings.letters)
  return words.filter((w) =>
    w.merkwort
      ? [...w.text.toLowerCase()].every((ch) => unlocked.has(ch))
      : usesOnly(w.text, unlocked),
  )
}

/** Without Merkwörter: words that can be read and written sound by sound. */
export function lauttreu<W extends Word>(words: readonly W[]): W[] {
  return words.filter((w) => !w.merkwort)
}

export function syllablesForSettings(
  syllables: readonly Syllable[],
  settings: ProfileSettings,
): Syllable[] {
  if (!settings.letterFilter) return [...syllables]
  const unlocked = new Set(settings.letters)
  return syllables.filter((s) => usesOnly(s.text, unlocked))
}

/** Handwriting for the tracing templates (default: Druckschrift). */
export function scriptFor(land: LandCode, grade: number): string {
  return OVERLAYS[land]?.script?.[String(grade)] ?? 'druckschrift'
}
