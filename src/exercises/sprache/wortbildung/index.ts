/**
 * D12 "Wörter zusammensetzen" (Deutsch 1/2, 4.3 "nutzen Zusammensetzungen"): two
 * pictures (Schnee + Mann), the child picks the picture of the new word (Schneemann).
 * Everything is heard; the child does not have to read.
 */
import zusammensetzungen from '@/data/basis/klasse-1/zusammensetzungen.json'
import { shuffle } from '@/core/random'
import BildWahlTask from '@/components/BildWahlTask.vue'
import type { SacheData } from '@/exercises/sache/shared'
import type { ExerciseModule } from '../../types'

export interface Zusammensetzung {
  id: string
  text: string
  image: string
  teile: { text: string; image: string }[]
}

export const ZUSAMMENSETZUNGEN: readonly Zusammensetzung[] = zusammensetzungen

export const wortbildung: ExerciseModule<Record<string, never>, SacheData> = {
  id: 'sprache.wortbildung',
  topic: 'schreiben',

  items() {
    return ZUSAMMENSETZUNGEN.map((z) => `sprache.wortbildung:${z.id}`)
  },

  generate(_ctx, _params, itemKey, rng) {
    const z = ZUSAMMENSETZUNGEN.find((x) => x.id === itemKey.split(':')[1])
    if (!z) throw new Error(`Unbekanntes Wort: ${itemKey}`)
    const others = shuffle(
      ZUSAMMENSETZUNGEN.filter((x) => x.id !== z.id),
      rng,
    ).slice(0, 2)
    const [a, b] = z.teile as [Zusammensetzung['teile'][0], Zusammensetzung['teile'][0]]
    return {
      instruction: `${a.text} und ${b.text}. Welches neue Wort wird daraus?`,
      caption: 'Welches neue Wort wird daraus?',
      hint: `Sag beide Wörter schnell hintereinander: ${a.text}${b.text.toLowerCase()}.`,
      solution: `${a.text} und ${b.text} wird zu ${z.text}.`,
      afterword: `${a.text} und ${b.text}: ${z.text}.`,
      data: {
        prompt: [a.image, b.image],
        correctKey: z.id,
        choices: shuffle([z, ...others], rng).map((x) => ({ key: x.id, image: x.image })),
      },
    }
  },

  component: BildWahlTask,
}
