/** S1 "Hören → Bild": "Tippe auf den Apfel." – the child finds the named picture. */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import { itemId } from '../../lesen/shared'
import BildWahlTask from '@/components/BildWahlTask.vue'
import { getBegriff, getThema, type SacheData, type SacheParams } from '../shared'

export const CHOICES = 4

export const hoerenBild: ExerciseModule<SacheParams, SacheData> = {
  id: 'sache.hoeren-bild',
  topic: 'sache',

  items(_ctx, params) {
    return getThema(params.thema).erkennen.map((id) => `sache.hoeren-bild:${id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const thema = getThema(params.thema)
    const begriff = getBegriff(itemId(itemKey))
    const others = shuffle(
      thema.erkennen.filter((id) => id !== begriff.id && getBegriff(id).image !== begriff.image),
      rng,
    ).slice(0, CHOICES - 1)
    return {
      instruction: `Tippe auf ${begriff.wen}.`,
      caption: 'Hör gut zu und tippe auf das Bild.',
      solution: `Das ist ${begriff.text}.`,
      afterword: begriff.merksatz,
      data: {
        correctKey: begriff.id,
        choices: shuffle([begriff.id, ...others], rng).map((id) => ({
          key: id,
          image: getBegriff(id).image,
        })),
      },
    }
  },

  component: BildWahlTask,
}
