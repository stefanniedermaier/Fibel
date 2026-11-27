/**
 * Splits words into graphemes (written units for one sound).
 * Multi-letter graphemes count as one unit – the way they are taught as one
 * "letter" in first grade (e.g. Sch, Ei, Au).
 */

/** Longest first, so "sch" wins over "ch". */
export const MULTIGRAPHS = [
  'sch',
  'ch',
  'ei',
  'au',
  'eu',
  'äu',
  'ie',
  'pf',
  'qu',
  'ck',
  'tz',
] as const

/**
 * St and Sp at the start of a word are spoken "scht" and "schp". Grade 1 teaches them
 * as letter groups (plaene/klasse-1-abgleich.md, D13), so there they are one unit;
 * inside a word (ist, Wespe) they stay two letters.
 */
export const INITIAL_GROUPS = ['st', 'sp'] as const

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'])

/** Graphemes that stand for a vowel sound (incl. diphthongs). */
export const VOWEL_GRAPHEMES = new Set([...VOWELS, 'ei', 'au', 'eu', 'äu', 'ie'])

export function graphemes(word: string): string[] {
  const text = word.toLowerCase()
  const result: string[] = []
  let i = 0
  while (i < text.length) {
    const multi =
      (i === 0 ? INITIAL_GROUPS.find((g) => text.startsWith(g)) : undefined) ??
      MULTIGRAPHS.find((g) => text.startsWith(g, i))
    const unit = multi ?? (text[i] as string)
    result.push(unit)
    i += unit.length
  }
  return result
}

export function isVowelGrapheme(g: string): boolean {
  return VOWEL_GRAPHEMES.has(g)
}

/** A word can be practised if all its graphemes are unlocked. */
export function usesOnly(word: string, unlocked: ReadonlySet<string>): boolean {
  return graphemes(word).every((g) => unlocked.has(g))
}
