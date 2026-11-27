/**
 * S3 "Sortieren": a picture and two to four groups ("Ist das Obst oder Gemüse?",
 * "Zu welcher Jahreszeit passt das?"); the child taps the right group.
 */
import type { ExerciseModule } from '../../types'
import SacheTask from '../SacheTask.vue'
import { capitalize, getBegriff, getThema, type SacheData, type SacheParams } from '../shared'

export const sortieren: ExerciseModule<SacheParams, SacheData> = {
  id: 'sache.sortieren',
  topic: 'sache',

  items(_ctx, params) {
    return getThema(params.thema).sortieren.flatMap((s) =>
      Object.keys(s.zuordnung).map((id) => `sache.sortieren:${s.id}:${id}`),
    )
  },

  generate(_ctx, params, itemKey) {
    const [, sortId, begriffId] = itemKey.split(':') as [string, string, string]
    const sort = getThema(params.thema).sortieren.find((s) => s.id === sortId)
    if (!sort) throw new Error(`Unbekannte Sortierung: ${itemKey}`)
    const begriff = getBegriff(begriffId)
    const gruppe = sort.gruppen.find((g) => g.id === sort.zuordnung[begriffId])!
    const titles = sort.gruppen.map((g) => g.title)
    // "Wann wird das reif: im Sommer oder im Herbst?"
    const frage = sort.optionen
      ? `${sort.frage.replace(/\?$/, '')}: ${titles.slice(0, -1).join(', ')} oder ${titles.at(-1)}?`
      : sort.frage
    return {
      instruction: `${capitalize(begriff.text)}. ${frage}`,
      caption: sort.frage,
      solution: `${capitalize(begriff.text)}: ${gruppe.title}.`,
      afterword: begriff.merksatz,
      data: {
        prompt: begriff.image,
        correctKey: gruppe.id,
        // Groups keep their order (spring, summer, autumn, winter).
        choices: sort.gruppen.map((g) => ({ key: g.id, image: g.image, label: g.title })),
      },
    }
  },

  component: SacheTask,
}
