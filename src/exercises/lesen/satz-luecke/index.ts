/**
 * L2-5 "Lückensatz" (Deutsch 1/2, 2.3 sinnerschließend lesen): a sentence with a gap,
 * three words to choose from; only one makes sense ("Die Katze ___ Milch.").
 */
import luecken from '@/data/basis/klasse-2/luecken.json'
import sprache3 from '@/data/basis/klasse-3/sprache.json'
import { shuffle } from '@/core/random'
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule } from '../../types'
import { itemId } from '../shared'

export interface Lueckensatz {
  id: string
  text: string
  answer: string
  ablenker: string[]
}

export const LUECKENSAETZE: readonly Lueckensatz[] = luecken
/** Grade 3 (SP3-9): sentences joined with und, aber, weil, dann, darum, oder. */
export const LUECKEN_3: readonly Lueckensatz[] = sprache3.luecken
const lueckenFor = (grade: number) => (grade >= 3 ? LUECKEN_3 : LUECKENSAETZE)

export const satzLuecke: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'lesen.satz-luecke',
  topic: 'lesen',

  items(ctx) {
    return lueckenFor(ctx.grade).map((l) => `lesen.satz-luecke:${l.id}`)
  },

  generate(ctx, _params, itemKey, rng) {
    const l = lueckenFor(ctx.grade).find((x) => x.id === itemId(itemKey))
    if (!l) throw new Error(`Unbekannter Lückensatz: ${itemKey}`)
    const full = l.text.replace('___', l.answer)
    return {
      instruction: 'Lies den Satz. Welches Wort passt in die Lücke?',
      hint: 'Lies den Satz mit jedem Wort. Welcher Satz ergibt einen Sinn?',
      solution: `Richtig ist: ${full}`,
      data: {
        helper: l.text.replace('___', '…'),
        correctKey: l.answer,
        choices: shuffle([l.answer, ...l.ablenker], rng).map((t) => ({ key: t, label: t })),
      },
    }
  },

  component: WahlTask,
}
