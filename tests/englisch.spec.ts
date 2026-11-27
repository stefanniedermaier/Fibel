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
