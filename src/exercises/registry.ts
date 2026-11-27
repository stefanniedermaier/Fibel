/** All exercise modules. A new exercise = new module + entry here + catalog entries. */
import { anlaut } from './lesen/anlaut'
import { blitzlesen } from './lesen/blitzlesen'
import { lautposition } from './lesen/lautposition'
import { reihenfolge } from './lesen/reihenfolge'
import { hoerenBild } from './sache/hoeren-bild'
import { paare } from './sache/paare'
import { sortieren } from './sache/sortieren'
import { stimmtDas } from './sache/stimmt-das'
import { suchbild } from './sache/suchbild'
import { turm } from './sache/turm'
import { jahreskreis } from './sache/jahreskreis'
import { wortbildung } from './sprache/wortbildung'
import { pfeilweg } from './formen/pfeilweg'
import { symmetrie } from './formen/symmetrie'
import { daten } from './rechnen/daten'
import { einmaleins } from './rechnen/einmaleins'
import { hunderter } from './rechnen/hunderter'
import { schreibung } from './schreiben/schreibung'
import { ableiten } from './schreiben/ableiten'
import { abc } from './schreiben/abc'
import { satzLuecke } from './lesen/satz-luecke'
import { uhrDigital } from './uhr/digital'
import { zeitspanne } from './uhr/zeitspanne'
import {
  artikel,
  formen as sprachFormen,
  wortart,
  wortfamilie,
  wortfeld,
  zusammensetzen,
  bausteine,
} from './sprache/klasse2'
import { lineal, schaetzen, umrechnen } from './messen/laenge'
import { sachaufgaben } from './rechnen/sachaufgaben'
import { zufall } from './rechnen/zufall'
import { kombinatorik } from './rechnen/kombinatorik'
import { koerper } from './formen/koerper'
import { flaeche } from './formen/flaeche'
import { halbschriftlich } from './rechnen/halbschriftlich'
import { ueberschlag } from './rechnen/ueberschlag'
import { schriftlich } from './rechnen/schriftlich'
import { trennen } from './schreiben/trennen'
import { textstelle } from './lesen/textstelle'
import { artikelZusammen, formen3, nachsilben, satzart } from './sprache/klasse3'
import { satzglieder } from './sprache/satzglieder'
import { textFragen } from './lesen/text-fragen'
import { satzBild } from './lesen/satz-bild'
import { anlautFremd, anlautGleich } from './lesen/anlaute'
import { reimen } from './lesen/reimen'
import { bildWort } from './lesen/bild-wort'
import { silbenHoeren } from './lesen/silben-hoeren'
import { silbenKlatschen } from './lesen/silben-klatschen'
import { wortBild } from './lesen/wort-bild'
import { formenErkennen } from './formen/erkennen'
import { lageBegriffe } from './formen/lage'
import { geld } from './messen/geld'
import { laengenVergleichen } from './messen/vergleichen'
import { mengeLegen } from './rechnen/menge-legen'
import { ordnungszahl } from './rechnen/ordnungszahl'
import { mengen } from './rechnen/mengen'
import { paeckchen } from './rechnen/paeckchen'
import { plusMinus } from './rechnen/plus-minus'
import { reihen } from './rechnen/reihen'
import { sachaufgabe } from './rechnen/sachaufgabe'
import { stellenwert } from './rechnen/stellenwert'
import { vergleichen } from './rechnen/vergleichen'
import { zahlenstrahl } from './rechnen/zahlenstrahl'
import { zahlenhaus } from './rechnen/zahlenhaus'
import { abcTastatur } from './schreiben/abc-tastatur'
import { abschreiben } from './schreiben/abschreiben'
import { diktat } from './schreiben/diktat'
import { buchstabenLegen, luecke } from './schreiben/buchstaben-legen'
import { kaestchen } from './schreiben/kaestchen'
import { nachspuren } from './schreiben/nachspuren'
import { silbenLegen } from './schreiben/silben-legen'
import { grossKlein } from './sprache/gross-klein'
import { satzzeichen } from './sprache/satzzeichen'
import { vokale } from './sprache/vokale'
import { kalender } from './uhr/kalender'
import { uhrLesen } from './uhr/lesen'
import { uhrStellen } from './uhr/stellen'
import type { ExerciseModule } from './types'

const modules = new Map<string, ExerciseModule>()

function register<P, D>(module: ExerciseModule<P, D>) {
  if (modules.has(module.id)) throw new Error(`Übung "${module.id}" doppelt registriert`)
  modules.set(module.id, module as unknown as ExerciseModule)
}

register(silbenHoeren)
register(wortBild)
register(bildWort)
register(anlaut)
register(silbenKlatschen)
register(reimen)
register(anlautGleich)
register(anlautFremd)
register(blitzlesen)
register(satzBild)
register(lautposition)
register(textFragen)
register(reihenfolge)
register(mengen)
register(mengeLegen)
register(vergleichen)
register(zahlenhaus)
register(plusMinus)
register(reihen)
register(stellenwert)
register(zahlenstrahl)
register(paeckchen)
register(sachaufgabe)
register(lageBegriffe)
register(formenErkennen)
register(ordnungszahl)
register(geld)
register(laengenVergleichen)
register(kalender)
register(uhrLesen)
register(uhrStellen)
register(silbenLegen)
register(luecke)
register(buchstabenLegen)
register(abcTastatur)
register(nachspuren)
register(kaestchen)
register(abschreiben)
register(diktat)
register(vokale)
register(satzzeichen)
register(grossKlein)
register(hoerenBild)
register(paare)
register(sortieren)
register(stimmtDas)
register(suchbild)
register(turm)
register(jahreskreis)
register(wortbildung)
register(pfeilweg)
register(symmetrie)
register(daten)
register(einmaleins)
register(hunderter)
register(schreibung)
register(ableiten)
register(abc)
register(satzLuecke)
register(uhrDigital)
register(zeitspanne)
register(wortart)
register(artikel)
register(sprachFormen)
register(wortfamilie)
register(wortfeld)
register(zusammensetzen)
register(bausteine)
register(lineal)
register(umrechnen)
register(schaetzen)
register(sachaufgaben)
register(zufall)
register(kombinatorik)
register(koerper)
register(flaeche)
register(halbschriftlich)
register(ueberschlag)
register(schriftlich)
register(trennen)
register(textstelle)
register(formen3)
register(nachsilben)
register(artikelZusammen)
register(satzglieder)
register(satzart)

export function getExercise(id: string): ExerciseModule | undefined {
  return modules.get(id)
}

export function allExercises(): ExerciseModule[] {
  return [...modules.values()]
}
