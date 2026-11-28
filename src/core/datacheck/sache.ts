/** Heimat- und Sachunterricht: terms, themes and their pictures. */
import { UNITS } from '../content'
import ablaeufe from '@/data/common/ablaeufe.json'
import { BEGRIFFE, THEMEN, unitOf } from '@/exercises/sache/shared'

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
    if (!UNITS.some((u) => u.id === unitOf(t))) problems.push(`${where}: Einheit fehlt`)
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
