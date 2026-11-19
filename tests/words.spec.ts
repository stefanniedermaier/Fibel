import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { graphemes, usesOnly } from '@/core/graphemes'
import { checkLauttreu, deriveLevel } from '@/core/lauttreue'
import type { LandOverlay, WordEntry } from '@/core/types'
import {
  LETTERS,
  applyWordOverlay,
  baseSyllables,
  resolveWords,
  scriptFor,
  syllablesForSettings,
  wordsForSettings,
} from '@/core/words'

describe('graphemes', () => {
  it.each([
    ['Oma', ['o', 'm', 'a']],
    ['Schaf', ['sch', 'a', 'f']],
    ['Eis', ['ei', 's']],
    ['Auto', ['au', 't', 'o']],
    ['Eule', ['eu', 'l', 'e']],
    ['Kuchen', ['k', 'u', 'ch', 'e', 'n']],
    ['Pfau', ['pf', 'au']],
    ['Käse', ['k', 'ä', 's', 'e']],
  ])('%s → %j', (word, expected) => {
    expect(graphemes(word)).toEqual(expected)
  })

  it('prüft, ob ein Wort nur freigeschaltete Grapheme nutzt', () => {
    const unlocked = new Set(['a', 'e', 'i', 'o', 'u', 'm', 'l'])
    expect(usesOnly('Oma', unlocked)).toBe(true)
    expect(usesOnly('Lama', unlocked)).toBe(true)
    expect(usesOnly('Rose', unlocked)).toBe(false)
    // "Eis" needs the grapheme ei, not just e and i.
    expect(usesOnly('Eis', new Set(['e', 'i', 's']))).toBe(false)
  })
})

describe('Lauttreue-Regeln', () => {
  const ok: [string, string[]][] = [
    ['Oma', ['O', 'ma']],
    ['Rose', ['Ro', 'se']],
    ['Tomate', ['To', 'ma', 'te']],
    ['Igel', ['I', 'gel']],
    ['Brot', ['Brot']],
    ['Kran', ['Kran']],
    ['Kamera', ['Ka', 'me', 'ra']],
    ['Schere', ['Sche', 're']],
    ['Kuchen', ['Ku', 'chen']],
  ]
  it.each(ok)('%s ist lauttreu', (text, syllables) => {
    expect(checkLauttreu(text, syllables)).toEqual([])
  })

  const notOk: [string, string[], string][] = [
    ['Sonne', ['Son', 'ne'], 'Doppelkonsonant'],
    ['Ball', ['Ball'], 'Doppelkonsonant'],
    ['Biene', ['Bie', 'ne'], 'ie'],
    ['Boot', ['Boot'], 'Doppelvokal'],
    ['Kuh', ['Kuh'], 'Dehnungs-h'],
    ['Zahn', ['Zahn'], 'Dehnungs-h'],
    ['Hund', ['Hund'], 'Auslautverhärtung'],
    ['Rad', ['Rad'], 'Auslautverhärtung'],
    ['Berg', ['Berg'], 'Auslautverhärtung'],
    ['Tiger', ['Ti', 'ger'], 'vokalisiertes r'],
    ['Wurm', ['Wurm'], 'vokalisiertes r'],
    ['Stern', ['Stern'], 'st/sp am Anfang'],
    ['Spiel', ['Spiel'], 'st/sp am Anfang'],
    ['Katze', ['Kat', 'ze'], 'ck/tz'],
    ['Vogel', ['Vo', 'gel'], 'v, x, y, ß, qu'],
    ['Fuß', ['Fuß'], 'v, x, y, ß, qu'],
    ['Ring', ['Ring'], 'ng/nk'],
    ['Fuchs', ['Fuchs'], 'chs'],
    ['Hai', ['Hai'], 'ai'],
    ['Clown', ['Clown'], 'c ohne ch/sch'],
  ]
  it.each(notOk)('%s ist nicht lauttreu (%s)', (text, syllables, rule) => {
    expect(checkLauttreu(text, syllables).map((v) => v.rule)).toContain(rule)
  })

  it('erlaubt silbentrennendes h am Silbenanfang (U-hu)', () => {
    expect(checkLauttreu('Uhu', ['U', 'hu'])).toEqual([])
  })
})

describe('deriveLevel', () => {
  it.each([
    ['Oma', ['O', 'ma'], 1],
    ['Rose', ['Ro', 'se'], 1],
    ['Tomate', ['To', 'ma', 'te'], 2],
    ['Koala', ['Ko', 'a', 'la'], 2],
    ['Igel', ['I', 'gel'], 3],
    ['Wal', ['Wal'], 3],
    ['Zebra', ['Ze', 'bra'], 3],
    ['Schaf', ['Schaf'], 4],
    ['Löwe', ['Lö', 'we'], 4],
    ['Eis', ['Eis'], 4],
  ] as const)('%s → Level %i', (text, syllables, level) => {
    expect(deriveLevel(text, [...syllables])).toBe(level)
  })
})

describe('Wortlisten mit Länderanpassung', () => {
  const base: WordEntry[] = [
    { id: 'oma', text: 'Oma', syllables: ['O', 'ma'], image: '1F475', category: 'menschen' },
    { id: 'opa', text: 'Opa', syllables: ['O', 'pa'], image: '1F474', category: 'menschen' },
  ]
  const extra: WordEntry[] = [
    { id: 'rose', text: 'Rose', syllables: ['Ro', 'se'], image: '1F339', category: 'natur' },
  ]
  const overlay = (words: NonNullable<LandOverlay['words']>): LandOverlay => ({
    land: 'DE-XX',
    words,
  })
  const lookup = (_land: string, path: string) => (path === 'extra.json' ? extra : undefined)

  it('entfernt, ergänzt und markiert den Grundwortschatz', () => {
    const words = applyWordOverlay(
      base,
      1,
      overlay({ '1': { add: 'extra.json', remove: ['opa'], grundwortschatz: ['oma', 'rose'] } }),
      lookup,
    )
    expect(words.map((w) => [w.id, w.source, w.grundwortschatz])).toEqual([
      ['oma', 'basis', true],
      ['rose', 'DE-XX', true],
    ])
    expect(words[1]?.level).toBe(1)
  })

  it('meldet fehlende Dateien, unbekannte und doppelte Wörter', () => {
    expect(() =>
      applyWordOverlay(base, 1, overlay({ '1': { add: 'gibtsnicht.json' } }), lookup),
    ).toThrow(/fehlt/)
    expect(() => applyWordOverlay(base, 1, overlay({ '1': { remove: ['xx'] } }), lookup)).toThrow(
      /xx/,
    )
    expect(() =>
      applyWordOverlay(base, 1, overlay({ '1': { grundwortschatz: ['xx'] } }), lookup),
    ).toThrow(/xx/)
    expect(() =>
      applyWordOverlay([...base, ...extra], 1, overlay({ '1': { add: 'extra.json' } }), lookup),
    ).toThrow(/existiert/)
  })

  it('liefert für Bayern Basis plus Grundwortschatz-Ergänzungen', () => {
    const words = resolveWords('DE-BY', 1)
    expect(words.length).toBeGreaterThanOrEqual(100)
    expect(words.find((w) => w.id === 'raupe')?.source).toBe('DE-BY')
    expect(words.find((w) => w.id === 'oma')?.grundwortschatz).toBe(true)
    expect(words.find((w) => w.id === 'lama')?.grundwortschatz).toBe(false)
    expect(scriptFor('DE-BY', 1)).toBe('druckschrift')
  })

  it('filtert nach freigeschalteten Buchstaben (Startwerte Klasse 1)', () => {
    const settings = resolveDefaults('DE-BY', 1)
    const words = wordsForSettings(resolveWords('DE-BY', 1), settings)
    expect(words.map((w) => w.text).sort()).toEqual(['Lama', 'Limo', 'Mama', 'Oma'])
    const syllables = syllablesForSettings(baseSyllables(1), settings)
    expect(syllables.map((s) => s.text)).toEqual([
      'ma',
      'me',
      'mi',
      'mo',
      'mu',
      'la',
      'le',
      'li',
      'lo',
      'lu',
    ])
    expect(
      wordsForSettings(resolveWords('DE-BY', 1), { ...settings, letterFilter: false }).length,
    ).toBe(resolveWords('DE-BY', 1).length)
  })

  it('hat für jedes Graphem einen Buchstaben-Eintrag', () => {
    const ids = new Set(LETTERS.map((l) => l.id))
    for (const w of resolveWords('DE-BY', 1))
      for (const g of w.graphemes) expect(ids.has(g), g).toBe(true)
  })
})
