/** Englisch: words, pictures and dialogues. */
import { DIALOGE, WORDS as ENGLISH_WORDS } from '@/exercises/englisch/shared'

/** Englisch: unique ids and words, pictures exist, dialogue answers differ. */
export function checkEnglisch(images: ReadonlySet<string>): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  for (const w of ENGLISH_WORDS) {
    if (ids.has(w.id)) problems.push(`Englisch: Wort-Id ${w.id} doppelt`)
    ids.add(w.id)
    if (w.image && !images.has(w.image)) problems.push(`Englisch „${w.en}“: Bild ${w.image} fehlt`)
    if (!w.image && w.thema !== 'zahlen') problems.push(`Englisch „${w.en}“: ohne Bild`)
  }
  for (const d of DIALOGE) {
    const all = [d.antwort, ...d.falsch]
    if (new Set(all).size !== all.length || d.falsch.length < 2)
      problems.push(`Englisch-Dialog ${d.id}: Antworten doppelt oder zu wenige`)
  }
  return problems
}
