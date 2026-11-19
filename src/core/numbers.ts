/**
 * German number words for the speech output, so the TTS never has to guess
 * whether "3 + 4" means "drei plus vier".
 */
const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
const TEENS = [
  'zehn',
  'elf',
  'zwölf',
  'dreizehn',
  'vierzehn',
  'fünfzehn',
  'sechzehn',
  'siebzehn',
  'achtzehn',
  'neunzehn',
]
const TENS = [
  '',
  '',
  'zwanzig',
  'dreißig',
  'vierzig',
  'fünfzig',
  'sechzig',
  'siebzig',
  'achtzig',
  'neunzig',
]

/** Number word for 0–1000 ("einundzwanzig", "hundertdrei"). */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 1000) throw new RangeError(`numberWord: ${n}`)
  if (n === 1000) return 'tausend'
  if (n >= 100) {
    const hundreds = Math.floor(n / 100)
    const rest = n % 100
    const prefix = hundreds === 1 ? 'hundert' : `${ONES[hundreds]}hundert`
    return rest === 0 ? prefix : prefix + numberWord(rest)
  }
  if (n < 10) return ONES[n] as string
  if (n < 20) return TEENS[n - 10] as string
  const tens = TENS[Math.floor(n / 10)] as string
  const ones = n % 10
  if (ones === 0) return tens
  return `${ones === 1 ? 'ein' : ONES[ones]}und${tens}`
}
