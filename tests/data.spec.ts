/**
 * Data check for all dictionaries: npm run data:check (also part of npm test and CI).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkData } from '@/core/datacheck'

const images = new Set(
  readdirSync(join(__dirname, '..', 'public', 'img', 'openmoji'))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4)),
)

describe('Wörterbücher und Länderanpassungen', () => {
  it('haben keine Fehler', () => {
    const problems = checkData(images)
    // One line per problem, so the output reads like a to-do list.
    expect(problems, `\n${problems.join('\n')}\n`).toEqual([])
  })
})

describe('Bilder im Programmcode', () => {
  it('jedes OpenMoji im Code ist mitkopiert (sonst in common/code-bilder.json eintragen)', () => {
    const files: string[] = []
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name)
        if (e.isDirectory()) walk(p)
        else if (/\.(ts|vue)$/.test(e.name)) files.push(p)
      }
    }
    walk(join(__dirname, '..', 'src'))
    const missing = new Set<string>()
    for (const f of files)
      for (const m of readFileSync(f, 'utf8').matchAll(
        /'((?:1F[0-9A-F]{3,4}|2[0-9A-F]{3})(?:-[0-9A-F]{4,5})*)'/g,
      ))
        if (!images.has(m[1]!)) missing.add(m[1]!)
    expect([...missing]).toEqual([])
  })
})
