/**
 * S2-11 "Alphabet und Nachschlagen" (Deutsch 1/2, 4.4: "nutzen das Alphabet"):
 * which letter comes after/before, and which of three words comes first in the ABC
 * (first by the first letter, later by the second).
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { gradeWords, itemId, type SchreibenParams } from '../shared'
import WahlTask, { type WahlData } from '../schreibung/WahlTask.vue'
import { textChoices } from '../../choices'

export const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export interface AbcParams extends SchreibenParams {
  /** Grade 3 (S3-7): 'zweiter' – same first letter, sort by the second; 'grundform'. */
  mode: 'nach' | 'vor' | 'zuerst' | 'zweiter' | 'grundform'
}

const plainFirst = (t: string) =>
  t.charAt(0).toUpperCase().replace('Ä', 'A').replace('Ö', 'O').replace('Ü', 'U')

export const abc: ExerciseModule<AbcParams, WahlData> = {
  id: 'schreiben.abc',
  topic: 'schreiben',

  items(ctx, params) {
    if (params.mode === 'grundform')
      return gradeWords(ctx, params)
        .filter((w) => w.wortart === 'verb' && w.er && w.er !== w.text && w.er.length > 2)
        .map((w) => `schreiben.abc:grundform:${w.id}`)
    if (params.mode === 'zweiter') {
      const words = gradeWords(ctx, params).filter((w) => w.wortart === 'nomen')
      return words
        .filter(
          (w) =>
            words.filter(
              (o) =>
                plainFirst(o.text) === plainFirst(w.text) && o.text.charAt(1) > w.text.charAt(1),
            ).length >= 2,
        )
        .map((w) => `schreiben.abc:zweiter:${w.id}`)
    }
    if (params.mode === 'zuerst')
      return gradeWords(ctx, params)
        .filter((w) => w.wortart === 'nomen' && plainFirst(w.text) < 'W')
        .map((w) => `schreiben.abc:zuerst:${w.id}`)
    const letters = params.mode === 'nach' ? ABC.slice(0, -1) : ABC.slice(1)
    return letters.map((l) => `schreiben.abc:${params.mode}:${l}`)
  },

  generate(ctx, params, itemKey, rng) {
    const [mode, value] = itemId(itemKey).split(':') as [AbcParams['mode'], string]
    if (mode === 'grundform') {
      const verb = gradeWords(ctx, params).find((w) => w.id === value)!
      const er = verb.er!
      // Typical mistakes: the inflected form with -en, without the vowel change.
      const wrong = [`${er.replace(/t$/, '')}en`, er, `${er}en`]
        .filter((x, i, all) => x !== verb.text && all.indexOf(x) === i)
        .slice(0, 2)
      return {
        instruction: `Du suchst ${er} im Wörterbuch. Unter welchem Wort findest du es?`,
        caption: `Wo steht „${er}“ im Wörterbuch?`,
        hint: 'Im Wörterbuch stehen Verben in der Grundform: ich …, wir …, sie … en.',
        solution: `${er} findest du unter ${verb.text}.`,
        data: {
          prompt: er,
          correctKey: verb.text,
          choices: textChoices([verb.text, ...wrong], rng),
        },
      }
    }
    if (mode === 'zweiter') {
      const words = gradeWords(ctx, params).filter((w) => w.wortart === 'nomen')
      const first = words.find((w) => w.id === value)!
      const later = shuffle(
        words.filter(
          (o) =>
            plainFirst(o.text) === plainFirst(first.text) &&
            o.text.charAt(1) > first.text.charAt(1),
        ),
        rng,
      ).slice(0, 2)
      return {
        instruction: 'Alle Wörter fangen gleich an. Welches steht im ABC zuerst?',
        hint: 'Schau auf den zweiten Buchstaben.',
        solution: `${first.text} steht zuerst: ${first.text.charAt(1)} kommt im ABC früher.`,
        data: {
          correctKey: first.text,
          choices: shuffle([first, ...later], rng).map((w) => ({ key: w.text, label: w.text })),
        },
      }
    }
    if (mode === 'zuerst') {
      const words = gradeWords(ctx, params).filter((w) => w.wortart === 'nomen')
      const first = words.find((w) => w.id === value)!
      const later = shuffle(
        words.filter((w) => plainFirst(w.text) > plainFirst(first.text)),
        rng,
      )
      // Two words with different first letters that come later in the ABC.
      const picked: string[] = []
      for (const w of later)
        if (picked.length < 2 && !picked.some((p) => plainFirst(p) === plainFirst(w.text)))
          picked.push(w.text)
      return {
        instruction: 'Welches Wort steht im ABC zuerst?',
        hint: 'Schau auf den ersten Buchstaben. Welcher kommt im ABC früher?',
        solution: `${first.text} steht zuerst, denn ${plainFirst(first.text)} kommt im ABC vor den anderen.`,
        data: {
          correctKey: first.text,
          choices: textChoices([first.text, ...picked], rng),
        },
      }
    }
    const i = ABC.indexOf(value)
    const answer = ABC[mode === 'nach' ? i + 1 : i - 1]!
    const others = shuffle(
      [ABC[i + 2], ABC[i - 2], ABC[mode === 'nach' ? i - 1 : i + 1]].filter(
        (x): x is string => !!x && x !== answer && x !== value,
      ),
      rng,
    ).slice(0, 2)
    return {
      instruction: `Welcher Buchstabe kommt im ABC direkt ${mode} ${value}?`,
      hint: 'Sag das ABC leise auf.',
      solution: `Direkt ${mode} ${value} kommt ${answer}.`,
      data: {
        prompt: mode === 'nach' ? `${value} → ?` : `? ← ${value}`,
        correctKey: answer,
        choices: textChoices([answer, ...others], rng),
      },
    }
  },

  component: WahlTask,
}
