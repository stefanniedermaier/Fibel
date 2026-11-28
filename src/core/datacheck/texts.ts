/** Sentences, texts and listening tasks: only known words, with pictures. */
import { groupBy, listenEntries, MIN_ANLAUT_GROUP, resolveListenWords } from '../hoeren'
import { baseSentences, sceneKey, splitSentences, unknownWords, wordsOf } from '../saetze'
import type { LandCode, Word } from '../types'
import { resolveWords } from '../words'
import fragesaetze from '@/data/basis/klasse-1/fragesaetze.json'
import rechengeschichten from '@/data/basis/klasse-1/rechengeschichten.json'
import texte from '@/data/basis/klasse-1/texte.json'
import zusammensetzungen from '@/data/basis/klasse-1/zusammensetzungen.json'
import ablaeufe from '@/data/common/ablaeufe.json'
import { LUECKENSAETZE } from '@/exercises/lesen/satz-luecke'
import { textsFor } from '@/exercises/lesen/text-fragen'
import { LUECKEN } from '@/exercises/sprache/luecken'
import { SAETZE_4 } from '@/exercises/sprache/satzglieder'
import { CATEGORIES } from './words'

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

/** Grade 3 texts (L3-2 to L3-6): length, 3–4 questions, references inside the text. */
export function checkGrade3Texts(grade = 3): string[] {
  const problems: string[] = []
  const [min, max] = grade === 3 ? [40, 160] : [30, 320]
  for (const t of textsFor(grade)) {
    const where = `Klasse ${grade}, Text „${t.id}“`
    const n = wordsOf(t.text).length
    if (n < min || n > max) problems.push(`${where}: ${n} Wörter (${min}–${max})`)
    if (!t.textart) problems.push(`${where}: ohne Textart`)
    if (t.fragen.length < 3 || t.fragen.length > grade + 1)
      problems.push(`${where}: 3 bis ${grade + 1} Fragen`)
    const count = splitSentences(t.text).length
    for (const f of t.fragen) {
      if (f.beleg !== undefined && (f.beleg < 0 || f.beleg >= count))
        problems.push(`${where}, „${f.frage}“: Beleg außerhalb des Textes`)
      const labels = f.choices.map((c) => c.text)
      if (new Set(labels).size !== labels.length)
        problems.push(`${where}, „${f.frage}“: Antworten doppelt`)
    }
  }
  return problems
}

/** Grade 4 language data (SP4-3, SP4-4): one subject and one verb second, distinct answers. */
export function checkGrade4Sprache(): string[] {
  const problems: string[] = []
  for (const s of SAETZE_4) {
    if (s.rollen!.filter((r) => r === 'subjekt').length !== 1 || s.praedikat !== 1)
      problems.push(`Klasse 4, Satz ${s.id}: genau ein Subjekt, Prädikat an zweiter Stelle`)
  }
  for (const [art, list] of Object.entries(LUECKEN))
    list.forEach((l, i) => {
      const all = [l.richtig, ...l.falsch]
      if (new Set(all).size !== all.length || l.falsch.length < 2)
        problems.push(`Klasse 4, ${art} ${i + 1}: Antworten doppelt oder zu wenige`)
      if (!/[.!?“]$/.test(l.erklaerung))
        problems.push(`Klasse 4, ${art} ${i + 1}: Erklärung ohne Punkt`)
    })
  return problems
}

/** At least this many initial-sound groups must have enough words for the exercises. */
export const MIN_USABLE_ANLAUT_GROUPS = 12

/**
 * Listening vocabulary: well-formed entries with pictures, no picture used twice in
 * the pool, every rhyme group with a partner, enough usable initial-sound groups.
 * No lauttreue check – these words are only heard.
 */
export function checkListening(
  land: LandCode,
  grade: number,
  images: ReadonlySet<string>,
): string[] {
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
