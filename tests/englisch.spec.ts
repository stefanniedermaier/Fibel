import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { segments, shownText } from '@/core/speech'
import { rankEnglishVoices } from '@/core/tts'
import { dialog, hoeren, lesen } from '@/exercises/englisch'
import { WORDS } from '@/exercises/englisch/shared'

const ctx = { land: 'DE-BY', grade: 3, settings: resolveDefaults('DE-BY', 3) }

describe('Englisch', () => {
  it('teilt Texte in deutsche und englische Abschnitte', () => {
    expect(segments('Hör zu: [[en:dog]]. Tippe auf das Bild.')).toEqual([
      { text: 'Hör zu:', lang: 'de' },
      { text: 'dog', lang: 'en' },
      { text: '. Tippe auf das Bild.', lang: 'de' },
    ])
    expect(segments('Hallo')).toEqual([{ text: 'Hallo', lang: 'de' }])
    expect(shownText('Hör zu: [[en:How are you?]]')).toBe('Hör zu: How are you?')
  })

  it('bevorzugt eine britische Offline-Stimme', () => {
    const v = (name: string, lang: string, localService = true) => ({
      name,
      lang,
      voiceURI: name,
      localService,
      default: false,
    })
    const ranked = rankEnglishVoices([
      v('Anna', 'de-DE'),
      v('Online UK', 'en-GB', false),
      v('Samantha', 'en-US'),
      v('Daniel', 'en-GB'),
    ])
    expect(ranked.map((x) => x.name)[0]).toBe('Daniel')
    expect(ranked.some((x) => x.name === 'Anna')).toBe(false)
  })

  it('Hören, Lesen und Dialog: richtige Antwort dabei, keine doppelten Bilder', () => {
    const themen = [...new Set(WORDS.map((w) => w.thema))]
    for (const [module, params] of [
      [hoeren, { themen }],
      [lesen, { themen, richtung: 'wort-bild' }],
      [lesen, { themen, richtung: 'bild-wort' }],
      [dialog, {}],
    ] as const)
      for (const key of module.items(ctx, params as never))
        for (let seed = 0; seed < 5; seed++) {
          const t = module.generate(ctx, params as never, key, createRng(seed))
          const keys = t.data.choices.map((c) => c.key)
          expect(keys).toContain(t.data.correctKey)
          const looks = t.data.choices.map((c) => c.image ?? c.label)
          expect(new Set(looks).size, key).toBe(looks.length)
          expect(t.data.choices.length, key).toBeGreaterThanOrEqual(3)
        }
  })

  it('Hören verrät das Wort nicht im angezeigten Text', () => {
    const key = hoeren.items(ctx, { themen: ['tiere'] }).find((k) => k.endsWith('dog'))!
    const t = hoeren.generate(ctx, { themen: ['tiere'] }, key, createRng(1))
    expect(t.instruction).toContain('[[en:dog]]')
    expect(t.caption).not.toContain('dog')
  })
})

describe('Rechenzeichen beim Vorlesen', () => {
  it('liest mal, geteilt durch und minus', async () => {
    const { spokenSigns } = await import('@/core/speech')
    expect(spokenSigns('(34 + 26) : 2 = 30')).toBe('34 + 26 geteilt durch 2 = 30')
    expect(spokenSigns('7 · 8 − 6')).toBe('7 mal 8 minus 6')
    expect(spokenSigns('Hör zu: 9:05')).toBe('Hör zu: 9:05')
  })
})

describe('Englisch Klasse 4', () => {
  const ctx4 = { land: 'DE-BY', grade: 4, settings: resolveDefaults('DE-BY', 4) }
  it('Uhrzeiten und Preise auf Englisch', async () => {
    const { englishTime, englishPrice, englishNumber } = await import('@/exercises/englisch')
    expect(englishTime(3 * 60 + 30)).toBe("It's half past three.")
    expect(englishTime(3 * 60 + 45)).toBe("It's quarter to four.")
    expect(englishTime(12 * 60 + 45)).toBe("It's quarter to one.")
    expect(englishTime(7 * 60)).toBe("It's seven o'clock.")
    expect(englishNumber(45)).toBe('forty-five')
    expect(englishPrice(350)).toBe('three euros fifty')
    expect(englishPrice(199)).toBe('one euro ninety-nine')
  })
  it('alle neuen Übungen: Lösung wählbar, keine doppelten Antworten', async () => {
    const m = await import('@/exercises/englisch')
    for (const [mod, params] of [
      [m.uhrEnglisch, {}],
      [m.preisEnglisch, {}],
      [m.textEnglisch, {}],
      [m.abschreibenEnglisch, { themen: ['essen', 'kleidung', 'feste'] }],
    ] as const)
      for (const key of mod.items(ctx4, params as never)) {
        const t = mod.generate(ctx4, params as never, key, createRng(2)) as {
          data: { correctKey?: string; choices?: { key: string }[]; target?: string }
        }
        if (t.data.choices) {
          const keys = t.data.choices.map((c) => c.key)
          expect(new Set(keys).size, key).toBe(keys.length)
          expect(keys).toContain(t.data.correctKey)
        } else expect(t.data.target).toMatch(/^[a-z]+$/i)
      }
  })
  it('Dialoge der Klasse 4 erscheinen nicht in Klasse 3', async () => {
    const { dialog } = await import('@/exercises/englisch')
    expect(dialog.items(ctx, {}).some((k) => k.endsWith(':d50'))).toBe(false)
    expect(dialog.items(ctx4, {}).some((k) => k.endsWith(':d50'))).toBe(true)
  })
})
