/**
 * Thin wrapper around the Web Speech API (speechSynthesis).
 * Phase 0: voice selection + speaking. Phase 1 adds queue, `say` overrides and number words.
 */

/** The subset of SpeechSynthesisVoice we rely on (keeps the selection logic testable). */
export interface VoiceInfo {
  name: string
  lang: string
  voiceURI: string
  localService: boolean
  default: boolean
}

export interface SpeakOptions {
  voice?: SpeechSynthesisVoice
  /** 0.1–10, 1 = normal. Slightly slower suits young children. */
  rate?: number
  pitch?: number
}

export const DEFAULT_RATE = 0.85
export const DEFAULT_PITCH = 1.05

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function normalizedLang(voice: VoiceInfo): string {
  return voice.lang.replace('_', '-').toLowerCase()
}

export function isGerman(voice: VoiceInfo): boolean {
  return normalizedLang(voice).startsWith('de')
}

/**
 * Ranks German voices: an explicitly preferred voice wins, then offline voices
 * (so the app also speaks in flight mode), then de-DE over other German variants.
 */
export function rankGermanVoices<T extends VoiceInfo>(voices: T[], preferredURI?: string): T[] {
  const score = (v: T): number =>
    (v.voiceURI === preferredURI ? 100 : 0) +
    (v.localService ? 10 : 0) +
    (normalizedLang(v) === 'de-de' ? 5 : 0) +
    (v.default ? 1 : 0)
  return voices.filter(isGerman).sort((a, b) => score(b) - score(a))
}

export function pickGermanVoice<T extends VoiceInfo>(
  voices: T[],
  preferredURI?: string,
): T | undefined {
  return rankGermanVoices(voices, preferredURI)[0]
}

/**
 * Chrome loads voices asynchronously; getVoices() is often empty right after start.
 * Waits for `voiceschanged`, but gives up after `timeoutMs`.
 */
export function loadVoices(timeoutMs = 3000): Promise<SpeechSynthesisVoice[]> {
  if (!isTtsSupported()) return Promise.resolve([])
  const synth = window.speechSynthesis
  const now = synth.getVoices()
  if (now.length > 0) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener('voiceschanged', done)
      clearTimeout(timer)
      resolve(synth.getVoices())
    }
    const timer = setTimeout(done, timeoutMs)
    synth.addEventListener('voiceschanged', done)
  })
}

/**
 * Chrome drops utterances whose object was garbage-collected before `end` fired, so the
 * one being spoken is kept here.
 */
let currentUtterance: SpeechSynthesisUtterance | undefined

/** Chrome may swallow an utterance queued in the same tick as `cancel()`. */
const CANCEL_GAP_MS = 60

/** Speaks `text`, cancelling anything still being spoken. Resolves when finished. */
export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  if (!isTtsSupported()) throw new Error('Sprachausgabe wird nicht unterstützt')
  const synth = window.speechSynthesis
  if (synth.speaking || synth.pending) {
    synth.cancel()
    await new Promise((resolve) => setTimeout(resolve, CANCEL_GAP_MS))
  }
  // A paused engine (Chrome after the tab was in the background) would queue silently.
  if (synth.paused) synth.resume()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = options.voice?.lang ?? 'de-DE'
  if (options.voice) utterance.voice = options.voice
  utterance.rate = options.rate ?? DEFAULT_RATE
  utterance.pitch = options.pitch ?? DEFAULT_PITCH
  currentUtterance = utterance
  return new Promise((resolve, reject) => {
    const settle = (fn: () => void) => {
      if (currentUtterance === utterance) currentUtterance = undefined
      fn()
    }
    utterance.onend = () => settle(resolve)
    utterance.onerror = (e) =>
      // 'interrupted'/'canceled' happen when a new text replaces the current one – not an error.
      settle(() =>
        e.error === 'interrupted' || e.error === 'canceled'
          ? resolve()
          : reject(new Error(e.error)),
      )
    synth.speak(utterance)
  })
}

/**
 * Wakes the speech engine with a silent utterance. Call from a tap: on Android the very
 * first utterance after start is otherwise often lost (engine still starting, or no
 * user activation yet when the first task speaks).
 */
export function primeSpeech(): void {
  if (!isTtsSupported()) return
  const synth = window.speechSynthesis
  if (synth.speaking || synth.pending) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  u.lang = 'de-DE'
  currentUtterance = u
  synth.speak(u)
}
