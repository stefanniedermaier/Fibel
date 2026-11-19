/**
 * Quality checks for all dictionaries and state adjustments (npm run data:check).
 * Returns a list of readable problems; empty = everything fine.
 */
import avatars from '@/data/common/avatars.json'
import { BASE_CATALOG, LAENDER, OVERLAYS, applyOverlay } from './content'
import { graphemes } from './graphemes'
import { checkLauttreu } from './lauttreue'
import { SCRIPTS, glyphProblems, lettersNeeded } from './strokes'
import type { Syllable, Word } from './types'
import { LETTERS, applyWordOverlay, baseSyllables, baseWordEntries } from './words'

export const CATEGORIES = new Set([
  'menschen',
  'tiere',
  'essen',
  'dinge',
  'natur',
  'fahrzeuge',
  'koerper',
  'musik',
])
/** Known handwriting templates (folders under src/data/schriften). */
export const SCRIPT_IDS = new Set(Object.keys(SCRIPTS))

/** Every template must cover all letters (capital and small) and be well-formed. */
function checkScripts(): string[] {
  const problems: string[] = []
  const needed = lettersNeeded(LETTERS.map((l) => l.id))
  for (const script of Object.values(SCRIPTS)) {
    for (const ch of needed) {
      if (!script.glyphs[ch]) problems.push(`${script.name}: Vorlage für „${ch}“ fehlt`)
    }
    for (const [ch, glyph] of Object.entries(script.glyphs)) {
      for (const p of glyphProblems(glyph)) problems.push(`${script.name} „${ch}“: ${p}`)
    }
  }
  return problems
}
/** Grades that have content (folders under src/data/basis). */
export const CONTENT_GRADES = [1]

function checkWords(
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
    if (!images.has(w.image))
      problems.push(`${where}: Bild ${w.image} fehlt (npm run data:openmoji)`)
    if (!CATEGORIES.has(w.category)) problems.push(`${where}: unbekannte Kategorie „${w.category}“`)
    for (const g of w.graphemes) {
      if (!letterIds.has(g)) problems.push(`${where}: Graphem „${g}“ fehlt in letters.json`)
    }
    if (grade === 1) {
      for (const v of checkLauttreu(w.text, w.syllables)) {
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

function checkSyllables(syllables: readonly Syllable[], grade: number) {
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

function checkLetters(images: ReadonlySet<string>) {
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

export function checkData(images: ReadonlySet<string>): string[] {
  const problems: string[] = [...checkLetters(images), ...checkScripts()]

  for (const a of avatars) {
    if (!images.has(a.image)) problems.push(`Avatar „${a.label}“: Bild ${a.image} fehlt`)
  }

  for (const grade of CONTENT_GRADES) {
    problems.push(...checkSyllables(baseSyllables(grade), grade))
    problems.push(
      ...checkWords(
        applyWordOverlay(baseWordEntries(grade), grade, undefined),
        grade,
        'Basis',
        images,
      ),
    )
  }

  for (const land of LAENDER.filter((l) => l.enabled)) {
    const overlay = OVERLAYS[land.code]
    if (!overlay) {
      problems.push(`${land.name}: aktiv, aber ohne overlay.json`)
      continue
    }
    try {
      applyOverlay(BASE_CATALOG, overlay)
    } catch (e) {
      problems.push(`${land.name}: Katalog – ${(e as Error).message}`)
    }
    for (const [grade, script] of Object.entries(overlay.script ?? {})) {
      if (!SCRIPT_IDS.has(script))
        problems.push(`${land.name}: unbekannte Schrift „${script}“ (Klasse ${grade})`)
    }
    for (const grade of CONTENT_GRADES) {
      try {
        const words = applyWordOverlay(baseWordEntries(grade), grade, overlay)
        problems.push(...checkWords(words, grade, land.name, images))
      } catch (e) {
        problems.push(`${land.name}: Wortliste – ${(e as Error).message}`)
      }
    }
  }
  // Each problem only once (base words are checked again within every state).
  return [...new Set(problems)]
}
