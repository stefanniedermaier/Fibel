/** Speech output with the profile's voice and tempo. Errors never break the app. */
import phrases from '@/data/common/phrases.json'
import { pickOne, type Rng } from './random'
import { isTtsSupported, loadVoices, pickGermanVoice, speak } from './tts'
import type { ProfileSettings } from './types'

let voices: Promise<SpeechSynthesisVoice[]> | undefined

export interface VoiceSettings {
  voiceURI: ProfileSettings['voiceURI']
  speechRate: ProfileSettings['speechRate']
}

/** Speaks `text`; resolves when done – or after `maxMs` at the latest. */
export async function say(text: string, settings: VoiceSettings, maxMs = 8000): Promise<void> {
  if (!isTtsSupported() || !text.trim()) return
  voices ??= loadVoices()
  const voice = pickGermanVoice(await voices, settings.voiceURI ?? undefined)
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, maxMs))
  try {
    await Promise.race([speak(text, { voice, rate: settings.speechRate }), timeout])
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
