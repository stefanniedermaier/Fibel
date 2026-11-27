/**
 * Quality checks for all dictionaries and state adjustments (npm run data:check).
 * Returns a list of readable problems; empty = everything fine.
 */
import avatars from '@/data/common/avatars.json'
import reihenBilder from '@/data/common/reihen-bilder.json'
import {
  BASE_CATALOG,
  CATEGORIES as EXERCISE_CATEGORIES,
  LAENDER,
  OVERLAYS,
  UNITS,
  applyOverlay,
} from './content'
import { graphemes } from './graphemes'
import { MIN_ANLAUT_GROUP, groupBy, listenEntries, resolveListenWords } from './hoeren'
import { checkLauttreu } from './lauttreue'
import { SCRIPTS, glyphProblems, lettersNeeded } from './strokes'
import { WORTARTEN, type LandCode, type Syllable, type Word } from './types'
import { LETTERS, applyWordOverlay, baseSyllables, baseWordEntries, resolveWords } from './words'

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
 * Every catalog entry belongs to a known category and teaching unit of its own subject
 * and grade; every unit has exercises (plaene/README.md, section 4).
 */
export function checkCatalogStructure(catalog = BASE_CATALOG): string[] {
  const problems: string[] = []
  const categories = new Map(EXERCISE_CATEGORIES.map((c) => [c.id, c]))
  const units = new Map(UNITS.map((u) => [u.id, u]))
  if (categories.size !== EXERCISE_CATEGORIES.length) problems.push('Kategorien: doppelte Id')
  if (units.size !== UNITS.length) problems.push('Einheiten: doppelte Id')
  for (const e of catalog) {
    const category = categories.get(e.category)
    if (!category) problems.push(`Katalog ${e.id}: unbekannte Kategorie „${e.category}“`)
    else if (category.topic !== e.topic)
      problems.push(`Katalog ${e.id}: Kategorie „${e.category}“ gehört nicht zu ${e.topic}`)
    const unit = units.get(e.unit)
    if (!unit) problems.push(`Katalog ${e.id}: unbekannte Einheit „${e.unit}“`)
    else if (unit.grade !== e.grade || unit.topic !== e.topic)
      problems.push(`Katalog ${e.id}: Einheit „${e.unit}“ passt nicht zu Klasse und Fach`)
    if (e.weight !== undefined && !(e.weight > 0)) problems.push(`Katalog ${e.id}: Gewicht ≤ 0`)
  }
  for (const u of UNITS) {
    if (!catalog.some((e) => e.unit === u.id)) problems.push(`Einheit ${u.id}: keine Übungen`)
  }
  return problems
}

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

/** At least this many initial-sound groups must have enough words for the exercises. */
export const MIN_USABLE_ANLAUT_GROUPS = 12

/**
 * Listening vocabulary: well-formed entries with pictures, no picture used twice in
 * the pool, every rhyme group with a partner, enough usable initial-sound groups.
 * No lauttreue check – these words are only heard.
 */
function checkListening(land: LandCode, grade: number, images: ReadonlySet<string>): string[] {
  const problems: string[] = []
  const label = `Hörwortschatz Klasse ${grade}`
  const readingIds = new Set(resolveWords(land, grade).map((w) => w.id))
  const seen = new Set<string>()
  for (const e of listenEntries(grade)) {
    const where = `${label}, „${e.text}“ (${e.id})`
    if (seen.has(e.id) || readingIds.has(e.id)) problems.push(`${where}: ID doppelt`)
    seen.add(e.id)
    if (!e.image) problems.push(`${where}: Hörwörter brauchen ein Bild`)
    else if (!images.has(e.image)) problems.push(`${where}: Bild ${e.image} fehlt`)
    if (e.syllables.join('') !== e.text) problems.push(`${where}: Silben ergeben nicht das Wort`)
    if (!CATEGORIES.has(e.category)) problems.push(`${where}: unbekannte Kategorie „${e.category}“`)
    if (e.wortart !== 'nomen') problems.push(`${where}: Hörwörter sind Nomen`)
  }

  const pool = resolveListenWords(land, grade)
  for (const [image, words] of groupBy(pool, (w) => w.image)) {
    if (words.length > 1) {
      problems.push(`${label}: Bild ${image} doppelt (${words.map((w) => w.text).join(', ')})`)
    }
  }
  for (const [reim, words] of groupBy(pool, (w) => w.reim)) {
    if (words.length < 2)
      problems.push(`${label}: Reimgruppe „${reim}“ hat nur „${words[0]?.text}“`)
  }
  const usable = [...groupBy(pool, (w) => w.anlaut).values()].filter(
    (g) => g.length >= MIN_ANLAUT_GROUP,
  ).length
  if (usable < MIN_USABLE_ANLAUT_GROUPS) {
    problems.push(
      `${label}: nur ${usable} Anlautgruppen mit mindestens ${MIN_ANLAUT_GROUP} Wörtern`,
    )
  }
  return problems
}

export function checkData(images: ReadonlySet<string>): string[] {
  const problems: string[] = [...checkLetters(images), ...checkScripts()]

  for (const a of avatars) {
    if (!images.has(a.image)) problems.push(`Avatar „${a.label}“: Bild ${a.image} fehlt`)
  }
  for (const b of reihenBilder) {
    if (!images.has(b.image)) problems.push(`Reihen-Bild „${b.name}“: Bild ${b.image} fehlt`)
  }
  if (new Set(reihenBilder.map((b) => b.image)).size !== reihenBilder.length) {
    problems.push('Reihen-Bilder: ein Bild kommt doppelt vor')
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

  problems.push(...checkCatalogStructure())

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
        problems.push(...checkListening(land.code, grade, images))
      } catch (e) {
        problems.push(`${land.name}: Wortliste – ${(e as Error).message}`)
      }
    }
  }
  // Each problem only once (base words are checked again within every state).
  return [...new Set(problems)]
}
