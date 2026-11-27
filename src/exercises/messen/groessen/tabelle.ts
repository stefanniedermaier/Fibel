/**
 * Größen in grade 3 (Mathematik 3/4, 3.1 and 3.2; M3-1 to M3-5, U3-2): converting with
 * the new units, the decimal comma with money and lengths, simple fractions of sizes.
 * Each task: prompt as shown, the spoken question, the answer and typical mistakes.
 */
export type GroessenArt =
  | 'geld'
  | 'laenge'
  | 'gewicht'
  | 'hohlmass'
  | 'brueche'
  | 'zeit'
  | 'gemischt'
  | 'vergleich'
  | 'preis'
  | 'genau'
  | 'zeit4'

export interface Umrechnung {
  id: string
  prompt: string
  frage: string
  richtig: string
  falsch: string[]
  /** Spoken after the first mistake (default: the art's hint). */
  hilfe?: string
}

const u = (
  id: string,
  prompt: string,
  frage: string,
  richtig: string,
  falsch: string[],
  hilfe?: string,
): Umrechnung => ({ id, prompt, frage, richtig, falsch, ...(hilfe ? { hilfe } : {}) })

export const HILFE: Record<GroessenArt, string> = {
  geld: 'Ein Euro hat hundert Cent. Nach dem Komma stehen immer zwei Stellen: die Cent.',
  laenge:
    'Ein Zentimeter hat zehn Millimeter, ein Meter hundert Zentimeter, ein Kilometer tausend Meter.',
  gewicht: 'Ein Kilogramm hat tausend Gramm.',
  hohlmass: 'Ein Liter hat tausend Milliliter.',
  brueche: 'Ein halb heißt: in zwei gleiche Teile teilen. Ein Viertel: in vier gleiche Teile.',
  zeit: 'Eine Stunde hat sechzig Minuten, eine Minute sechzig Sekunden, ein Tag vierundzwanzig Stunden.',
  gemischt: 'Überlege zuerst: Wie viele kleine Einheiten hat eine große Einheit?',
  vergleich: 'Rechne beide in dieselbe Einheit um, dann vergleiche.',
  preis: 'Doppelte Menge, doppelter Preis: Rechne erst den Preis für eins aus.',
  genau: 'Runde die Preise und rechne ungefähr. Reicht das, oder musst du genau rechnen?',
  zeit4: 'Rechne bis Mitternacht oder bis zur vollen Stunde, dann weiter.',
}

export const UMRECHNUNGEN: Record<GroessenArt, Umrechnung[]> = {
  // Grade 4 (M4-1 to M4-4, U4-1, U4-2).
  gemischt: [
    u('km-cm', '1 km = ? cm', 'Wie viele Zentimeter sind ein Kilometer?', '100000 cm', [
      '1000 cm',
      '10000 cm',
    ]),
    u('m-mm', '3 m = ? mm', 'Wie viele Millimeter sind 3 Meter?', '3000 mm', ['300 mm', '30 mm']),
    u('kg-g-gem', '5 kg 250 g = ? g', 'Wie viele Gramm sind 5 Kilogramm und 250 Gramm?', '5250 g', [
      '5025 g',
      '525 g',
    ]),
    u(
      't-kg',
      '1 t = ? kg',
      'Wie viele Kilogramm sind eine Tonne?',
      '1000 kg',
      ['100 kg', '10 kg'],
      'Eine Tonne hat tausend Kilogramm, so schwer wie ein kleines Auto.',
    ),
    u('l-ml-gem', '2,5 l = ? ml', 'Wie viele Milliliter sind zweieinhalb Liter?', '2500 ml', [
      '250 ml',
      '2005 ml',
    ]),
    u('eur-ct', '12,05 € = ? ct', 'Wie viele Cent sind 12 Euro 5?', '1205 ct', [
      '1250 ct',
      '125 ct',
    ]),
    u(
      'h-s',
      '1 h = ? s',
      'Wie viele Sekunden hat eine Stunde?',
      '3600 s',
      ['60 s', '360 s'],
      'Eine Stunde hat sechzig Minuten, jede Minute sechzig Sekunden.',
    ),
    u('min-h-gem', '150 min = ?', 'Wie viele Stunden und Minuten sind 150 Minuten?', '2 h 30 min', [
      '1 h 50 min',
      '15 h',
    ]),
    u('m-km-gem', '4250 m = ?', 'Wie viele Kilometer und Meter sind 4250 Meter?', '4 km 250 m', [
      '42 km 50 m',
      '4 km 25 m',
    ]),
  ],
  vergleich: [
    u('kg-g-v', '1,5 kg ○ 1200 g', 'Was ist schwerer: 1 Kilogramm 500 oder 1200 Gramm?', '1,5 kg', [
      '1200 g',
      'gleich schwer',
    ]),
    u(
      'l-ml-v',
      '750 ml ○ ¾ l',
      'Was ist mehr: 750 Milliliter oder ein Dreiviertelliter?',
      'gleich viel',
      ['750 ml', '¾ l'],
    ),
    u('m-cm-v', '2,05 m ○ 250 cm', 'Was ist länger: 2 Meter 5 oder 250 Zentimeter?', '250 cm', [
      '2,05 m',
      'gleich lang',
    ]),
    u(
      'h-min-v',
      '1 h 20 min ○ 90 min',
      'Was dauert länger: 1 Stunde 20 Minuten oder 90 Minuten?',
      '90 min',
      ['1 h 20 min', 'gleich lang'],
    ),
    u('km-m-v', '3 km ○ 2999 m', 'Was ist weiter: 3 Kilometer oder 2999 Meter?', '3 km', [
      '2999 m',
      'gleich weit',
    ]),
    u('eur-ct-v', '4,50 € ○ 405 ct', 'Was ist mehr: 4 Euro 50 oder 405 Cent?', '4,50 €', [
      '405 ct',
      'gleich viel',
    ]),
    u(
      'g-kg-v',
      '500 g ○ ½ kg',
      'Was ist schwerer: 500 Gramm oder ein halbes Kilogramm?',
      'gleich schwer',
      ['500 g', '½ kg'],
    ),
  ],
  preis: [
    u(
      'aepfel',
      '1 kg → 3 €, 4 kg → ?',
      'Ein Kilogramm Äpfel kostet 3 Euro. Wie viel kosten 4 Kilogramm?',
      '12 €',
      ['7 €', '4 €'],
    ),
    u(
      'hefte',
      '3 Hefte → 2,40 €, 1 Heft → ?',
      'Drei Hefte kosten 2 Euro 40. Wie viel kostet ein Heft?',
      '0,80 €',
      ['0,60 €', '1,20 €'],
      'Teile den Preis durch drei.',
    ),
    u(
      'saft',
      '2 l → 3 €, 6 l → ?',
      'Zwei Liter Saft kosten 3 Euro. Wie viel kosten 6 Liter?',
      '9 €',
      ['18 €', '6 €'],
      'Sechs Liter sind dreimal so viel wie zwei Liter.',
    ),
    u(
      'kaese',
      '100 g → 2 €, 250 g → ?',
      '100 Gramm Käse kosten 2 Euro. Wie viel kosten 250 Gramm?',
      '5 €',
      ['4 €', '50 €'],
    ),
    u(
      'eintritt',
      '1 Kind → 4,50 €, 4 Kinder → ?',
      'Der Eintritt kostet 4 Euro 50 pro Kind. Wie viel zahlen 4 Kinder?',
      '18,00 €',
      ['16,50 €', '8,50 €'],
    ),
    u(
      'benzin',
      '10 l → 18 €, 5 l → ?',
      'Zehn Liter kosten 18 Euro. Wie viel kosten 5 Liter?',
      '9 €',
      ['13 €', '3,60 €'],
      'Die halbe Menge kostet den halben Preis.',
    ),
  ],
  genau: [
    u(
      'reicht1',
      '2,95 € + 4,10 € + 1,99 € ○ 10 €',
      'Lena kauft ein Buch für 2 Euro 95, Stifte für 4 Euro 10 und einen Block für 1 Euro 99. Reichen 10 Euro?',
      'Ja, ungefähr 9 €.',
      ['Nein, ungefähr 12 €.', 'Nein, ungefähr 15 €.'],
      'Runde: 3 + 4 + 2 sind ungefähr 9 Euro.',
    ),
    u(
      'reicht2',
      '3 · 4,90 € ○ 15 €',
      'Drei Kinokarten kosten je 4 Euro 90. Reichen 15 Euro?',
      'Ja, knapp.',
      ['Nein.', 'Ja, es bleiben 5 € übrig.'],
      '4 Euro 90 ist fast 5 Euro. Dreimal 5 sind 15: Es reicht knapp.',
    ),
    u(
      'reicht3',
      '19,99 € + 9,99 € ○ 25 €',
      'Ein Spiel kostet 19 Euro 99, ein Ball 9 Euro 99. Reichen 25 Euro?',
      'Nein, ungefähr 30 €.',
      ['Ja, ungefähr 20 €.', 'Ja, genau 25 €.'],
    ),
    u(
      'genau1',
      'Kassenzettel',
      'An der Kasse: Muss die Verkäuferin genau rechnen oder reicht ein Überschlag?',
      'genau rechnen',
      ['Überschlag reicht', 'gar nicht rechnen'],
      'An der Kasse muss jeder Cent stimmen.',
    ),
    u(
      'genau2',
      'Einkaufszettel',
      'Du willst wissen, ob dein Geld für den Einkauf reicht. Was genügt?',
      'Überschlag reicht',
      ['genau rechnen', 'gar nicht rechnen'],
      'Zum Planen reicht es, ungefähr zu rechnen.',
    ),
  ],
  zeit4: [
    u(
      'nacht1',
      '22:30 → 1:15',
      'Die Fahrt beginnt um 22 Uhr 30 und endet um 1 Uhr 15 in der Nacht. Wie lange dauert sie?',
      '2 h 45 min',
      ['3 h 15 min', '21 h 15 min'],
      'Bis Mitternacht sind es 1 Stunde 30, dann noch 1 Stunde 15.',
    ),
    u('nacht2', '23:40 + 50 min', 'Es ist 23 Uhr 40. Wie spät ist es in 50 Minuten?', '0:30', [
      '24:30',
      '23:90',
    ]),
    u(
      'tage1',
      'Mo 18 Uhr → Di 6 Uhr',
      'Von Montag 18 Uhr bis Dienstag 6 Uhr. Wie viele Stunden sind das?',
      '12 h',
      ['24 h', '6 h'],
    ),
    u(
      'tage2',
      'Fr 15 Uhr → So 15 Uhr',
      'Von Freitag 15 Uhr bis Sonntag 15 Uhr. Wie viele Stunden sind das?',
      '48 h',
      ['24 h', '36 h'],
    ),
    u('tage3', '3 Tage = ? h', 'Wie viele Stunden haben drei Tage?', '72 h', ['36 h', '60 h']),
    u(
      'fahrplan1',
      'ab 7:05, an 7:47',
      'Der Zug fährt um 7 Uhr 5 ab und kommt um 7 Uhr 47 an. Wie lange fährt er?',
      '42 min',
      ['52 min', '47 min'],
    ),
    u(
      'fahrplan2',
      'ab 8:50, an 10:05',
      'Abfahrt 8 Uhr 50, Ankunft 10 Uhr 5. Wie lange dauert die Fahrt?',
      '1 h 15 min',
      ['2 h 15 min', '1 h 55 min'],
    ),
    u(
      'takt',
      '7:10, 7:25, 7:40, ?',
      'Der Bus fährt um 7 Uhr 10, 7 Uhr 25 und 7 Uhr 40. Wann fährt der nächste Bus?',
      '7:55',
      ['7:50', '8:10'],
      'Der Bus fährt alle 15 Minuten.',
    ),
    u(
      'takt2',
      'Takt?',
      'Ein Bus fährt um 6 Uhr 20, 6 Uhr 50 und 7 Uhr 20. In welchem Abstand fährt er?',
      'alle 30 min',
      ['alle 20 min', 'jede Stunde'],
    ),
  ],
  geld: [
    u('350ct', '3,50 € = ? ct', 'Wie viele Cent sind 3 Euro 50?', '350 ct', ['35 ct', '3050 ct']),
    u('125ct', '1,25 € = ? ct', 'Wie viele Cent sind 1 Euro 25?', '125 ct', ['12 ct', '1025 ct']),
    u('805ct', '8,05 € = ? ct', 'Wie viele Cent sind 8 Euro 5?', '805 ct', ['85 ct', '850 ct']),
    u('2e40', '2 € 40 ct = ? €', 'Wie schreibt man 2 Euro 40 Cent mit Komma?', '2,40 €', [
      '24,0 €',
      '2,04 €',
    ]),
    u(
      '6e5',
      '6 € 5 ct = ? €',
      'Wie schreibt man 6 Euro 5 Cent mit Komma?',
      '6,05 €',
      ['6,5 €', '6,50 €'],
      'Fünf Cent sind null Komma null fünf Euro: Nach dem Komma stehen zwei Stellen.',
    ),
    u('199', '199 ct = ? €', 'Wie viele Euro sind 199 Cent?', '1,99 €', ['19,9 €', '199 €']),
    u('1000ct', '10 € = ? ct', 'Wie viele Cent sind 10 Euro?', '1000 ct', ['100 ct', '10 ct']),
    u(
      '450-2',
      '4,50 € + 2,50 € = ?',
      'Wie viel kosten 4 Euro 50 und 2 Euro 50 zusammen?',
      '7,00 €',
      ['6,100 €', '6,00 €'],
      'Rechne erst die Cent: 50 Cent und 50 Cent sind ein Euro.',
    ),
  ],
  laenge: [
    u('cm-mm', '1 cm = ? mm', 'Wie viele Millimeter sind ein Zentimeter?', '10 mm', [
      '100 mm',
      '1 mm',
    ]),
    u(
      '4cm7',
      '4 cm 7 mm = ? mm',
      'Wie viele Millimeter sind 4 Zentimeter und 7 Millimeter?',
      '47 mm',
      ['407 mm', '11 mm'],
    ),
    u('120mm', '120 mm = ? cm', 'Wie viele Zentimeter sind 120 Millimeter?', '12 cm', [
      '120 cm',
      '1 cm 20 mm',
    ]),
    u('1,25m', '1,25 m = ? cm', 'Wie viele Zentimeter sind 1 Meter 25?', '125 cm', [
      '1025 cm',
      '12 cm',
    ]),
    u('2,05m', '2,05 m = ? cm', 'Wie viele Zentimeter sind 2 Meter 5?', '205 cm', [
      '25 cm',
      '250 cm',
    ]),
    u('340cm', '340 cm = ? m', 'Wie schreibt man 340 Zentimeter in Meter mit Komma?', '3,40 m', [
      '34,0 m',
      '3,04 m',
    ]),
    u('km', '1 km = ? m', 'Wie viele Meter sind ein Kilometer?', '1000 m', ['100 m', '10 m']),
    u('2km500', '2 km 500 m = ? m', 'Wie viele Meter sind 2 Kilometer und 500 Meter?', '2500 m', [
      '2050 m',
      '700 m',
    ]),
    u('3500m', '3500 m = ? km', 'Wie viele Kilometer und Meter sind 3500 Meter?', '3 km 500 m', [
      '35 km',
      '3 km 50 m',
    ]),
  ],
  gewicht: [
    u('kg', '1 kg = ? g', 'Wie viele Gramm sind ein Kilogramm?', '1000 g', ['100 g', '10 g']),
    u('3kg', '3 kg = ? g', 'Wie viele Gramm sind 3 Kilogramm?', '3000 g', ['300 g', '30 g']),
    u('2kg500', '2 kg 500 g = ? g', 'Wie viele Gramm sind 2 Kilogramm und 500 Gramm?', '2500 g', [
      '2050 g',
      '502 g',
    ]),
    u('1kg50', '1 kg 50 g = ? g', 'Wie viele Gramm sind 1 Kilogramm und 50 Gramm?', '1050 g', [
      '1500 g',
      '150 g',
    ]),
    u('4200g', '4200 g = ? kg', 'Wie viele Kilogramm und Gramm sind 4200 Gramm?', '4 kg 200 g', [
      '42 kg',
      '4 kg 20 g',
    ]),
    u(
      'kgvoll',
      '600 g + ? = 1 kg',
      'Wie viel Gramm fehlen von 600 Gramm bis zu einem Kilogramm?',
      '400 g',
      ['4 g', '1400 g'],
      'Ergänze bis tausend Gramm.',
    ),
  ],
  hohlmass: [
    u('l', '1 l = ? ml', 'Wie viele Milliliter sind ein Liter?', '1000 ml', ['100 ml', '10 ml']),
    u('2l', '2 l = ? ml', 'Wie viele Milliliter sind 2 Liter?', '2000 ml', ['200 ml', '20 ml']),
    u(
      '1l500',
      '1 l 500 ml = ? ml',
      'Wie viele Milliliter sind 1 Liter und 500 Milliliter?',
      '1500 ml',
      ['1050 ml', '501 ml'],
    ),
    u(
      '2x500',
      '2 × 500 ml = ?',
      'Zwei Flaschen mit je 500 Milliliter. Wie viel ist das zusammen?',
      '1 l',
      ['1 ml', '10 l'],
    ),
    u(
      'becher',
      '1 l = ? × 250 ml',
      'Wie viele Becher mit 250 Milliliter kannst du aus einem Liter füllen?',
      '4',
      ['2', '10'],
      'Zwei Becher sind 500 Milliliter, ein halber Liter.',
    ),
    u(
      'lvoll',
      '700 ml + ? = 1 l',
      'Wie viele Milliliter fehlen von 700 Millilitern bis zu einem Liter?',
      '300 ml',
      ['3 ml', '1300 ml'],
      'Ergänze bis tausend Milliliter.',
    ),
  ],
  brueche: [
    u('halbl', '½ l = ? ml', 'Wie viele Milliliter sind ein halber Liter?', '500 ml', [
      '50 ml',
      '200 ml',
    ]),
    u('viertell', '¼ l = ? ml', 'Wie viele Milliliter sind ein Viertelliter?', '250 ml', [
      '25 ml',
      '400 ml',
    ]),
    u('dreiviertell', '¾ l = ? ml', 'Wie viele Milliliter sind ein Dreiviertelliter?', '750 ml', [
      '340 ml',
      '75 ml',
    ]),
    u('halbkg', '½ kg = ? g', 'Wie viele Gramm sind ein halbes Kilogramm?', '500 g', [
      '50 g',
      '200 g',
    ]),
    u('viertelkg', '¼ kg = ? g', 'Wie viele Gramm sind ein Viertelkilogramm?', '250 g', [
      '25 g',
      '400 g',
    ]),
    u('halbkm', '½ km = ? m', 'Wie viele Meter sind ein halber Kilometer?', '500 m', [
      '50 m',
      '200 m',
    ]),
    u('halbm', '½ m = ? cm', 'Wie viele Zentimeter sind ein halber Meter?', '50 cm', [
      '500 cm',
      '20 cm',
    ]),
    u('halbh', '½ h = ? min', 'Wie viele Minuten sind eine halbe Stunde?', '30 min', [
      '50 min',
      '20 min',
    ]),
    u('viertelh', '¼ h = ? min', 'Wie viele Minuten sind eine Viertelstunde?', '15 min', [
      '25 min',
      '4 min',
    ]),
    u('dreiviertelh', '¾ h = ? min', 'Wie viele Minuten sind eine Dreiviertelstunde?', '45 min', [
      '75 min',
      '34 min',
    ]),
  ],
  zeit: [
    u('min-s', '1 min = ? s', 'Wie viele Sekunden hat eine Minute?', '60 s', ['100 s', '10 s']),
    u('2min', '2 min = ? s', 'Wie viele Sekunden sind 2 Minuten?', '120 s', ['200 s', '62 s']),
    u('1min30', '1 min 30 s = ? s', 'Wie viele Sekunden sind 1 Minute und 30 Sekunden?', '90 s', [
      '130 s',
      '31 s',
    ]),
    u('2h', '2 h = ? min', 'Wie viele Minuten sind 2 Stunden?', '120 min', ['200 min', '62 min']),
    u('1h25', '1 h 25 min = ? min', 'Wie viele Minuten sind 1 Stunde und 25 Minuten?', '85 min', [
      '125 min',
      '26 min',
    ]),
    u('90min', '90 min = ?', 'Wie viele Stunden und Minuten sind 90 Minuten?', '1 h 30 min', [
      '9 h',
      '1 h 90 min',
    ]),
    u('tag', '1 Tag = ? h', 'Wie viele Stunden hat ein Tag?', '24 h', ['12 h', '60 h']),
    u('2tage', '2 Tage = ? h', 'Wie viele Stunden sind 2 Tage?', '48 h', ['24 h', '120 h']),
  ],
}

const UNITS: Record<string, [string, string]> = {
  mm: ['Millimeter', 'Millimeter'],
  cm: ['Zentimeter', 'Zentimeter'],
  km: ['Kilometer', 'Kilometer'],
  m: ['Meter', 'Meter'],
  kg: ['Kilogramm', 'Kilogramm'],
  g: ['Gramm', 'Gramm'],
  ml: ['Milliliter', 'Milliliter'],
  l: ['Liter', 'Liter'],
  min: ['Minute', 'Minuten'],
  h: ['Stunde', 'Stunden'],
  s: ['Sekunde', 'Sekunden'],
  ct: ['Cent', 'Cent'],
  '€': ['Euro', 'Euro'],
}

/** For the speech output: "3,50 € = 350 ct" → "3 Euro 50 sind 350 Cent". */
export function sayUnits(text: string): string {
  return text
    .replace(
      /(\d+),(\d\d) (€|m)(?=\s|$)/g,
      (_, a: string, b: string, unit: string) => `${a} ${UNITS[unit]![1]} ${Number(b)}`,
    )
    .replace(
      /(\d+|½|¼|¾) (mm|cm|km|m|kg|g|ml|l|min|h|s|ct|€)(?=\s|$|\))/g,
      (_, n: string, unit: string) => {
        const word = UNITS[unit]![n === '1' || /[½¼¾]/.test(n) ? 0 : 1]
        return `${n} ${word}`
      },
    )
    .replace(/½ (\S+)/g, (_, w: string) =>
      w === 'Stunde'
        ? 'eine halbe Stunde'
        : w === 'Kilogramm'
          ? 'ein halbes Kilogramm'
          : `ein halber ${w}`,
    )
    .replace(/¼/g, 'ein Viertel')
    .replace(/¾/g, 'drei Viertel')
    .replace(/ × /g, ' mal ')
    .replace(/ \+ /g, ' plus ')
    .replace(/ = /g, ' sind ')
}

/** The prompt with the answer in place of the question mark. */
export const solved = (x: Umrechnung) =>
  x.prompt.replace(
    /[a-z€]/i.test(x.richtig) ? /\?( (mm|cm|km|m|kg|g|ml|l|min|h|s|ct|€)(?=\s|$))?/ : '?',
    x.richtig,
  )
