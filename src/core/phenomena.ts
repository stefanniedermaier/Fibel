/**
 * Spelling phenomena of grade 2 (plaene/klasse-2.md, section 4; ISB Grundwortschatz
 * 1/2). Most are read off the spelling; Umlautung and Verhärtung need the related
 * form ("Hund" because of "Hunde") and are set in the data.
 */
export const PHENOMENA = {
  silben: 'Wörter in Silben mitsprechen',
  er: 'Wörter mit -er',
  el: 'Wörter mit -el',
  en: 'Wörter mit -en',
  ei: 'Wörter mit ei',
  eu: 'Wörter mit eu und äu',
  ng: 'Wörter mit ng',
  nk: 'Wörter mit nk',
  sp: 'Wörter mit Sp/sp',
  st: 'Wörter mit St/st',
  ch: 'Wörter mit ch',
  sch: 'Wörter mit sch',
  pf: 'Wörter mit pf',
  qu: 'Wörter mit qu',
  r: 'Wörter mit r nach einem Selbstlaut',
  ie: 'Wörter mit ie',
  doppel: 'Wörter mit doppeltem Mitlaut',
  umlaut: 'Umlaute ableiten',
  verhaertung: 'Verlängern: b oder p, d oder t, g oder k?',
  haeufig: 'Häufige Wörter',
  ss: 'Wörter mit ß',
  tz: 'Wörter mit tz',
  ck: 'Wörter mit ck',
  c: 'Wörter mit C',
  v: 'Wörter mit V/v',
  y: 'Wörter mit y',
  x: 'Wörter mit x',
  h: 'Wörter mit h, das man nicht hört',
  ae: 'Wörter mit ä',
  ai: 'Wörter mit ai',
} as const

export type Phenomenon = keyof typeof PHENOMENA

const VOWEL = '[aeiouäöü]'

/** Phenomena that can be read off the written word and its syllables. */
export function derivePhenomena(text: string, syllables: readonly string[]): Phenomenon[] {
  const t = text.toLowerCase()
  const syl = syllables.map((s) => s.toLowerCase())
  const multi = syl.length >= 2
  const found: Phenomenon[] = []
  const add = (p: Phenomenon, yes: boolean) => yes && found.push(p)
  add('er', multi && syl.slice(1).some((s) => s.endsWith('er')))
  add('el', multi && syl.slice(1).some((s) => s.endsWith('el')))
  add('en', multi && t.endsWith('en'))
  add('ei', t.includes('ei'))
  add('eu', /eu|äu/.test(t))
  add('ng', t.includes('ng'))
  add('nk', t.includes('nk'))
  add('sp', t.startsWith('sp'))
  add('st', t.startsWith('st'))
  add('ch', /(^|[^s])ch/.test(t))
  add('sch', t.includes('sch'))
  add('pf', t.includes('pf'))
  add('qu', t.includes('qu'))
  add('ie', t.includes('ie'))
  add('doppel', /([bdfglmnprst])\1/.test(t))
  add('ss', t.includes('ß'))
  add('tz', t.includes('tz'))
  add('ck', t.includes('ck'))
  add('c', /c(?![hk])/.test(t))
  add('v', t.includes('v'))
  add('y', t.includes('y'))
  add('x', t.includes('x'))
  add('h', new RegExp(`${VOWEL}h`).test(t.replace(/[cs]h/g, '')))
  add('ai', t.includes('ai'))
  // r after a vowel at the end of a syllable or before a consonant (Gar-ten, Wort);
  // the unstressed ending -er has its own phenomenon.
  add(
    'r',
    syl.some(
      (s, i) =>
        new RegExp(`${VOWEL}r[^aeiouäöü]*$`).test(s) && !(multi && i > 0 && s.endsWith('er')),
    ),
  )
  return found
}

/** Is the phenomenon visible in the word? (data check for the set ones) */
export function showsPhenomenon(p: Phenomenon, text: string, syllables: readonly string[]) {
  if (p === 'silben' || p === 'haeufig' || p === 'umlaut' || p === 'verhaertung') return true
  if (p === 'ae') return text.toLowerCase().includes('ä')
  return derivePhenomena(text, syllables).includes(p)
}
