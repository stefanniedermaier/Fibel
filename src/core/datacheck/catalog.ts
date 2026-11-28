/** Catalog structure: categories and teaching units of every entry. */
import { BASE_CATALOG, CATEGORIES as EXERCISE_CATEGORIES, UNITS } from '../content'

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
