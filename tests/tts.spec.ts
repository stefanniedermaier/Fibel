import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  START_TIMEOUT_MS,
  isGerman,
  pickGermanVoice,
  rankGermanVoices,
  speak,
  type VoiceInfo,
} from '@/core/tts'

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

describe('speak: lost first utterance', () => {
  interface FakeUtterance {
    text: string
    onstart: (() => void) | null
    onend: (() => void) | null
    onerror: ((e: { error: string }) => void) | null
  }

  /** A speech engine that drops the first `drop` utterances (never starts them). */
  function fakeEngine(drop: number) {
    const spoken: string[] = []
    const calls: string[] = []
    let dropped = 0
    const synth = {
      speaking: false,
      pending: false,
      paused: false,
      resume() {},
      cancel() {},
      speak(u: FakeUtterance) {
        calls.push(u.text)
        if (dropped < drop) {
          dropped++
          return
        }
        spoken.push(u.text)
        setTimeout(() => u.onstart?.(), 10)
        setTimeout(() => u.onend?.(), 200)
      },
    }
    vi.stubGlobal('speechSynthesis', synth)
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        onstart = null
        onend = null
        onerror = null
        constructor(public text: string) {}
      },
    )
    return { spoken, calls }
  }

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('spricht eine Ansage, die nicht startet, nach einer Sekunde noch einmal', async () => {
    const { spoken } = fakeEngine(1)
    const done = speak('Wie spät ist es?')
    await vi.advanceTimersByTimeAsync(START_TIMEOUT_MS - 1)
    expect(spoken).toEqual([])
    await vi.advanceTimersByTimeAsync(500)
    expect(spoken).toEqual(['Wie spät ist es?'])
    await vi.runAllTimersAsync()
    await expect(done).resolves.toBeUndefined()
  })

  it('wiederholt nichts, wenn die Ansage gleich startet', async () => {
    const { spoken } = fakeEngine(0)
    const done = speak('Rechne aus.')
    await vi.runAllTimersAsync()
    await done
    expect(spoken).toEqual(['Rechne aus.'])
  })

  it('versucht es nur einmal', async () => {
    const { calls } = fakeEngine(5)
    void speak('Hallo')
    await vi.advanceTimersByTimeAsync(5 * START_TIMEOUT_MS)
    expect(calls).toEqual(['Hallo', 'Hallo'])
  })
})
