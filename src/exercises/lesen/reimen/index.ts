/**
 * E3 "Was reimt sich?": a picture word is spoken, one of three pictures rhymes with it.
 * Distractors start like the target or share its vowel where possible, so that only
 * listening to the ending helps – not guessing.
 */
import { groupBy } from '@/core/hoeren'
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import ListenPictureTask from '../hoeren/ListenPictureTask.vue'
import {
  listenPool,
  mightRhyme,
  pickDifferent,
  pickOne,
  spokenList,
  spokenOf,
  toChoice,
  type ListenPictureData,
} from '../hoeren/shared'
import { itemId, type LesenParams } from '../shared'

export const CHOICES = 3

export const reimen: ExerciseModule<LesenParams, ListenPictureData> = {
  id: 'lesen.reimen',
  topic: 'lesen',

  items(ctx, params) {
    const pool = listenPool(ctx, params)
    const groups = groupBy(pool, (w) => w.reim)
    return pool
      .filter((w) => w.reim !== undefined && (groups.get(w.reim)?.length ?? 0) >= 2)
      .map((w) => `lesen.reimen:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const pool = listenPool(ctx, params)
    const target = pool.find((w) => w.id === itemId(itemKey))
    if (!target) throw new Error(`Unbekanntes Hörwort: ${itemKey}`)
    const rhyme = pickOne(
      pool.filter((w) => w.id !== target.id && w.reim === target.reim && w.image !== target.image),
      rng,
    )
    const others = pool.filter((w) => w.id !== target.id && !mightRhyme(w, target))
    // Same initial sound first (Hase → Hund, Haus): then only the ending tells them apart.
    const sameStart = others.filter((w) => w.anlaut === target.anlaut)
    const first = pickDifferent(sameStart, 1, rng, [target, rhyme])
    const rest = pickDifferent(
      others.filter((w) => !first.includes(w)),
      CHOICES - 1 - first.length,
      rng,
      [target, rhyme, ...first],
    )
    const distractors = [...first, ...rest]
    const choices = shuffle([rhyme, ...distractors], rng)
    return {
      instruction: `Was reimt sich auf ${spokenOf(target)}? ${spokenList(choices)}?`,
      caption: 'Was reimt sich? Hör gut zu.',
      hint: `Hör auf das Ende: ${spokenOf(target)} … ${spokenList(choices)}?`,
      solution: `${spokenOf(target)} und ${spokenOf(rhyme)} reimen sich.`,
      data: {
        target: { image: target.image, spoken: spokenOf(target) },
        choices: choices.map(toChoice),
        correctKey: rhyme.id,
      },
    }
  },

  component: ListenPictureTask,
}
