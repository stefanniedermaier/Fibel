/** Feedback sounds, synthesised with Web Audio – no audio files needed. */

let ctx: AudioContext | undefined

function audio(): AudioContext | undefined {
  if (typeof AudioContext === 'undefined') return undefined
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Call on the first tap: browsers only allow audio after a user gesture. */
export function unlockAudio(): void {
  audio()
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, volume: number) {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

/** Bright rising "pling". */
export function playSuccess(): void {
  tone(784, 0, 0.18, 'sine', 0.25) // G5
  tone(1175, 0.1, 0.3, 'sine', 0.22) // D6
}

/** Soft, low "bonk" – not alarming. */
export function playError(): void {
  tone(220, 0, 0.25, 'triangle', 0.18)
  tone(196, 0.12, 0.25, 'triangle', 0.14)
}

/** Little fanfare for the crown. */
export function playCrown(): void {
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.35, 'sine', 0.22))
}
