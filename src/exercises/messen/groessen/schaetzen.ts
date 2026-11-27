/** M3-6: estimating with reference sizes – 1 kg, 1 l, 1 km (Mathematik 3/4, 3.2). */
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
