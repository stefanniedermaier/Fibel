// Adds teaching units, catalog entries and categories from a compact spec file.
// Idempotent: entries with the same id are replaced, existing units and categories kept.
//
// Usage: node scripts/catalog-add.mjs spec.json
//
// Spec format (see docs/entwicklung.md, "Katalog erweitern"):
// {
//   "grade": 3,
//   "categories": [{ "id": "englisch.schule", "topic": "englisch", "title": "Schule", "icon": "🏫" }],
//   "units": [{
//     "id": "k3.englisch.classroom", "topic": "englisch", "category": "englisch.schule",
//     "title": "Classroom phrases", "term": 1,
//     "entries": [{ "suffix": "hoeren", "exercise": "englisch.hoeren",
//                   "params": { "themen": ["classroom"] }, "title": "Hören", "weight": 0.5 }]
//   }]
// }
// The entry id is "<unit id>.<suffix>". Afterwards run `npm run format` and `npm test`.
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = new URL('../src/data/basis/', import.meta.url)
const load = (name) => JSON.parse(readFileSync(new URL(`${name}.json`, BASE), 'utf8'))
const save = (name, value) =>
  writeFileSync(new URL(`${name}.json`, BASE), `${JSON.stringify(value, null, 2)}\n`)

export function apply(spec, data) {
  const { categories, units } = data
  let catalog = data.catalog
  const grade = spec.grade ?? 2
  const categoryIds = new Set(categories.map((c) => c.id))
  for (const c of spec.categories ?? []) if (!categoryIds.has(c.id)) categories.push(c)
  const unitIds = new Set(units.map((u) => u.id))
  for (const u of spec.units) {
    if (!unitIds.has(u.id))
      units.push({ id: u.id, grade, topic: u.topic, title: u.title, term: u.term })
    for (const e of u.entries) {
      const id = `${u.id}.${e.suffix}`
      const entry = {
        id,
        grade,
        topic: u.topic,
        category: u.category,
        unit: u.id,
        exercise: e.exercise,
        params: e.params ?? {},
        title: e.title,
        ...(e.weight !== undefined ? { weight: e.weight } : {}),
      }
      catalog = [...catalog.filter((x) => x.id !== id), entry]
    }
  }
  return { categories, units, catalog }
}

const file = process.argv[2]
if (!file) {
  console.error('Aufruf: node scripts/catalog-add.mjs spec.json')
  process.exit(1)
}
const result = apply(JSON.parse(readFileSync(file, 'utf8')), {
  categories: load('categories'),
  units: load('units'),
  catalog: load('catalog'),
})
save('categories', result.categories)
save('units', result.units)
save('catalog', result.catalog)
console.log(`Katalog: ${result.catalog.length} Einträge, ${result.units.length} Einheiten.`)
