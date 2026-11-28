/** Dictionaries: words, syllables and letters of every grade. */
import { graphemes } from '../graphemes'
import { checkLauttreu, HAEUFIGKEITSWOERTER, ST_SP_RULE } from '../lauttreue'
import { PHENOMENA, type Phenomenon, showsPhenomenon } from '../phenomena'
import { type Syllable, type Word, WORTARTEN } from '../types'
import { LETTERS } from '../words'

export const CATEGORIES = new Set([
  'menschen',
  'tiere',
  'essen',
  'dinge',
  'natur',
  'fahrzeuge',
  'koerper',
  'musik',
  'zeit',
  // Categories of the other word types
  'tun',
  'eigenschaften',
  'woerter',
  'namen',
])

/**
 * Grade 2 (plaene/klasse-2.md, section 11): every focus is a known phenomenon that
 * shows in the word; umlaut and hardening words name their related form; nouns have
 * article and plural, verbs the er-form; every phenomenon has enough words.
 */
export function checkGrade2Words(words: readonly Word[], label: string, grade = 2): string[] {
  const problems: string[] = []
  const count = new Map<string, number>()
  for (const w of words) {
    const where = `${label}, Klasse ${grade}, Wort „${w.text}“`
    const p = w.schwerpunkt
    if (!p || !(p in PHENOMENA)) problems.push(`${where}: unbekannter Schwerpunkt „${p}“`)
    else if (!showsPhenomenon(p as Phenomenon, w.text, w.syllables))
      problems.push(`${where}: „${p}“ kommt im Wort nicht vor`)
    if ((p === 'umlaut' || p === 'verhaertung' || p === 'kombi') && !w.ableiten)
      problems.push(`${where}: braucht eine Ableitung (ableiten)`)
    if (w.ableiten && !/[äöü]|[bdg]/i.test(w.ableiten.wort) && p !== 'h')
      problems.push(`${where}: Ableitung „${w.ableiten.wort}“ ohne Umlaut oder b/d/g`)
    if (w.wortart === 'nomen' && (!w.artikel || !w.plural))
      problems.push(`${where}: Nomen ohne Artikel oder Mehrzahl`)
    if (w.wortart === 'verb' && !w.er) problems.push(`${where}: Verb ohne er-Form`)
    for (const ph of w.phenomena) count.set(ph, (count.get(ph) ?? 0) + 1)
  }
  // Every focus of the grade needs enough words (a unit filters by it).
  const focuses = new Set(words.map((w) => w.schwerpunkt).filter((p): p is string => !!p))
  for (const p of focuses)
    if ((count.get(p) ?? 0) < 1) problems.push(`${label}, Klasse ${grade}: keine Wörter mit „${p}“`)
  if (grade === 2)
    for (const p of Object.keys(PHENOMENA).filter((x) => !LATER.has(x)))
      if ((count.get(p) ?? 0) < 4) problems.push(`${label}, Klasse 2: zu wenige Wörter mit „${p}“`)
  return problems
}

/** Phenomena that only grade 3 uses. */
const LATER = new Set([
  'trennen',
  'grammatik',
  'praeteritum',
  'kombi',
  'ks',
  'zz',
  'dt',
  'doppelvokal',
  'istattie',
])

/** Grades that have content (folders under src/data/basis). */
export const CONTENT_GRADES = [1, 2, 3, 4]

export function checkWords(
  words: readonly Word[],
  grade: number,
  label: string,
  images: ReadonlySet<string>,
) {
  const problems: string[] = []
  const ids = new Set<string>()
  const letterIds = new Set(LETTERS.map((l) => l.id))
  for (const w of words) {
    const where = `${label}, Klasse ${grade}, Wort „${w.text}“ (${w.id})`
    if (ids.has(w.id)) problems.push(`${where}: ID doppelt`)
    ids.add(w.id)
    if (!/^[a-z0-9-]+$/.test(w.id)) problems.push(`${where}: ID nur aus a–z, 0–9 und - bilden`)
    if (w.syllables.join('') !== w.text) {
      problems.push(`${where}: Silben „${w.syllables.join('-')}“ ergeben nicht das Wort`)
    }
    if (w.image !== undefined && !images.has(w.image))
      problems.push(`${where}: Bild ${w.image} fehlt (npm run data:openmoji)`)
    if (!CATEGORIES.has(w.category)) problems.push(`${where}: unbekannte Kategorie „${w.category}“`)
    if (!WORTARTEN.includes(w.wortart)) {
      problems.push(`${where}: unbekannte Wortart „${w.wortart}“`)
    } else {
      // Nouns and names start with a capital letter, everything else is lower case.
      const first = w.text.charAt(0)
      const capital = first !== first.toLowerCase()
      const shouldBe = w.wortart === 'nomen' || w.wortart === 'name'
      if (capital !== shouldBe) {
        problems.push(`${where}: als ${w.wortart} ${shouldBe ? 'großschreiben' : 'kleinschreiben'}`)
      }
    }
    for (const g of w.graphemes) {
      if (!letterIds.has(g)) problems.push(`${where}: Graphem „${g}“ fehlt in letters.json`)
    }
    if (w.merkwort) {
      // Only frequent words of the official list, and only where really needed.
      if (!HAEUFIGKEITSWOERTER.has(w.text.toLowerCase()))
        problems.push(`${where}: Merkwort, steht aber nicht im Häufigkeitswortschatz`)
      else if (checkLauttreu(w.text, w.syllables).length === 0)
        problems.push(`${where}: ist lauttreu und braucht keine Markierung als Merkwort`)
      if (!w.beispiel) problems.push(`${where}: Merkwort ohne Beispiel`)
    } else if (grade === 1) {
      for (const v of checkLauttreu(w.text, w.syllables)) {
        if (v.rule === ST_SP_RULE) continue
        problems.push(`${where}: nicht lauttreu (${v.rule}: ${v.detail})`)
      }
    }
  }
  for (const w of words) {
    for (const s of w.similar ?? []) {
      if (s === w.id) problems.push(`${label}, Wort ${w.id}: verweist in „similar“ auf sich selbst`)
      else if (!ids.has(s))
        problems.push(`${label}, Wort ${w.id}: „similar“ verweist auf unbekanntes Wort „${s}“`)
    }
  }
  return problems
}

export function checkSyllables(syllables: readonly Syllable[], grade: number) {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const s of syllables) {
    const where = `Klasse ${grade}, Silbe „${s.text}“`
    if (seen.has(s.text)) problems.push(`${where}: doppelt`)
    seen.add(s.text)
    if (s.text !== s.text.toLowerCase()) problems.push(`${where}: bitte kleinschreiben`)
    if (grade === 1) {
      for (const v of checkLauttreu(s.text, [s.text])) {
        problems.push(`${where}: nicht lauttreu (${v.rule})`)
      }
    }
  }
  return problems
}

export function checkLetters(images: ReadonlySet<string>) {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const l of LETTERS) {
    const where = `Buchstabe „${l.upper}“`
    if (seen.has(l.id)) problems.push(`${where}: doppelt`)
    seen.add(l.id)
    if (graphemes(l.id).length !== 1 || graphemes(l.id)[0] !== l.id) {
      problems.push(`${where}: ID „${l.id}“ ist kein einzelnes Graphem`)
    }
    if (!images.has(l.image)) problems.push(`${where}: Bild ${l.image} fehlt`)
  }
  return problems
}
