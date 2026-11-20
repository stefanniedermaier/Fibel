/**
 * E4 "Gleiche Anlaute" – purely by ear, no letters needed:
 * A "Welches fängt genauso an?": target picture + three pictures, one starts alike.
 * B "Welches passt nicht dazu?": four pictures, three start alike, one does not.
 * The initial sound is the spoken one (Vogel and Fisch both start with "f").
 */
import { MIN_ANLAUT_GROUP, groupBy } from '@/core/hoeren'
import { shuffle } from '@/core/random'
import type { ExerciseModule, LearnerContext } from '../../types'
import ListenPictureTask from '../hoeren/ListenPictureTask.vue'
import {
  listenPool,
  pickDifferent,
  pickOne,
  spokenList,
  spokenOf,
  toChoice,
  type ListenPictureData,
} from '../hoeren/shared'
import { itemId, type LesenParams } from '../shared'

/** Initial-sound groups that are big enough to be asked. */
function usableGroups(ctx: LearnerContext, params: LesenParams) {
  const groups = groupBy(listenPool(ctx, params), (w) => w.anlaut)
  return new Map([...groups].filter(([, words]) => words.length >= MIN_ANLAUT_GROUP))
}

export const anlautGleich: ExerciseModule<LesenParams, ListenPictureData> = {
  id: 'lesen.anlaut-gleich',
  topic: 'lesen',

  items(ctx, params) {
    return [...usableGroups(ctx, params).values()].flat().map((w) => `lesen.anlaut-gleich:${w.id}`)
  },

  generate(ctx, params, itemKey, rng) {
    const pool = listenPool(ctx, params)
    const target = pool.find((w) => w.id === itemId(itemKey))
    if (!target) throw new Error(`Unbekanntes Hörwort: ${itemKey}`)
    const match = pickOne(
      pool.filter(
        (w) => w.id !== target.id && w.anlaut === target.anlaut && w.image !== target.image,
      ),
      rng,
    )
    // Two distractors with two different initial sounds.
    const otherSounds = shuffle(
      [...new Set(pool.map((w) => w.anlaut))].filter((s) => s !== target.anlaut),
      rng,
    ).slice(0, 2)
    const distractors = otherSounds.flatMap((sound) =>
      pickDifferent(
        pool.filter((w) => w.anlaut === sound),
        1,
        rng,
        [target, match],
      ),
    )
    const choices = shuffle([match, ...distractors], rng)
    return {
      instruction: `Welches Wort fängt so an wie ${spokenOf(target)}? ${spokenList(choices)}?`,
      caption: 'Welches fängt genauso an?',
      hint: `Hör auf den Anfang: ${spokenOf(target)} … ${spokenList(choices)}?`,
      solution: `${spokenOf(target)} und ${spokenOf(match)} fangen gleich an.`,
      data: {
        target: { image: target.image, spoken: spokenOf(target) },
        choices: choices.map(toChoice),
        correctKey: match.id,
      },
    }
  },

  component: ListenPictureTask,
}

export const anlautFremd: ExerciseModule<LesenParams, ListenPictureData> = {
  id: 'lesen.anlaut-fremd',
  topic: 'lesen',

  // One item per initial sound: the child learns to hear that sound among others.
  items(ctx, params) {
    return [...usableGroups(ctx, params).keys()].map((sound) => `lesen.anlaut-fremd:${sound}`)
  },

  generate(ctx, params, itemKey, rng) {
    const sound = itemId(itemKey)
    const pool = listenPool(ctx, params)
    const same = pickDifferent(
      pool.filter((w) => w.anlaut === sound),
      3,
      rng,
    )
    const odd = pickOne(
      pool.filter((w) => w.anlaut !== sound && !same.some((s) => s.image === w.image)),
      rng,
    )
    const choices = shuffle([...same, odd], rng)
    return {
      instruction: `Welches Wort fängt anders an? ${spokenList(choices)}?`,
      caption: 'Welches fängt anders an?',
      hint: `Drei fangen gleich an. Hör genau: ${spokenList(choices)}?`,
      solution: `${spokenOf(odd)} fängt anders an. ${spokenList(same, 'und')} fangen gleich an.`,
      data: {
        choices: choices.map(toChoice),
        correctKey: odd.id,
      },
    }
  },

  component: ListenPictureTask,
}
