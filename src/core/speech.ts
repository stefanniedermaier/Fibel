/** Speech output with the profile's voice and tempo. Errors never break the app. */
import phrases from '@/data/common/phrases.json'
import { pickOne, type Rng } from './random'
import { isTtsSupported, loadVoices, pickGermanVoice, rankEnglishVoices, speak } from './tts'
import type { ProfileSettings } from './types'

let voices: Promise<SpeechSynthesisVoice[]> | undefined

export interface VoiceSettings {
  voiceURI: ProfileSettings['voiceURI']
  voiceURIEn?: ProfileSettings['voiceURIEn']
  speechRate: ProfileSettings['speechRate']
}

/** A part of a text in one language. English is marked as [[en:…]] in the texts. */
export interface Segment {
  text: string
  lang: 'de' | 'en'
}

export function segments(text: string): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of text.matchAll(/\[\[en:(.+?)\]\]/g)) {
    const before = text.slice(last, m.index).trim()
    if (before) out.push({ text: before, lang: 'de' })
    out.push({ text: m[1]!.trim(), lang: 'en' })
    last = m.index! + m[0].length
  }
  const rest = text.slice(last).trim()
  if (rest) out.push({ text: rest, lang: 'de' })
  return out
}

/** Arithmetic signs as words, so every voice reads "7 · 8" as "7 mal 8". */
export const spokenSigns = (text: string) =>
  text
    .replace(/ · /g, ' mal ')
    .replace(/ : /g, ' geteilt durch ')
    .replace(/ − /g, ' minus ')
    .replace(/[()]/g, '')

/** The text as shown: English markers removed ("Hör zu: dog."). */
export const shownText = (text: string) => text.replace(/\[\[en:(.+?)\]\]/g, '$1')

/** Speaks `text`; resolves when done – or after `maxMs` at the latest. */
export async function say(text: string, settings: VoiceSettings, maxMs = 8000): Promise<void> {
  if (!isTtsSupported() || !text.trim()) return
  voices ??= loadVoices()
  const all = await voices
  const german = pickGermanVoice(all, settings.voiceURI ?? undefined)
  const english = rankEnglishVoices(all, settings.voiceURIEn ?? undefined)[0]
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, maxMs))
  const run = async () => {
    for (const part of segments(text)) {
      const en = part.lang === 'en'
      await speak(en ? part.text : spokenSigns(part.text), {
        voice: en ? english : german,
        lang: en ? 'en-GB' : 'de-DE',
        // English words a little slower: the children hear them for the first time.
        rate: en ? Math.min(settings.speechRate, 0.8) : settings.speechRate,
      })
    }
  }
  try {
    await Promise.race([run(), timeout])
  } catch {
    // A missing voice must not stop a unit.
  }
}

export function stopSpeaking(): void {
  if (isTtsSupported()) window.speechSynthesis.cancel()
}

export type PhraseKey = keyof typeof phrases

/** A random phrase of a kind; `{name}` etc. are filled in from `values`. */
export function phrase(key: PhraseKey, rng: Rng, values: Record<string, string> = {}): string {
  return pickOne(phrases[key], rng).replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '')
}
