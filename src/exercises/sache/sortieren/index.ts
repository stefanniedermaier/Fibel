/**
 * S3 "Sortieren": a picture and two to four groups ("Ist das Obst oder Gemüse?",
 * "Zu welcher Jahreszeit passt das?"); the child taps the right group.
 */
import type { ExerciseModule } from '../../types'
import BildWahlTask from '@/components/BildWahlTask.vue'
import { capitalize } from '@/core/text'
import { getBegriff, getThema, visibleGroups, type SacheData, type SacheParams } from '../shared'

export const sortieren: ExerciseModule<SacheParams, SacheData> = {
  id: 'sache.sortieren',
  topic: 'sache',

  items(ctx, params) {
    return getThema(params.thema).sortieren.flatMap((s) => {
      const groups = new Set(visibleGroups(s, ctx.settings).map((g) => g.id))
      // With fewer than two bins at home there is nothing to sort.
      if (groups.size < 2) return []
      return Object.entries(s.zuordnung)
        .filter(([, group]) => groups.has(group))
        .map(([id]) => `sache.sortieren:${s.id}:${id}`)
    })
  },

  generate(ctx, params, itemKey) {
    const [, sortId, begriffId] = itemKey.split(':') as [string, string, string]
    const sort = getThema(params.thema).sortieren.find((s) => s.id === sortId)
    if (!sort) throw new Error(`Unbekannte Sortierung: ${itemKey}`)
    const begriff = getBegriff(begriffId)
    const gruppe = sort.gruppen.find((g) => g.id === sort.zuordnung[begriffId])!
    const gruppen = visibleGroups(sort, ctx.settings)
    const titles = gruppen.map((g) => g.title)
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
        choices: gruppen.map((g) => ({ key: g.id, image: g.image, label: g.title })),
      },
    }
  },

  component: BildWahlTask,
}
