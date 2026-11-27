import { describe, expect, it } from 'vitest'
import { resolveDefaults, unitEnabled } from '@/core/content'
import { graphemes } from '@/core/graphemes'
import { createRng } from '@/core/random'
import { resolveWords, wordsForSettings } from '@/core/words'
import { daten } from '@/exercises/rechnen/daten'
import { endOf, makePath, pfeilweg, spokenPath, SIZE } from '@/exercises/formen/pfeilweg'
import { isSymmetric, makeFigure, symmetrie } from '@/exercises/formen/symmetrie'
import { wortbildung, ZUSAMMENSETZUNGEN } from '@/exercises/sprache/wortbildung'

const settings = resolveDefaults('DE-BY', 1)
const ctx = { land: 'DE-BY', grade: 1, settings }

describe('Phase 5: Zusätze', () => {
  it('sind anfangs aus (2. Halbjahr), die Eltern schalten sie frei', () => {
    for (const u of [
      'k1.schreiben.wortbildung',
      'k1.rechnen.pfeilwege',
      'k1.rechnen.symmetrie',
      'k1.rechnen.daten',
    ])
      expect(unitEnabled(u, settings)).toBe(false)
    expect(settings.schreibwerkstatt).toBe(false)
  })

  it('St und Sp: am Wortanfang eine Gruppe, im Wort zwei Buchstaben', () => {
    expect(graphemes('Stein')).toEqual(['st', 'ei', 'n'])
    expect(graphemes('Spinat')).toEqual(['sp', 'i', 'n', 'a', 't'])
    expect(graphemes('ist')).toEqual(['i', 's', 't'])
    expect(graphemes('Wespe')).toEqual(['w', 'e', 's', 'p', 'e'])
    const words = resolveWords('DE-BY', 1)
    const letters = 'a e i o u m l s t n r f p ei'.split(' ')
    const without = wordsForSettings(words, { ...settings, letters }).map((w) => w.text)
    const withSt = wordsForSettings(words, { ...settings, letters: [...letters, 'st'] }).map(
      (w) => w.text,
    )
    expect(without).not.toContain('Stein')
    expect(withSt).toContain('Stein')
  })

  it('Wörter zusammensetzen: das neue Wort ist dabei', () => {
    for (const key of wortbildung.items(ctx, {})) {
      const t = wortbildung.generate(ctx, {}, key, createRng(1))
      expect(t.data.choices.map((c) => c.key)).toContain(t.data.correctKey)
      expect(t.data.prompt).toHaveLength(2)
    }
    expect(ZUSAMMENSETZUNGEN.length).toBeGreaterThanOrEqual(8)
  })

  it('Pfeilweg: bleibt im Feld und endet nicht am Start', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { start, arrows } = makePath(4, createRng(seed))
      const [x, y] = endOf(start, arrows)
      expect(x >= 0 && y >= 0 && x < SIZE && y < SIZE).toBe(true)
      expect([x, y]).not.toEqual(start)
    }
    expect(spokenPath(['rechts', 'rechts', 'runter'])).toBe('zwei nach rechts, eins nach unten')
    const t = pfeilweg.generate(ctx, {}, 'formen.pfeilweg:3', createRng(2))
    expect(t.data.arrows).toHaveLength(3)
  })

  it('Symmetrie: die Antwort stimmt zur Figur, mal ja, mal nein', () => {
    for (let seed = 0; seed < 30; seed++) {
      expect(isSymmetric(makeFigure(true, createRng(seed)))).toBe(true)
      expect(isSymmetric(makeFigure(false, createRng(seed)))).toBe(false)
    }
    const answers = new Set<string>()
    for (let seed = 0; seed < 20; seed++) {
      const d = symmetrie.generate(ctx, {}, 'formen.symmetrie:a', createRng(seed)).data
      expect(isSymmetric(d.cells)).toBe(d.correctKey === 'ja')
      answers.add(d.correctKey)
    }
    expect([...answers].sort()).toEqual(['ja', 'nein'])
  })

  it('Strichliste: richtige Anzahl, genau eine größte Reihe', () => {
    for (const key of daten.items(ctx, { mode: 'zaehlen' })) {
      const d = daten.generate(ctx, { mode: 'zaehlen' }, key, createRng(4)).data
      const asked = d.rows.find((r) => r.key === d.asked)!
      expect(String(asked.count)).toBe(d.correctKey)
      expect(new Set(d.choices.map((c) => c.key)).size).toBe(3)
    }
    for (let seed = 0; seed < 20; seed++) {
      const d = daten.generate(
        ctx,
        { mode: 'meiste' },
        'rechnen.daten:meiste:a',
        createRng(seed),
      ).data
      const max = Math.max(...d.rows.map((r) => r.count))
      expect(d.rows.find((r) => r.key === d.correctKey)!.count).toBe(max)
      expect(d.rows.filter((r) => r.count === max)).toHaveLength(1)
    }
  })
})
