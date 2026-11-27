import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { resolveWords } from '@/core/words'
import { textSentences, textstelle } from '@/exercises/lesen/textstelle'
import { cleanSentence, matches } from '@/exercises/schreiben/tippen'
import { separable, wrongSeparations } from '@/exercises/schreiben/trennen'
import { wrongPartizip, wrongPraeteritum, wrongSteigerung } from '@/exercises/sprache/klasse3'
import { SAETZE, umgestellt } from '@/exercises/sprache/satzglieder'

const ctx = { land: 'DE-BY', grade: 3, settings: resolveDefaults('DE-BY', 3) }
const words = resolveWords('DE-BY', 3)
const word = (id: string) => words.find((w) => w.id === id)!

describe('Deutsch Klasse 3', () => {
  it('Trennen: Silbengelenk richtig, ein einzelner Buchstabe nie', () => {
    expect(word('zimmer').syllables.join('-')).toBe('Zim-mer')
    expect(wrongSeparations(word('tasche'))).toEqual(expect.arrayContaining(['T-asche', 'Tas-che']))
    expect(wrongSeparations(word('tasche'))).not.toContain('Ta-sche')
    expect(separable(word('abend'))).toBe(false)
  })

  it('Satz-Diktat: Leerzeichen und Satzzeichen zählen mit', () => {
    expect(cleanSentence('Wir  schwimmen im See.')).toBe('Wir  schwimmen im See.')
    expect(matches(' Wir schwimmen  im See. ', 'Wir schwimmen im See.', true)).toBe(true)
    expect(matches('wir schwimmen im See.', 'Wir schwimmen im See.', true)).toBe(false)
  })

  it('Formen: falsche Formen sind nie die richtige', () => {
    for (const w of words) {
      if (w.steigerung) {
        expect(wrongSteigerung(w, 0)).not.toContain(w.steigerung[0])
        expect(wrongSteigerung(w, 1)).not.toContain(w.steigerung[1])
        expect(wrongSteigerung(w, 0).length).toBeGreaterThanOrEqual(2)
      }
      if (w.praeteritum) expect(wrongPraeteritum(w)).not.toContain(w.praeteritum)
      if (w.perfekt) expect(wrongPartizip(w)).not.toContain(w.perfekt.split(' ').at(-1))
    }
    expect(word('singen').praeteritum).toBe('sang')
    expect(word('singen').perfekt).toBe('hat gesungen')
  })

  it('Umstellprobe: das Verb steht immer an zweiter Stelle', () => {
    const g1 = SAETZE.find((s) => s.id === 'g1')!
    expect(umgestellt(g1, 3)).toBe('Im Garten bellt der Hund laut.')
    for (const s of SAETZE)
      for (let first = 0; first < s.glieder.length; first++) {
        if (first === s.praedikat) continue
        const satz = umgestellt(s, first)
        expect(satz.startsWith(s.glieder[first]!.charAt(0).toUpperCase())).toBe(true)
      }
  })

  it('Wo steht das? Der richtige Satz enthält die Antwort', () => {
    expect(textSentences('Er sagte: „Hallo!“ Dann ging er.')).toEqual([
      'Er sagte: „Hallo!“',
      'Dann ging er.',
    ])
    for (const key of textstelle.items(ctx, {})) {
      const d = textstelle.generate(ctx, {}, key, createRng(1)).data
      expect(d.correct, key).toBeGreaterThanOrEqual(0)
      expect(d.correct).toBeLessThan(d.sentences.length)
    }
  })
})
