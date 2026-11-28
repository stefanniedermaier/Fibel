/**
 * S2 "Was gehört zusammen?": a picture and a question ("Womit hörst du die Glocke?",
 * "Was gibt uns die Kuh?"); the child picks the matching picture.
 */
import { shuffle } from '@/core/random'
import type { ExerciseModule } from '../../types'
import BildWahlTask from '@/components/BildWahlTask.vue'
import { capitalize } from '@/core/text'
import { getBegriff, getThema, type SacheData, type SacheParams } from '../shared'

export const paare: ExerciseModule<SacheParams, SacheData> = {
  id: 'sache.paare',
  topic: 'sache',

  items(_ctx, params) {
    return getThema(params.thema).paare.map((_, i) => `sache.paare:${params.thema}:${i}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const thema = getThema(params.thema)
    const paar = thema.paare[Number(itemKey.split(':').at(-1))]
    if (!paar) throw new Error(`Unbekanntes Paar: ${itemKey}`)
    const richtig = getBegriff(paar.richtig)
    const merke = getBegriff((paar.merke ?? thema.merke) === 'richtig' ? paar.richtig : paar.ziel)
    return {
      instruction: paar.frage,
      hint: `Schau dir das Bild oben genau an.`,
      solution: `${capitalize(richtig.text)} passt.`,
      afterword: merke.merksatz,
      data: {
        prompt: getBegriff(paar.ziel).image,
        correctKey: richtig.id,
        choices: shuffle([paar.richtig, ...paar.ablenker], rng).map((id) => ({
          key: id,
          image: getBegriff(id).image,
        })),
      },
    }
  },

  component: BildWahlTask,
}
