import { describe, expect, it } from 'vitest'
import { isGerman, pickGermanVoice, rankGermanVoices, type VoiceInfo } from '@/core/tts'

const voice = (
  name: string,
  lang: string,
  localService: boolean,
  isDefault = false,
): VoiceInfo => ({
  name,
  lang,
  voiceURI: name,
  localService,
  default: isDefault,
})

describe('German voice selection', () => {
  const voices = [
    voice('English', 'en-US', true, true),
    voice('Deutsch online', 'de-DE', false),
    voice('Deutsch Österreich offline', 'de-AT', true),
    voice('Deutsch offline', 'de-DE', true),
  ]

  it('recognises German voices including the Android underscore notation', () => {
    expect(isGerman(voice('a', 'de_DE', true))).toBe(true)
    expect(isGerman(voice('b', 'DE-ch', true))).toBe(true)
    expect(isGerman(voice('c', 'en-GB', true))).toBe(false)
  })

  it('prefers offline de-DE, then other offline German voices, then online ones', () => {
    expect(rankGermanVoices(voices).map((v) => v.name)).toEqual([
      'Deutsch offline',
      'Deutsch Österreich offline',
      'Deutsch online',
    ])
  })

  it('honours an explicitly chosen voice', () => {
    expect(pickGermanVoice(voices, 'Deutsch online')?.name).toBe('Deutsch online')
  })

  it('returns undefined when there is no German voice', () => {
    expect(pickGermanVoice([voice('English', 'en-US', true)])).toBeUndefined()
  })
})
