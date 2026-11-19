/**
 * Data check for all dictionaries: npm run data:check (also part of npm test and CI).
 */
import { readdirSync } from 'node:fs'
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
