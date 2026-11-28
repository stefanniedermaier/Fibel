/**
 * R4-9 "Rechenart wählen" (Mathematik 3/4, 1.2: "wählen die passende Rechenart: im Kopf,
 * halbschriftlich oder schriftlich"): only clear cases – round numbers in the head,
 * big uneven ones in writing. Halbschriftlich is left out, it is never the only answer.
 */
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule } from '../../types'

export const WAHL = [
  { task: '3000 + 4000', key: 'kopf' },
  { task: '25 000 − 5 000', key: 'kopf' },
  { task: '600 · 3', key: 'kopf' },
  { task: '1000 − 999', key: 'kopf' },
  { task: '4 800 : 4', key: 'kopf' },
  { task: '90 000 + 10 000', key: 'kopf' },
  { task: '48 375 + 29 868', key: 'schriftlich' },
  { task: '70 412 − 38 579', key: 'schriftlich' },
  { task: '3 487 · 6', key: 'schriftlich' },
  { task: '256 · 37', key: 'schriftlich' },
  { task: '9 156 : 7', key: 'schriftlich' },
  { task: '102 345 + 67 989', key: 'schriftlich' },
] as const

export const rechenart: ExerciseModule<Record<string, never>, WahlData> = {
  id: 'rechnen.rechenart',
  topic: 'rechnen',

  items() {
    return WAHL.map((_, i) => `rechnen.rechenart:${i}`)
  },

  generate(_ctx, _params, itemKey) {
    const w = WAHL[Number(itemKey.split(':')[1])]!
    return {
      instruction: `Wie rechnest du ${w.task} am besten: im Kopf oder schriftlich?`,
      caption: 'Im Kopf oder schriftlich?',
      hint: 'Sind die Zahlen rund und leicht? Dann geht es im Kopf.',
      solution:
        w.key === 'kopf'
          ? 'Das geht gut im Kopf: Die Zahlen sind rund.'
          : 'Hier ist schriftlich sicherer: Die Zahlen sind groß und krumm.',
      data: {
        prompt: w.task,
        correctKey: w.key,
        choices: [
          { key: 'kopf', label: '🧠 im Kopf' },
          { key: 'schriftlich', label: '✍️ schriftlich' },
        ],
      },
    }
  },

  component: WahlTask,
}
