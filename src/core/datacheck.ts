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
import { HAEUFIGKEITSWOERTER, ST_SP_RULE, checkLauttreu } from './lauttreue'
import { baseSentences, sceneKey, unknownWords, wordsOf } from './saetze'
import ablaeufe from '@/data/basis/klasse-1/ablaeufe.json'
import fragesaetze from '@/data/basis/klasse-1/fragesaetze.json'
import rechengeschichten from '@/data/basis/klasse-1/rechengeschichten.json'
import texte from '@/data/basis/klasse-1/texte.json'
import zusammensetzungen from '@/data/basis/klasse-1/zusammensetzungen.json'
import { BEGRIFFE, THEMEN } from '@/exercises/sache/shared'
import { LUECKENSAETZE } from '@/exercises/lesen/satz-luecke'
import { textsFor } from '@/exercises/lesen/text-fragen'
import { PHENOMENA, showsPhenomenon, type Phenomenon } from './phenomena'
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

/** Sentences: known words only, existing pictures, enough different pictures per group. */
export function checkSentences(grade: number, words: readonly Word[], images: ReadonlySet<string>) {
  const problems: string[] = []
  const sentences = baseSentences(grade)
  const ids = new Set<string>()
  const scenes = new Map<string, Set<string>>()
  for (const s of sentences) {
    const where = `Klasse ${grade}, Satz „${s.text}“`
    if (ids.has(s.id)) problems.push(`${where}: ID doppelt`)
    ids.add(s.id)
    if (!/^[A-ZÄÖÜ]/.test(s.text) || !/[.!?]$/.test(s.text))
      problems.push(`${where}: groß anfangen und mit Satzzeichen enden`)
    if (grade === 1)
      for (const w of unknownWords(s, words))
        problems.push(`${where}: Wort „${w}“ fehlt im Wörterbuch`)
    else if (wordsOf(s.text).length > 10) problems.push(`${where}: mehr als 10 Wörter`)
    if (s.scene.length === 0) problems.push(`${where}: ohne Bild`)
    for (const code of s.scene) if (!images.has(code)) problems.push(`${where}: Bild ${code} fehlt`)
    const group = scenes.get(s.group) ?? new Set()
    if (group.has(sceneKey(s)))
      problems.push(`${where}: gleiches Bild wie ein anderer Satz der Gruppe`)
    group.add(sceneKey(s))
    scenes.set(s.group, group)
  }
  for (const [group, set] of scenes) {
    if (set.size < 3) problems.push(`Klasse ${grade}, Satzgruppe „${group}“: weniger als 3 Bilder`)
  }
  return problems
}

/** Texts, questions, picture sequences and story problems of grade 1. */
export function checkGrade1Extras(words: readonly Word[], images: ReadonlySet<string>) {
  const problems: string[] = []
  const known = new Set(words.map((w) => w.text.toLowerCase()))
  const unknown = (text: string) => wordsOf(text).filter((w) => !known.has(w.toLowerCase()))
  const ids = new Set<string>()
  for (const t of texte) {
    const where = `Text „${t.id}“`
    if (ids.has(t.id)) problems.push(`${where}: ID doppelt`)
    ids.add(t.id)
    if (t.kind === 'lesen')
      for (const w of unknown(t.text)) problems.push(`${where}: Wort „${w}“ fehlt im Wörterbuch`)
    if (t.fragen.length === 0) problems.push(`${where}: ohne Frage`)
    for (const f of t.fragen) {
      if (f.choices.length !== 3) problems.push(`${where}, „${f.frage}“: nicht genau 3 Antworten`)
      if (!f.choices[f.answer]) problems.push(`${where}, „${f.frage}“: richtige Antwort fehlt`)
      const scenes = new Set(f.choices.map((c) => c.scene.join(' ')))
      if (scenes.size !== f.choices.length) problems.push(`${where}, „${f.frage}“: gleiche Bilder`)
      for (const c of f.choices)
        for (const code of c.scene)
          if (!images.has(code)) problems.push(`${where}: Bild ${code} fehlt`)
    }
  }
  for (const s of fragesaetze) {
    if (!s.text.endsWith('?')) problems.push(`Fragesatz „${s.text}“: ohne Fragezeichen`)
    for (const w of unknown(s.text))
      problems.push(`Fragesatz „${s.text}“: Wort „${w}“ fehlt im Wörterbuch`)
  }
  for (const a of ablaeufe) {
    const where = `Ablauf „${a.id}“`
    if (a.images.length < 3) problems.push(`${where}: weniger als 3 Bilder`)
    if (a.images.length !== a.steps.length)
      problems.push(`${where}: Bilder und Schritte passen nicht`)
    if (new Set(a.images).size !== a.images.length) problems.push(`${where}: Bild doppelt`)
    for (const code of a.images)
      if (!images.has(code)) problems.push(`${where}: Bild ${code} fehlt`)
  }
  for (const z of zusammensetzungen) {
    const where = `Zusammensetzung „${z.id}“`
    const [a, b] = z.teile
    if (!a || !b || z.teile.length !== 2) problems.push(`${where}: braucht genau zwei Teile`)
    else if (!z.text.startsWith(a.text.slice(0, 3)))
      problems.push(`${where}: fängt nicht mit „${a.text}“ an`)
    for (const code of [z.image, ...z.teile.map((t) => t.image)])
      if (!images.has(code)) problems.push(`${where}: Bild ${code} fehlt`)
  }
  for (const g of rechengeschichten) {
    const where = `Rechengeschichte „${g.id}“`
    if (!images.has(g.image)) problems.push(`${where}: Bild ${g.image} fehlt`)
    for (const text of [g.plus, g.minus])
      if (!text.includes('{a}') || !text.includes('{b}') || !text.endsWith('?'))
        problems.push(`${where}: braucht {a}, {b} und eine Frage am Ende`)
  }
  return problems
}

/** HSU (plaene/hsu-klasse-1.md): every theme, Begriff and picture must fit together. */
export function checkSache(images: ReadonlySet<string>): string[] {
  const problems: string[] = []
  const begriffe = new Map<string, (typeof BEGRIFFE)[number]>()
  for (const b of BEGRIFFE) {
    if (begriffe.has(b.id)) problems.push(`HSU-Begriff „${b.id}“: ID doppelt`)
    begriffe.set(b.id, b)
    if (!images.has(b.image)) problems.push(`HSU-Begriff „${b.id}“: Bild ${b.image} fehlt`)
    if (!/[.!]$/.test(b.merksatz)) problems.push(`HSU-Begriff „${b.id}“: Merksatz ohne Punkt`)
  }
  const ablaufIds = new Set(ablaeufe.map((a) => a.id))
  const need = (where: string, id: string) => {
    if (!begriffe.has(id)) problems.push(`${where}: Begriff „${id}“ fehlt`)
  }
  for (const t of THEMEN) {
    const where = `HSU-Thema „${t.id}“`
    if (!UNITS.some((u) => u.id === `k1.sache.${t.id}`)) problems.push(`${where}: Einheit fehlt`)
    const pictures = t.erkennen.map((id) => begriffe.get(id)?.image)
    if (new Set(pictures).size !== pictures.length) problems.push(`${where}: Bild doppelt`)
    if (t.erkennen.length > 0 && t.erkennen.length < 4)
      problems.push(`${where}: weniger als 4 Bilder zum Erkennen`)
    for (const id of t.erkennen) need(where, id)
    for (const s of t.sortieren) {
      const groups = new Set(s.gruppen.map((g) => g.id))
      for (const g of s.gruppen)
        if (!images.has(g.image)) problems.push(`${where}, ${s.id}: Bild ${g.image} fehlt`)
      for (const [id, group] of Object.entries(s.zuordnung)) {
        need(where, id)
        if (!groups.has(group)) problems.push(`${where}, ${s.id}: Gruppe „${group}“ fehlt`)
      }
      for (const g of groups)
        if (!Object.values(s.zuordnung).includes(g))
          problems.push(`${where}, ${s.id}: Gruppe „${g}“ ohne Begriff`)
    }
    for (const p of t.paare) {
      const ids = [p.richtig, ...p.ablenker]
      for (const id of [p.ziel, ...ids]) need(where, id)
      if (ids.length < 3) problems.push(`${where}, „${p.frage}“: weniger als 3 Antworten`)
      const pics = ids.map((id) => begriffe.get(id)?.image)
      if (new Set(pics).size !== pics.length)
        problems.push(`${where}, „${p.frage}“: gleiche Bilder`)
      if (!p.frage.endsWith('?')) problems.push(`${where}, „${p.frage}“: ohne Fragezeichen`)
    }
    if (!t.forscherauftrag) problems.push(`${where}: Forscherauftrag fehlt`)
    if (!t.lehrplan || !t.quelle) problems.push(`${where}: Lehrplan oder Quelle fehlt`)
    for (const a of t.aussagen) {
      if (!images.has(a.image)) problems.push(`${where}, „${a.text}“: Bild ${a.image} fehlt`)
      if (!a.text.endsWith('.') || !/[.!]$/.test(a.regel))
        problems.push(`${where}, „${a.text}“: Aussage und Regel brauchen einen Punkt am Ende`)
    }
    if (t.aussagen.length > 0 && t.aussagen.every((a) => a.richtig === t.aussagen[0]!.richtig))
      problems.push(`${where}: Aussagen sind alle richtig oder alle falsch`)
    for (const bild of t.suchbilder) {
      const at = `${where}, Suchbild „${bild.id}“`
      const keys = new Set(bild.stellen.map((s) => s.key))
      if (keys.size !== bild.stellen.length) problems.push(`${at}: Stelle doppelt`)
      for (const s of bild.stellen) {
        const [x, y, w, h] = s.box
        if (x < 0 || y < 0 || x + w > 400 || y + h > 270)
          problems.push(`${at}: Stelle „${s.key}“ liegt außerhalb`)
        for (const b of s.bilder ?? [])
          if (!images.has(b.image)) problems.push(`${at}: Bild ${b.image} fehlt`)
        if (!s.form && !s.bilder?.length) problems.push(`${at}: Stelle „${s.key}“ ohne Bild`)
      }
      for (const f of bild.fragen) {
        if (f.richtig.length === 0 || f.richtig.some((k) => !keys.has(k)))
          problems.push(`${at}, „${f.frage}“: richtige Stelle fehlt`)
        if (!/[.!]$/.test(f.regel)) problems.push(`${at}, „${f.frage}“: Regel ohne Punkt`)
      }
    }
    for (const id of t.ablaeufe)
      if (!ablaufIds.has(id)) problems.push(`${where}: Ablauf „${id}“ fehlt`)
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
/**
 * Grade 2 (plaene/klasse-2.md, section 11): every focus is a known phenomenon that
 * shows in the word; umlaut and hardening words name their related form; nouns have
 * article and plural, verbs the er-form; every phenomenon has enough words.
 */
export function checkGrade2Words(words: readonly Word[], label: string): string[] {
  const problems: string[] = []
  const count = new Map<string, number>()
  for (const w of words) {
    const where = `${label}, Klasse 2, Wort „${w.text}“`
    const p = w.schwerpunkt
    if (!p || !(p in PHENOMENA)) problems.push(`${where}: unbekannter Schwerpunkt „${p}“`)
    else if (!showsPhenomenon(p as Phenomenon, w.text, w.syllables))
      problems.push(`${where}: „${p}“ kommt im Wort nicht vor`)
    if ((p === 'umlaut' || p === 'verhaertung') && !w.ableiten)
      problems.push(`${where}: braucht eine Ableitung (ableiten)`)
    if (w.ableiten && !/[äöü]|[bdg]/i.test(w.ableiten.wort))
      problems.push(`${where}: Ableitung „${w.ableiten.wort}“ ohne Umlaut oder b/d/g`)
    if (w.wortart === 'nomen' && (!w.artikel || !w.plural))
      problems.push(`${where}: Nomen ohne Artikel oder Mehrzahl`)
    if (w.wortart === 'verb' && !w.er) problems.push(`${where}: Verb ohne er-Form`)
    for (const ph of w.phenomena) count.set(ph, (count.get(ph) ?? 0) + 1)
  }
  for (const p of Object.keys(PHENOMENA))
    if ((count.get(p) ?? 0) < 4) problems.push(`${label}, Klasse 2: zu wenige Wörter mit „${p}“`)
  return problems
}

/** Texts and gap sentences of grade 2 (L2-5, L2-6): one right answer each. */
export function checkGrade2Texts(): string[] {
  const problems: string[] = []
  for (const t of textsFor(2)) {
    const where = `Klasse 2, Text „${t.id}“`
    const n = wordsOf(t.text).length
    if (n < 20 || n > 60) problems.push(`${where}: ${n} Wörter (20–60)`)
    if (t.fragen.length !== 3) problems.push(`${where}: nicht genau 3 Fragen`)
    for (const f of t.fragen) {
      const labels = f.choices.map((c) => c.text ?? c.scene?.join(' '))
      if (f.choices.length !== 3 || new Set(labels).size !== 3)
        problems.push(`${where}, „${f.frage}“: nicht 3 verschiedene Antworten`)
      if (!f.choices[f.answer]) problems.push(`${where}, „${f.frage}“: richtige Antwort fehlt`)
    }
  }
  for (const l of LUECKENSAETZE) {
    const where = `Klasse 2, Lückensatz „${l.text}“`
    if (!l.text.includes('___')) problems.push(`${where}: ohne Lücke`)
    if (l.ablenker.includes(l.answer) || l.ablenker.length !== 2)
      problems.push(`${where}: braucht zwei andere Wörter`)
  }
  return problems
}

/** Grades that have content (folders under src/data/basis). */
export const CONTENT_GRADES = [1, 2]

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
        problems.push(...checkSentences(grade, words, images))
        if (grade === 1) problems.push(...checkGrade1Extras(words, images), ...checkSache(images))
        if (grade === 2) problems.push(...checkGrade2Words(words, land.name), ...checkGrade2Texts())
        problems.push(...checkListening(land.code, grade, images))
      } catch (e) {
        problems.push(`${land.name}: Wortliste – ${(e as Error).message}`)
      }
    }
  }
  // Each problem only once (base words are checked again within every state).
  return [...new Set(problems)]
}
