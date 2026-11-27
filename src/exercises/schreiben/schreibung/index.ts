/**
 * S2-2 bis S2-8 "Wie schreibt man das?" (Deutsch 1/2, 4.4; ISB Grundwortschatz 1/2):
 * the word is spoken (with a picture if there is one); the child picks the right
 * spelling among two typical mistakes of the word's phenomena (Bine for Biene, Sone for
 * Sonne). After the answer the right word is shown and read out.
 */
import { shuffle } from '@/core/random'
import type { Word } from '@/core/types'
import type { ExerciseModule } from '../../types'
import { findWord, gradeWords, itemId, spoken, writingPool, type SchreibenParams } from '../shared'
import WahlTask, { type WahlData } from './WahlTask.vue'

const V = 'aeiouäöü'

/** Typical misspellings per phenomenon (only those that change the word). */
const MISTAKES: Record<string, (t: string) => string[]> = {
  ie: (t) => [t.replace('ie', 'i')],
  doppel: (t) => [t.replace(/([bdfglmnprst])\1/, '$1')],
  er: (t) => [t.replace(/er$/, 'a')],
  el: (t) => [t.replace(/el$/, 'l')],
  en: (t) => [t.replace(/en$/, 'n')],
  ei: (t) => [t.replace('ei', 'ai').replace(/^Ei/, 'Ai')],
  eu: (t) => [t.replace('eu', 'oi').replace('äu', 'eu').replace(/^Eu/, 'Oi')],
  ng: (t) => [t.replace('ng', 'nk')],
  nk: (t) => [t.replace('nk', 'ng')],
  sp: (t) => [t.replace(/^(S|s)p/, '$1chp')],
  st: (t) => [t.replace(/^(S|s)t/, '$1cht')],
  ch: (t) => [t.replace(/([^s])ch/, '$1k')],
  sch: (t) => [t.replace('sch', 'sh').replace(/^Sch/, 'Sh')],
  pf: (t) => [t.replace('pf', 'f').replace(/^Pf/, 'F')],
  qu: (t) => [t.replace('qu', 'kw').replace(/^Qu/, 'Kw')],
  r: (t) => [t.replace(new RegExp(`([${V}])r(?=[^${V}]|$)`), '$1')],
  h: (t) => [t.replace(new RegExp(`([${V}])h`), '$1')],
  ss: (t) => [t.replace('ß', 'ss'), t.replace('ß', 's')],
  tz: (t) => [t.replace('tz', 'z')],
  ck: (t) => [t.replace('ck', 'k')],
  c: (t) => [t.replace(/^C/, 'Z').replace(/^c/, 'z'), t.replace(/^C/, 'K')],
  v: (t) => [t.replace(/^V/, 'F').replace('v', 'f')],
  y: (t) => [t.replace('y', 'i'), t.replace('y', 'ü')],
  x: (t) => [t.replace('x', 'ks'), t.replace('x', 'gs')],
  ai: (t) => [t.replace('ai', 'ei')],
  ae: (t) => [t.replace('ä', 'e')],
  verhaertung: (t) => [
    t.replace(/[bdg](?=[^aeiouäöü]*$)/, (c) => ({ b: 'p', d: 't', g: 'k' })[c]!),
  ],
}

/**
 * Two to three wrong spellings of the word (also a small first letter for nouns). A
 * "mistake" that is a real word of the dictionary (Buch → Busch) is never offered.
 */
export function misspellings(word: Word, real: ReadonlySet<string> = new Set()): string[] {
  const wrong = new Set<string>()
  for (const p of word.phenomena)
    for (const w of MISTAKES[p]?.(word.text) ?? [])
      if (w !== word.text && !real.has(w.toLowerCase())) wrong.add(w)
  if (word.wortart === 'nomen') wrong.add(word.text.charAt(0).toLowerCase() + word.text.slice(1))
  return [...wrong]
}

const realWords = (words: readonly Word[]) => new Set(words.map((w) => w.text.toLowerCase()))

function candidates(ctx: Parameters<typeof writingPool>[0], params: SchreibenParams): Word[] {
  const real = realWords(gradeWords(ctx, params))
  return writingPool(ctx, params).filter((w) => misspellings(w, real).length >= 2)
}

export const schreibung: ExerciseModule<SchreibenParams, WahlData> = {
  id: 'schreiben.schreibung',
  topic: 'schreiben',

  items(ctx, params) {
    return candidates(ctx, params).map((w) => `schreiben.schreibung:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const all = gradeWords(ctx, params)
    const real = realWords(all)
    const word = findWord(all, itemId(itemKey))
    // Mistakes of the unit's phenomenon first, then the others.
    const own = params.phenomena
      ? misspellings(
          { ...word, phenomena: word.phenomena.filter((p) => params.phenomena!.includes(p)) },
          real,
        )
      : []
    const rest = shuffle(
      misspellings(word, real).filter((w) => !own.includes(w)),
      rng,
    )
    const wrong = [...shuffle(own, rng), ...rest].slice(0, 2)
    const say = word.artikel ? `${word.artikel} ${spoken(word)}` : spoken(word)
    const example = word.artikel ? ` ${say.charAt(0).toUpperCase()}${say.slice(1)}.` : ''
    return {
      instruction: `Wie schreibt man ${spoken(word)}?${example} Tippe auf das richtige Wort.`,
      caption: 'Welches Wort ist richtig geschrieben?',
      hint: 'Sprich das Wort langsam und deutlich. Was weißt du über solche Wörter?',
      solution: `Richtig ist ${word.text}.`,
      afterword: say,
      data: {
        image: word.image,
        correctKey: word.text,
        choices: shuffle([word.text, ...wrong], rng).map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}
