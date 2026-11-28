/**
 * Schätzen with reference sizes: lengths in grade 2 (M2-5; a door is about 2 m high),
 * weights, capacity and distances from grade 3 (M3-6: 1 kg, 1 l, 1 km).
 */
import WahlTask, { type WahlData } from '@/exercises/schreiben/schreibung/WahlTask.vue'
import type { ExerciseModule } from '../../types'
import { textChoices as choices } from '../../choices'
export type SchaetzArt = 'gewicht' | 'hohlmass' | 'strecke'

export interface Schaetzung {
  id: string
  art: SchaetzArt
  was: string
  image: string
  richtig: string
  falsch: string[]
  hilfe: string
}

const KG =
  'Denk an etwas, das du kennst: Eine Packung Mehl wiegt ein Kilogramm, eine Tafel Schokolade hundert Gramm.'
const L =
  'Denk an etwas, das du kennst: In eine Milchtüte passt ein Liter, in einen Becher ungefähr 200 Milliliter.'
const KM = 'Ein Kilometer: So weit gehst du in ungefähr einer Viertelstunde.'

export const SCHAETZEN_3: readonly Schaetzung[] = [
  {
    id: 'apfel-g',
    art: 'gewicht',
    was: 'Wie schwer ist ein Apfel?',
    image: '1F34E',
    richtig: '150 g',
    falsch: ['15 kg', '1 g'],
    hilfe: KG,
  },
  {
    id: 'kind-kg',
    art: 'gewicht',
    was: 'Wie schwer ist ein Kind in der dritten Klasse?',
    image: '1F9D2',
    richtig: '30 kg',
    falsch: ['3 kg', '300 kg'],
    hilfe: KG,
  },
  {
    id: 'ranzen',
    art: 'gewicht',
    was: 'Wie schwer ist ein gepackter Schulranzen?',
    image: '1F392',
    richtig: '4 kg',
    falsch: ['40 g', '40 kg'],
    hilfe: KG,
  },
  {
    id: 'brot',
    art: 'gewicht',
    was: 'Wie schwer ist ein Brot?',
    image: '1F35E',
    richtig: '1 kg',
    falsch: ['10 g', '10 kg'],
    hilfe: KG,
  },
  {
    id: 'elefant',
    art: 'gewicht',
    was: 'Wie schwer ist ein Elefant?',
    image: '1F418',
    richtig: '5000 kg',
    falsch: ['50 kg', '500 g'],
    hilfe: KG,
  },
  {
    id: 'feder',
    art: 'gewicht',
    was: 'Wie schwer ist ein Blatt Papier?',
    image: '1F4C4',
    richtig: '5 g',
    falsch: ['5 kg', '500 g'],
    hilfe: KG,
  },
  {
    id: 'glas',
    art: 'hohlmass',
    was: 'Wie viel passt in ein Glas?',
    image: '1F95B',
    richtig: '200 ml',
    falsch: ['2 l', '2 ml'],
    hilfe: L,
  },
  {
    id: 'eimer',
    art: 'hohlmass',
    was: 'Wie viel Wasser passt in einen Eimer?',
    image: '1FAA3',
    richtig: '10 l',
    falsch: ['10 ml', '100 l'],
    hilfe: L,
  },
  {
    id: 'badewanne',
    art: 'hohlmass',
    was: 'Wie viel Wasser passt in eine Badewanne?',
    image: '1F6C1',
    richtig: '150 l',
    falsch: ['15 ml', '1 l'],
    hilfe: L,
  },
  {
    id: 'loeffel',
    art: 'hohlmass',
    was: 'Wie viel passt auf einen Teelöffel?',
    image: '1F944',
    richtig: '5 ml',
    falsch: ['5 l', '500 ml'],
    hilfe: L,
  },
  {
    id: 'flasche',
    art: 'hohlmass',
    was: 'Wie viel Milch passt in eine Milchtüte?',
    image: '1F9C3',
    richtig: '1 l',
    falsch: ['10 ml', '10 l'],
    hilfe: L,
  },
  {
    id: 'schulweg',
    art: 'strecke',
    was: 'Wie weit ist ein kurzer Schulweg?',
    image: '1F3EB',
    richtig: '1 km',
    falsch: ['1 m', '100 km'],
    hilfe: KM,
  },
  {
    id: 'stadt',
    art: 'strecke',
    was: 'Wie weit ist es mit dem Auto bis in die nächste große Stadt?',
    image: '1F697',
    richtig: '30 km',
    falsch: ['30 m', '3000 km'],
    hilfe: KM,
  },
  {
    id: 'turnhalle',
    art: 'strecke',
    was: 'Wie lang ist eine Turnhalle?',
    image: '26F9',
    richtig: '30 m',
    falsch: ['30 km', '3 m'],
    hilfe: KM,
  },
  {
    id: 'flugzeug',
    art: 'strecke',
    was: 'Wie weit fliegt ein Flugzeug von München nach Hamburg?',
    image: '2708',
    richtig: '600 km',
    falsch: ['600 m', '6 km'],
    hilfe: KM,
  },
]

/** Reference sizes (rounded); the wrong answers are far off, not tricky. */
export const SCHAETZEN = [
  {
    id: 'tuer',
    was: 'Wie hoch ist eine Tür?',
    image: '1F6AA',
    richtig: '2 m',
    falsch: ['20 cm', '20 m'],
  },
  {
    id: 'stift',
    was: 'Wie lang ist ein Bleistift?',
    image: '270F',
    richtig: '18 cm',
    falsch: ['18 m', '2 cm'],
  },
  {
    id: 'kind',
    was: 'Wie groß ist ein Kind in der zweiten Klasse?',
    image: '1F9D2',
    richtig: '1 m 25 cm',
    falsch: ['25 cm', '5 m'],
  },
  {
    id: 'bus',
    was: 'Wie lang ist ein Bus?',
    image: '1F68C',
    richtig: '12 m',
    falsch: ['12 cm', '1 m'],
  },
  {
    id: 'tisch',
    was: 'Wie hoch ist ein Tisch?',
    image: 'fibel-tisch',
    richtig: '75 cm',
    falsch: ['7 cm', '7 m'],
  },
  {
    id: 'haus',
    was: 'Wie hoch ist ein Haus mit zwei Stockwerken?',
    image: '1F3E0',
    richtig: '8 m',
    falsch: ['80 cm', '80 m'],
  },
  {
    id: 'heft',
    was: 'Wie lang ist ein Schulheft?',
    image: '1F4D2',
    richtig: '30 cm',
    falsch: ['3 m', '3 cm'],
  },
  {
    id: 'ameise',
    was: 'Wie lang ist eine Ameise?',
    image: '1F41C',
    richtig: 'weniger als 1 cm',
    falsch: ['10 cm', '1 m'],
  },
  {
    id: 'giraffe',
    was: 'Wie groß ist eine Giraffe?',
    image: '1F992',
    richtig: '5 m',
    falsch: ['50 cm', '50 m'],
  },
  {
    id: 'baum',
    was: 'Wie hoch ist ein großer Baum?',
    image: '1F333',
    richtig: '20 m',
    falsch: ['20 cm', '2 m'],
  },
] as const

export interface SchaetzenParams {
  /** Grade 3: weights, capacity, long distances (default: lengths of grade 2). */
  art?: SchaetzArt
}

const schaetzListe = (art?: SchaetzArt) =>
  art ? SCHAETZEN_3.filter((s) => s.art === art) : SCHAETZEN

export const schaetzen: ExerciseModule<SchaetzenParams, WahlData> = {
  id: 'messen.schaetzen',
  topic: 'messen',

  items(_ctx, params) {
    return schaetzListe(params.art).map((s) => `messen.schaetzen:${s.id}`)
  },

  generate(_ctx, params, itemKey, rng) {
    const s = schaetzListe(params.art).find((x) => x.id === itemKey.split(':')[1])!
    return {
      instruction: `Schätze: ${s.was}`,
      hint:
        'hilfe' in s
          ? s.hilfe
          : 'Denk an etwas, das du kennst: Ein Meter ist etwa so hoch wie ein Tisch und ein bisschen mehr.',
      solution: `Ungefähr ${s.richtig}.`,
      data: {
        image: s.image,
        correctKey: s.richtig,
        choices: choices([s.richtig, ...s.falsch], rng),
      },
    }
  },

  component: WahlTask,
}
