/**
 * S5 "Stimmt das?": a statement with a picture is read out ("Bei Rot bleibe ich
 * stehen."), the child taps thumbs up or down; then the rule is spoken.
 */
import type { ExerciseModule } from '../../types'
import BildWahlTask from '@/components/BildWahlTask.vue'
import { getThema, type SacheData, type SacheParams } from '../shared'

export const stimmtDas: ExerciseModule<SacheParams, SacheData> = {
  id: 'sache.stimmt-das',
  topic: 'sache',

  items(_ctx, params) {
    return getThema(params.thema).aussagen.map((_, i) => `sache.stimmt-das:${params.thema}:${i}`)
  },

  generate(_ctx, params, itemKey) {
    const aussage = getThema(params.thema).aussagen[Number(itemKey.split(':').at(-1))]
    if (!aussage) throw new Error(`Unbekannte Aussage: ${itemKey}`)
    return {
      instruction: `${aussage.text} Stimmt das?`,
      solution: `Das ${aussage.richtig ? 'stimmt' : 'stimmt nicht'}. ${aussage.regel}`,
      afterword: aussage.regel,
      data: {
        prompt: aussage.image,
        correctKey: aussage.richtig ? 'ja' : 'nein',
        // Always in the same place: thumbs up left, thumbs down right.
        choices: [
          { key: 'ja', image: '1F44D', label: 'stimmt' },
          { key: 'nein', image: '1F44E', label: 'stimmt nicht' },
        ],
      },
    }
  },

  component: BildWahlTask,
}
