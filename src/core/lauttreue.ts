/**
 * Rules for grade 1 words: only "lauttreue" words, where every sound maps to exactly
 * one letter or grapheme (see PLAN.md, section 5). Also derives the word level.
 */
import { graphemes, isVowelGrapheme } from './graphemes'

export interface Violation {
  rule: string
  detail: string
}

const VOWEL = '[aeiouäöü]'
const CONSONANTS_ONLY = '[^aeiouäöü]*$'

/** Word-level patterns (lower case) that are not lauttreu. */
const WORD_RULES: { rule: string; pattern: RegExp }[] = [
  { rule: 'ie', pattern: /ie/ },
  { rule: 'Doppelvokal', pattern: /aa|ee|oo/ },
  { rule: 'Doppelkonsonant', pattern: /([bcdfgklmnprstz])\1/ },
  { rule: 'ck/tz', pattern: /ck|tz/ },
  { rule: 'v, x, y, ß, qu', pattern: /[vxyß]|qu/ },
  { rule: 'c ohne ch/sch', pattern: /c(?!h)/ },
  { rule: 'ph/th', pattern: /ph|th/ },
  { rule: 'ai', pattern: /ai/ },
  { rule: 'st/sp am Anfang', pattern: /^s[tp]/ },
  { rule: 'ng/nk', pattern: /n[gk]/ },
  { rule: 'chs', pattern: /chs/ },
]

/** Syllable-level patterns (lower case). */
const SYLLABLE_RULES: { rule: string; pattern: RegExp }[] = [
  // Dehnungs-h: h right after a vowel in the same syllable (Kuh, Zahl). "U-hu" is fine.
  { rule: 'Dehnungs-h', pattern: new RegExp(`${VOWEL}h`) },
  // Auslautverhärtung: b/d/g followed only by consonants up to the syllable end (Hund, Rad).
  { rule: 'Auslautverhärtung', pattern: new RegExp(`[bdg]${CONSONANTS_ONLY}`) },
  // Vocalised r: r after a vowel at the syllable end (Tiger, Wurm, Tor).
  { rule: 'vokalisiertes r', pattern: new RegExp(`${VOWEL}r${CONSONANTS_ONLY}`) },
]

export function checkLauttreu(text: string, syllables: readonly string[]): Violation[] {
  const word = text.toLowerCase()
  const violations: Violation[] = []
  for (const { rule, pattern } of WORD_RULES) {
    const match = word.match(pattern)
    if (match) violations.push({ rule, detail: `„${match[0]}“ in ${text}` })
  }
  for (const syllable of syllables) {
    const s = syllable.toLowerCase()
    for (const { rule, pattern } of SYLLABLE_RULES) {
      if (pattern.test(s)) violations.push({ rule, detail: `Silbe „${syllable}“ in ${text}` })
    }
  }
  return violations
}

/** Graphemes that make a word level 4 (taught later in grade 1). */
const LEVEL4_GRAPHEMES = new Set(['sch', 'ch', 'ei', 'au', 'eu', 'äu', 'ä', 'ö', 'ü', 'pf'])

/** Open syllable with at most one consonant before the vowel: "o", "ma", "se". */
function isOpenSimple(syllable: string): boolean {
  const g = graphemes(syllable)
  const last = g[g.length - 1]
  return last !== undefined && isVowelGrapheme(last) && g.length <= 2
}

/**
 * Level of a grade-1 word:
 * 1 = two open syllables (Oma, Rose), 2 = three or more open syllables (Tomate),
 * 3 = closed syllables or consonant clusters (Igel, Brot), 4 = Sch, Ei, Au, umlauts …
 */
export function deriveLevel(text: string, syllables: readonly string[]): 1 | 2 | 3 | 4 {
  if (graphemes(text).some((g) => LEVEL4_GRAPHEMES.has(g))) return 4
  if (!syllables.every(isOpenSimple)) return 3
  return syllables.length >= 3 ? 2 : 1
}
