# Klasse 2 – Fächer und Unterrichtseinheiten

Stand: 27.11.2026. Lehrplan: LehrplanPLUS Bayern, **Deutsch 1/2, Mathematik 1/2, HSU 1/2**. Klasse 2 ist das zweite Jahr der Doppeljahrgangsstufe: Am Ende von Klasse 2 sollen die Kompetenzerwartungen 1/2 erreicht sein. Was Klasse 1 schon geübt hat (lauttreue Wörter, Zahlenraum 20, Uhr bis „halb“), wird vorausgesetzt und über 🔁 „Wiederholen“ weiter angeboten.

Allgemeines (Bereiche, Einheiten-Freischaltung, Module, Quellen) steht in [README.md](README.md). Die Halbjahres-Zuordnung (HJ) ist ein Vorschlag; die Eltern schalten Einheiten frei, sobald die Schule sie behandelt.

**Vorgezogen:** 16 der hier als „neu“ bezeichneten Module entstehen schon für Klasse 1, mit Zahlenraum 20 und lauttreuen Wörtern ([klasse-1-abgleich.md](klasse-1-abgleich.md), Abschnitt 7). Für Klasse 2 brauchen sie dann nur neue Parameter und Inhalte.

---

## 1. Überblick

| Bereich      | Schwerpunkte in Klasse 2                                                                                                                  | Einheiten |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Lesen 📖     | Wörter mit Besonderheiten, Sichtwortschatz, Sätze und kurze Texte verstehen                                                               | 7         |
| Schreiben ✏️ | Grundwortschatz 1/2 mit Rechtschreibbesonderheiten, Strategien, Lernwörter-Diktat, Alphabet, verbundene Schrift                           | 12        |
| Sprache 🧩   | Nomen, Artikel, Verb, Adjektiv; Einzahl/Mehrzahl; Satz und Satzschlusszeichen; Großschreibung; Wortfamilie, Zusammensetzungen, Wortfelder | 10        |
| Rechnen 🔢   | Zahlenraum 100, Plus und Minus bis 100, Einmaleins (Kernaufgaben), Teilen mit Rest, Sachaufgaben, Daten, Zufall                           | 16        |
| Formen 🔷    | Lagebegriffe, Flächen- und Körperformen, Achsensymmetrie, Muster, Flächen vergleichen                                                     | 6         |
| Messen 📏    | Geld (€ und ct), Längen (m und cm), Schätzen                                                                                              | 5         |
| Uhr 🕒       | Viertelstunden bis Minuten (vorhanden), digitale Uhrzeit, Zeitspannen, Kalender                                                           | 5         |
| HSU 🔍       | Fortsetzung des HSU-Bereichs aus Klasse 1 mit den übrigen Themen aus HSU 1/2                                                              | –         |

## 2. Startwerte (`basis/grade-defaults.json`)

| Einstellung                  | Klasse 2                                                                                        | heute in der Datei | Begründung                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| Buchstaben-Filter            | aus                                                                                             | aus                | alle Buchstaben sind gelernt                                     |
| Silbenfärbung                | an, im 2. Halbjahr aus (Vorschlag)                                                              | an                 | Hilfe beim Übergang zu längeren Wörtern; sie soll aber auslaufen |
| Groß-/Kleinschreibung werten | an                                                                                              | an (Basis)         | Großschreibung der Nomen ist Lehrplan-Inhalt (4.4)               |
| Zahlenraum                   | 100                                                                                             | 100                | Mathematik 1.1/1.2                                               |
| Zehnerübergang               | an                                                                                              | an                 |                                                                  |
| Aufgaben pro Einheit         | 8                                                                                               | 8                  |                                                                  |
| **Schrift (neu)**            | Vereinfachte Ausgangsschrift oder Schulausgangsschrift, Pflichtauswahl beim Wechsel in Klasse 2 | –                  | Der Lehrplan lässt beide zu; die Schule entscheidet (3.1)        |
| **Einheiten (neu)**          | 1. Halbjahr an, 2. Halbjahr aus                                                                 | –                  | README, Abschnitt 4                                              |

## 3. Lesen 📖

Lehrplan: Deutsch 2.2 „Über Lesefertigkeiten verfügen“ (richtig und in angemessenem Tempo lesen, Buchstabenverbindungen und Wortteile auf einen Blick erfassen, Sichtwortschatz), 2.3 „Über Lesefähigkeiten verfügen“ (sinnerschließend lesen, Verständnis von Sach- und Gebrauchstexten auch einfacher Tabellen zeigen), 2.4 „Texte erschließen“ (Abfolgen in Texten ordnen).

| Nr   | Einheit                                                                        | Lehrplan | Übungen (Modul, Parameter)                                              | HJ  |
| ---- | ------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- | --- |
| L2-1 | Wörter mit Besonderheiten lesen (ie, Doppelkonsonanten, sp/st, ng/nk …)        | 2.2      | `lesen.wort-bild`, `lesen.bild-wort` mit `wordGrade: 2` (vorhanden)     | 1   |
| L2-2 | Blitzlesen: Häufigkeitswörter (aber, als, auf, doch, nicht, schon …)           | 2.2      | `lesen.blitzlesen` (neu)                                                | 1   |
| L2-3 | Wortbausteine erkennen (ver-, vor-, un-; -en, -er, -el)                        | 2.2, 4.3 | `lesen.blitzlesen` mit Bausteinen, `lesen.silben-hoeren` mit Bausteinen | 1   |
| L2-4 | Satz lesen, Bild finden                                                        | 2.2, 2.3 | `lesen.satz-bild` (neu)                                                 | 1   |
| L2-5 | Lückensatz: passendes Wort                                                     | 2.3      | `lesen.satz-luecke` (neu)                                               | 2   |
| L2-6 | Kurze Texte verstehen: Geschichte, Tiersteckbrief, Anleitung, einfache Tabelle | 2.3      | `lesen.text-fragen` (neu): 3–6 Sätze, 30–60 Wörter, 3 Fragen            | 2   |
| L2-7 | Was passiert zuerst? Bilder oder Sätze einer Geschichte ordnen                 | 2.4      | `lesen.reihenfolge` (neu)                                               | 2   |

**Nicht in der App:** Leseerfahrungen austauschen (2.1), Lesevortrag mit Betonung (2.2), Vermutungen zum Handlungsverlauf besprechen (2.4), Texte präsentieren (2.5).

## 4. Schreiben ✏️

Lehrplan: Deutsch 4.4 „Richtig schreiben“ mit dem **ISB-Grundwortschatz 1/2** und 3.1 „Über Schreibfertigkeiten verfügen“ (verbundene Schrift nach der Vereinfachten Ausgangsschrift oder der Schulausgangsschrift).

Die Einheiten S2-1 bis S2-8 folgen den Übungsschwerpunkten des Grundwortschatzes. Klasse 1 hat davon nur die lauttreuen Wörter geübt (PLAN.md, Abschnitt 4: Wörter mit Besonderheiten kommen in Klasse 2). Jede Einheit nutzt dieselben Module, gefiltert nach dem Phänomen (`phenomena`).

| Nr    | Einheit                                                                       | Beispiele aus dem Grundwortschatz                                  | Übungen                                                                                           | HJ  |
| ----- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | --- |
| S2-1  | Endungen -er, -el, -en (Aussprache ≠ Schreibung)                              | Bruder, Feder, Gabel, Nadel, malen, rechnen                        | Lückenwort, Buchstaben legen, ABC-Tastatur (vorhanden) mit `phenomena`                            | 1   |
| S2-2  | Buchstabengruppen: Ei/ei, Eu/eu, Sp/sp, St/st, ch, Sch/sch, Pf/pf, Qu, ng, nk | Zeit, Leute, spielen, Stern, Tasche, Kopf, Quelle, singen, trinken | dazu `schreiben.schreibung` (neu)                                                                 | 1   |
| S2-3  | r nach Vokal (vokalisiertes r)                                                | Garten, Wort, lernen, warten                                       | wie S2-2                                                                                          | 1   |
| S2-4  | Wörter mit ie                                                                 | Biene, Wiese, Ziege, sieben, spielen                               | wie S2-2                                                                                          | 1   |
| S2-5  | Doppelkonsonanten in der Wortmitte (silbisch mitsprechen)                     | Sonne, Klasse, Mutter, Wasser, Himmel                              | `schreiben.silben-legen` (Son-ne), `schreiben.schreibung`                                         | 2   |
| S2-6  | Umlaute ableiten                                                              | Baum – Bäume, Maus – Mäuse, Apfel – Äpfel                          | `schreiben.ableiten` (neu)                                                                        | 2   |
| S2-7  | Auslautverhärtung: verlängern                                                 | Hund – Hunde, Tag – Tage, gelb – gelbe, legt – legen               | `schreiben.ableiten`                                                                              | 2   |
| S2-8  | Merkwörter: ß, tz, ck, C, V/v, y, x, nicht hörbares h, ä ohne Ableitung, ai   | Fuß, Katze, dick, Cent, Vogel, Baby, Hexe, Uhr, Mädchen, Kaiser    | `schreiben.schreibung`, ABC-Tastatur                                                              | 2   |
| S2-9  | Häufigkeitswörter richtig schreiben                                           | aber, als, also, auf, aus, bei, das, der …                         | `schreiben.diktat` (neu)                                                                          | 1–2 |
| S2-10 | Lernwörter-Diktat: Wort hören und tippen, ohne Bild                           | eigene Auswahl der Eltern (Lernwörter der Woche)                   | `schreiben.diktat` mit Wortliste aus dem Elternbereich                                            | 1–2 |
| S2-11 | Alphabet und Nachschlagen                                                     | ABC ordnen, „Welches Wort kommt zuerst?“                           | `schreiben.abc` (neu)                                                                             | 2   |
| S2-12 | Verbundene Schrift nachspuren: Buchstaben, Verbindungen, kurze Wörter         | VA oder SAS je nach Profil                                         | `schreiben.nachspuren` mit `schriften/vereinfachte-ausgangsschrift/` bzw. `schulausgangsschrift/` | 1   |

Hinweise:

- **Lernwörter der Woche (S2-10):** Viele Klassen geben jede Woche Lernwörter aus. Der Elternbereich bekommt dafür eine kleine Liste zum Eintippen. Die Wörter bleiben auf dem Gerät. Ohne Bild spricht die App das Wort und einen Beispielsatz.
- **Verbundene Schrift (S2-12):** Die Strichvorlagen der Druckschrift (`schriften/druckschrift/strokes.json`) sind das Muster. Neu sind die Verbindungen zwischen Buchstaben. Es wird nur nachgespurt; eine Erkennung freier Schreibschrift wie in E6 ist nicht vorgesehen, weil die Druckschrift-Erkennung schon bei Druckbuchstaben an Grenzen kommt (PLAN.md, E6). Das ist die aufwendigste Einheit der Klasse (L) und kann zuletzt kommen, wenn die Schule mit der verbundenen Schrift erst im Laufe des Jahres beginnt.
- **Nicht in der App:** eigene Texte planen, schreiben und überarbeiten (3.2, 3.3), Abschreiben auf Papier, Handhaltung.

## 5. Sprache 🧩 (neuer Bereich)

Lehrplan: Deutsch 4.3 „Sprachliche Strukturen in Wörtern, Sätzen, Texten untersuchen und verwenden“ und das grammatische Prinzip aus 4.4 (Nomen erkennen, Großschreibung am Satzanfang).

| Nr     | Einheit                                                        | Lehrplan (Deutsch 1/2)                                                  | Übungen                                                                   | HJ  |
| ------ | -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- | --- |
| SP2-1  | Selbstlaute und Mitlaute; der Vokal als Silbenkern             | 4.3 „unterscheiden Vokale und Konsonanten“, 4.4                         | `sprache.wortart` mit Kategorien Vokal/Konsonant (im Wort antippen)       | 1   |
| SP2-2  | Nomen erkennen (Artikelprobe, Mehrzahl)                        | 4.3 „bestimmen Nomen, Verben und Artikel“, 4.4 grammatisch              | `sprache.wortart` (Nomen / kein Nomen), `sprache.artikel`                 | 1   |
| SP2-3  | Einzahl und Mehrzahl                                           | 4.3                                                                     | `sprache.formen` (Mehrzahl)                                               | 1   |
| SP2-4  | Großschreibung: Nomen und Satzanfang                           | 4.4 „achten auf die Großschreibung am Satzanfang“                       | `sprache.gross-klein`                                                     | 1   |
| SP2-5  | Verben und Personalform (ich male, du malst, sie malt)         | 4.3 „verwenden Verben in der passenden Personalform“                    | `sprache.formen` (Personalform)                                           | 2   |
| SP2-6  | Adjektive: genau beschreiben (das Haus, das blaue Haus)        | 4.3 „nutzen Adjektive“                                                  | `sprache.wortart` (Nomen/Verb/Adjektiv), `lesen.satz-bild` mit Adjektiven | 2   |
| SP2-7  | Satzgrenzen und Satzschlusszeichen (. ? !)                     | 4.3 „erfassen den Satz als Sinneinheit … setzen ein Satzschlusszeichen“ | `sprache.satzzeichen`                                                     | 2   |
| SP2-8  | Wortfamilien (fahren, Fahrrad, fahrbar)                        | 4.3 „finden … den Wortstamm“                                            | `sprache.wortfamilie`                                                     | 2   |
| SP2-9  | Zusammengesetzte Nomen (Haus + Tür = Haustür)                  | 4.3 „nutzen Zusammensetzungen“                                          | `sprache.wortbildung`                                                     | 2   |
| SP2-10 | Wortfelder (gehen: rennen, schleichen; sagen: rufen, flüstern) | 4.3 „nutzen Wortschatzalternativen“                                     | `sprache.wortfeld`                                                        | 2   |

**Nicht in der App:** Absichten von Sprechern beschreiben (4.1), Alltags- und Bildungssprache, Dialekt und andere Sprachen vergleichen (4.2).

## 6. Rechnen 🔢

Lehrplan: Mathematik 1.1 „Zahlen strukturiert darstellen und Zahlbeziehungen formulieren“, 1.2 „Im Zahlenraum bis Hundert rechnen und Strukturen nutzen“, 1.3 „Sachsituationen und Mathematik in Beziehung setzen“, 4.1 „Daten erfassen und strukturiert darstellen“, 4.2 „Zufallsexperimente durchführen und Wahrscheinlichkeiten vergleichen“.

| Nr    | Einheit                                                                                                 | Lehrplan | Übungen                                                           | HJ  |
| ----- | ------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- | --- |
| R2-1  | Zehner und Einer: Zehnerstangen/Einerwürfel, Stufenschrift (34 → 3Z 4E), Zahlwort                       | 1.1      | `rechnen.stellenwert` (neu)                                       | 1   |
| R2-2  | Orientierung bis 100: Zählen in Schritten, Nachbarzahlen, gerade/ungerade, Hundertertafel, Zahlenstrahl | 1.1      | `rechnen.zahlenstrahl` (neu), `rechnen.reihen` mit `max: 100`     | 1   |
| R2-3  | Zahlen vergleichen bis 100 (<, >, =)                                                                    | 1.1      | `rechnen.vergleichen` mit `max: 100` (vorhanden)                  | 1   |
| R2-4  | Zahlen zerlegen (32 = 30 + 2; 10 = 1 + 9)                                                               | 1.1      | `rechnen.zahlenhaus` mit `max: 100` und Zehnerzahlen              | 1   |
| R2-5  | Einspluseins bis 20 automatisieren, mit Umkehraufgaben                                                  | 1.2      | `rechnen.plus-minus` mit `max: 20` (vorhanden)                    | 1   |
| R2-6  | Plus und Minus bis 100: Z ± Z, ZE ± E, ZE ± Z, ZE ± ZE, ohne und mit Übergang                           | 1.2      | `rechnen.plus-minus` mit `max: 100` und neuem Parameter `forms`   | 1   |
| R2-7  | Rechenstrategien: Tausch-, Umkehr-, Nachbar- und analoge Aufgaben (3 + 4 → 30 + 40)                     | 1.2      | `rechnen.paeckchen` (neu)                                         | 1–2 |
| R2-8  | Malnehmen verstehen: Punktefeld und Wiederholung → Malaufgabe                                           | 1.2      | `rechnen.einmaleins` (Modus Bild → Aufgabe)                       | 2   |
| R2-9  | Einmaleins: Kernaufgaben mit 1, 2, 5, 10, Quadrataufgaben, mal 0, mit Umkehrung (Geteilt)               | 1.2      | `rechnen.einmaleins` mit `reihen: [1, 2, 5, 10]`, `quadrat: true` | 2   |
| R2-10 | Einmaleins ableiten: 9 · 8 = 10 · 8 − 8                                                                 | 1.2      | `rechnen.einmaleins` mit Hilfe „Kernaufgabe“                      | 2   |
| R2-11 | Aufteilen und Verteilen, Teilen mit Rest                                                                | 1.2      | `rechnen.einmaleins` mit `op: ':'`, `rest: true`                  | 2   |
| R2-12 | Arithmetische Muster fortsetzen (fortgesetzte Addition, gleich- und gegensinniges Verändern)            | 1.2      | `rechnen.reihen` mit Zahlenfolgen bis 100, `rechnen.paeckchen`    | 2   |
| R2-13 | Sachaufgaben: Bild und vorgelesener Text → Rechnung wählen → Ergebnis; „Kann das stimmen?“              | 1.3, 3.3 | `rechnen.sachaufgabe` (neu)                                       | 2   |
| R2-14 | Kombinieren: Wie viele Möglichkeiten? (2 T-Shirts, 3 Hosen)                                             | 1.3      | `rechnen.kombinatorik` (neu, optional)                            | 2   |
| R2-15 | Strichliste, Tabelle und Schaubild ablesen                                                              | 4.1      | `rechnen.daten` (neu)                                             | 2   |
| R2-16 | sicher, möglich, unmöglich; wo ist die Chance größer?                                                   | 4.2      | `rechnen.zufall` (neu)                                            | 2   |

**Nicht in der App:** Rechenwege in Rechenkonferenzen vergleichen und begründen, Zufallsexperimente selbst durchführen.

## 7. Formen 🔷 (neuer Bereich)

Lehrplan: Mathematik 2.1 „Sich im Raum orientieren“, 2.2 „Geometrische Figuren benennen und darstellen“, 2.3 „Geometrische Abbildungen erkennen und darstellen“, 2.4 „Geometrische Muster untersuchen und erstellen“, 2.5 „Flächeninhalte/Umfänge bestimmen und vergleichen“.

| Nr   | Einheit                                                                                                          | Lehrplan | Übungen                                                 | HJ  |
| ---- | ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- | --- |
| F2-1 | Lagebegriffe: links/rechts, neben, zwischen, oben/unten, vor/hinter, über/unter                                  | 2.1      | `formen.lage` (neu); kann auch in Klasse 1 kommen       | 1   |
| F2-2 | Flächenformen: Dreieck, Kreis, Viereck, Rechteck, Quadrat; Ecken und Seiten                                      | 2.2      | `formen.erkennen` (neu)                                 | 1   |
| F2-3 | Körperformen: Würfel, Quader, Kugel, Zylinder, Kegel, Pyramide, Prisma; Ecken, Kanten, Flächen; rollt oder kippt | 2.2      | `formen.erkennen` mit Körpern (eigene SVGs)             | 2   |
| F2-4 | Achsensymmetrie: Ist die Figur symmetrisch? Hälfte ergänzen                                                      | 2.3      | `formen.symmetrie` (neu)                                | 2   |
| F2-5 | Geometrische Muster fortsetzen                                                                                   | 2.4      | `rechnen.reihen`, Level „Bilder und Formen“ (vorhanden) | 1–2 |
| F2-6 | Flächen vergleichen durch Auslegen, Umfang an Kästchen                                                           | 2.5      | `formen.flaeche` (neu)                                  | 2   |

**Nicht in der App:** Falten, Legen, Spannen am Geobrett, Kneten, Zeichnen mit dem Lineal, Spiegeln mit einem echten Spiegel.

## 8. Messen 📏 (neuer Bereich)

Lehrplan: Mathematik 3.1 „Messhandlungen durchführen“ (Meter und Zentimeter, Münzen und Geldscheine, Euro und Cent, gemischte Schreibweise 9 € 30 ct und 2 m 15 cm), 3.2 „Größen strukturieren und Größenvorstellungen nutzen“ (Geld wechseln und auf verschiedene Arten darstellen, Bezugsgrößen), 3.3 „Mit Größen in Sachsituationen umgehen“.

| Nr   | Einheit                                                                    | Lehrplan | Übungen                                       | HJ  |
| ---- | -------------------------------------------------------------------------- | -------- | --------------------------------------------- | --- |
| M2-1 | Münzen und Scheine erkennen und nach Wert ordnen                           | 3.1, 3.2 | `messen.geld` (Modus erkennen)                | 1   |
| M2-2 | Geldbeträge legen und wechseln (10 € = fünf 2-€-Münzen = ein 5-€-Schein …) | 3.2      | `messen.geld` (Modus legen, wechseln)         | 1   |
| M2-3 | Einkaufen: Beträge vergleichen, Rückgeld                                   | 3.2, 3.3 | `messen.geld`, `rechnen.sachaufgabe`          | 2   |
| M2-4 | Längen: cm am Lineal ablesen, m und cm, 2 m 15 cm                          | 3.1      | `messen.ablesen` (Lineal), `messen.umrechnen` | 2   |
| M2-5 | Schätzen mit Bezugsgrößen (Tafelhöhe 1 m → Türhöhe 2 m)                    | 3.2      | `messen.schaetzen`                            | 2   |

**Nicht in der App:** mit Körpermaßen und Maßband messen, Messergebnisse vergleichen.

## 9. Uhr 🕒

Lehrplan: Mathematik 3.1 „lesen Uhrzeiten ab und bestimmen einfache Zeitspannen über Anfangs- und Endzeitpunkt (z. B. vor vier Stunden, drei Stunden später)“ sowie Stunde, Minute, Woche, Monat, Jahr; HSU 4.1 (Tag, Monat, Jahr).

| Nr   | Einheit                                                         | Übungen                                                       | HJ  |
| ---- | --------------------------------------------------------------- | ------------------------------------------------------------- | --- |
| U2-1 | Viertelstunden lesen und stellen                                | `uhr.lesen`, `uhr.stellen` ab Level 3 (vorhanden: `k2.uhr.*`) | 1   |
| U2-2 | 5-Minuten-Schritte und einzelne Minuten                         | `uhr.lesen` Level 4–5 (vorhanden)                             | 1–2 |
| U2-3 | Digitale Uhrzeit: 7:30 und 19:30, vormittags und nachmittags    | `uhr.digital` (neu)                                           | 2   |
| U2-4 | Zeitspannen: Wie spät ist es in 2 Stunden? Wie lange dauert es? | `uhr.zeitspanne` (neu)                                        | 2   |
| U2-5 | Kalender: Wochentage, Monate, Datum, gestern/heute/morgen       | `uhr.kalender` (neu)                                          | 1   |

## 10. HSU 🔍

Der HSU-Bereich aus Klasse 1 ([hsu-klasse-1.md](hsu-klasse-1.md)) läuft weiter, denn HSU 1/2 ist ein Doppeljahrgang. In Klasse 2 kommen die Themen dazu, die dort als „später“ markiert sind (Berufe nach Arbeitsfeldern, Stoffe und ihre Eigenschaften, Pläne lesen, früher und heute, Standfestigkeit). Neu ist, dass die Kinder jetzt lesen können: Begriffe und kurze Aussagen stehen zusätzlich als Text da.

## 11. Inhalte und Daten

| Datei                                                                                                | Inhalt                                                                                                                | Umfang (Ziel)                         |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `basis/klasse-2/words.json`                                                                          | Wörter mit Besonderheit (`phenomena`), Wortart, optional Bild, Verlängerungsform bei Verhärtung und Umlaut (`extend`) | 350–450 Wörter, mind. 15 pro Phänomen |
| `laender/DE-BY/overlay.json`                                                                         | `grundwortschatz` für Klasse 2: alle Wörter der ISB-Liste 1/2 mit Besonderheiten                                      | vollständige Liste                    |
| `basis/klasse-2/saetze.json`                                                                         | Sätze mit Bild (L2-4), Lückensätze (L2-5), Sätze für Satzzeichen und Großschreibung                                   | ca. 150 Sätze                         |
| `basis/klasse-2/texte.json`                                                                          | kurze eigene Texte mit 3 Fragen (L2-6), Bildfolgen (L2-7)                                                             | ca. 40 Texte                          |
| `basis/klasse-2/sachaufgaben.json`                                                                   | Sachaufgaben mit Bild, Rechnung und Ergebnis (R2-13, M2-3)                                                            | ca. 60 Aufgaben                       |
| `schriften/vereinfachte-ausgangsschrift/strokes.json`, `schriften/schulausgangsschrift/strokes.json` | Strichvorlagen mit Verbindungen                                                                                       | alle Buchstaben, groß und klein       |

**Prüfungen (`data:check`):** Jedes Wort hat ein gültiges Phänomen, das im Wort vorkommt; Verhärtungs- und Umlautwörter haben eine Verlängerungsform; jedes Wort der ISB-Liste 1/2 steht im Wörterbuch; Sätze für Klasse 2 haben höchstens 10 Wörter; jede Frage hat genau eine richtige Antwort; jede Sachaufgabe rechnet sich mit ihren Zahlen nach.

## 12. Umsetzung

| Phase | Inhalt                                                                           | Fertig, wenn …                                                                      | Umfang |
| ----- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| K2-0  | Querschnitt aus README, Abschnitte 3–4 (Bereiche, Kacheln pro Klasse, Einheiten) | … ein Profil der Klasse 2 genau seine Bereiche und freigeschalteten Einheiten sieht | M      |
| K2-1  | Wörterbuch Klasse 2 mit Phänomenen, Prüfregeln, Grundwortschatz Bayern           | … `data:check` grün ist und jedes Phänomen genug Wörter hat                         | M      |
| K2-2  | Rechnen bis 100 (R2-1 bis R2-7)                                                  | … Stellenwert, Zahlenstrahl und Plus/Minus bis 100 spielbar und getestet sind       | M      |
| K2-3  | Einmaleins und Teilen (R2-8 bis R2-12)                                           | … alle Kernaufgaben und Umkehraufgaben über Leitner laufen                          | M      |
| K2-4  | Rechtschreiben (S2-1 bis S2-11)                                                  | … jede Einheit mit eigenen Wörtern läuft, Lernwörter im Elternbereich               | M      |
| K2-5  | Lesen (L2-2 bis L2-7) mit Sätzen und Texten                                      | … 40 Texte geprüft und angehört sind                                                | L      |
| K2-6  | Uhr (U2-3 bis U2-5)                                                              | … digitale Uhr, Zeitspannen und Kalender spielbar sind                              | S      |
| K2-7  | Sprache (SP2-1 bis SP2-10)                                                       | … alle zehn Einheiten spielbar sind                                                 | L      |
| K2-8  | Messen (M2-1 bis M2-5)                                                           | … Geld und Lineal als SVG fertig und spielbar sind                                  | M      |
| K2-9  | Sachaufgaben, Daten, Zufall (R2-13 bis R2-16)                                    | … die Aufgabensammlung geprüft ist                                                  | M      |
| K2-10 | Formen (F2-1 bis F2-6)                                                           | … Flächen, Körper und Symmetrie spielbar sind                                       | M      |
| K2-11 | Verbundene Schrift (S2-12)                                                       | … alle Buchstaben und die häufigsten Verbindungen nachgespurt werden können         | L      |

**Reihenfolge:** Einmaleins, Zahlenraum 100, Rechtschreibung und Lesen sind in Klasse 2 am wichtigsten und kommen zuerst (K2-1 bis K2-5). K2-6 bis K2-10 sind unabhängig voneinander. K2-11 kommt zuletzt oder früher, je nachdem, wann die Schule mit der verbundenen Schrift beginnt.

## 13. Offene Punkte und Risiken

| Punkt                                                         | Umgang                                                                                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Welche verbundene Schrift die Schule nutzt                    | Einstellung pro Profil; beide Vorlagen anlegen oder erst die der eigenen Schule                                             |
| Reihenfolge der Themen im Schulbuch                           | Einheiten-Freischaltung durch die Eltern; Halbjahres-Zuordnung nur als Startwert                                            |
| Eigene Texte und Sätze in ausreichender Qualität              | klein anfangen (20 Texte), mit dem Kind testen, dann ausbauen                                                               |
| Geld-Abbildungen                                              | stilisiert zeichnen, keine echten Motive                                                                                    |
| Neun Bereiche auf dem Handy                                   | Kacheln pro Klasse; HSU nur, wenn der Elternbereich Themen freigeschaltet hat                                               |
| Ablenker bei `schreiben.schreibung` zu leicht oder verwirrend | Ablenker nur aus typischen Fehlern des jeweiligen Phänomens; nach der Antwort wird das richtige Wort gezeigt und vorgelesen |
