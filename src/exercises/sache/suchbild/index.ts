/**
 * S6 "Suchbild": a scene (street, kitchen, a room seen from above); the voice asks
 * "Wo kannst du sicher über die Straße gehen?" and the child taps a place. Several
 * places can be right (zebra crossing and traffic light).
 */
import type { ExerciseModule } from '../../types'
import { THEMEN, getThema, type SacheParams, type Suchbild } from '../shared'
import SuchbildTask from './SuchbildTask.vue'

export interface SuchbildData {
  scene: Suchbild
  correct: string[]
}

export function findSuchbild(id: string): Suchbild {
  for (const t of THEMEN) for (const b of t.suchbilder) if (b.id === id) return b
  throw new Error(`Unbekanntes Suchbild: ${id}`)
}

export const suchbild: ExerciseModule<SacheParams, SuchbildData> = {
  id: 'sache.suchbild',
  topic: 'sache',

  items(_ctx, params) {
    return getThema(params.thema).suchbilder.flatMap((b) =>
      b.fragen.map((_, i) => `sache.suchbild:${b.id}:${i}`),
    )
  },

  generate(_ctx, _params, itemKey) {
    const [, bildId, index] = itemKey.split(':') as [string, string, string]
    const bild = findSuchbild(bildId)
    const frage = bild.fragen[Number(index)]
    if (!frage) throw new Error(`Unbekannte Frage: ${itemKey}`)
    return {
      instruction: frage.frage,
      hint: frage.richtig.length > 1 ? 'Es gibt mehr als eine richtige Stelle.' : undefined,
      solution: frage.regel,
      afterword: frage.regel,
      data: { scene: bild, correct: frage.richtig },
    }
  },

  component: SuchbildTask,
}
