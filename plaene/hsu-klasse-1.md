# Heimat- und Sachunterricht (HSU) in Klasse 1 – Machbarkeit und Umsetzung

Stand: 27.11.2026. Lehrplan: LehrplanPLUS Bayern, **Fachlehrplan Heimat- und Sachunterricht 1/2** und Fachprofil HSU (abgerufen am 27.11.2026). In Bayern heißt das Fach offiziell „Heimat- und Sachunterricht“, kurz HSU; diesen Namen verwendet der Plan.

---

## 0. Ergebnis in Kürze

- **Machbar, mit klarer Grenze.** Die App kann das Wissen, die Begriffe und das Ordnen üben, die im HSU entstehen: Tiere und Pflanzen erkennen, Obst und Gemüse der Jahreszeit zuordnen, Müll trennen, Verkehrsregeln für Fußgänger, Wetter, Tagesablauf und Jahreslauf, Sinne, gesunde Ernährung, Berufe und Werkzeuge. Den eigentlichen HSU kann und soll sie nicht ersetzen: beobachten, untersuchen, bauen, Gespräche, Unterrichtsgänge.
- **Abdeckung:** Von den 59 Kompetenzerwartungen in HSU 1/2 kann die App 14 in einem wesentlichen Teil unterstützen, 25 in einem kleinen Teil (meist die Begriffe) und 20 gar nicht (Anhang). Keine Kompetenzerwartung erfüllt die App allein.
- **Technik:** HSU passt ohne Umbau in die Architektur: ein neuer Bereich `sache`, fünf neue Übungsmodule, die zum Teil vorhandene Komponenten nutzen, eine neue Datendatei mit Bildbegriffen und Themen, ein Themen-Raster im Elternbereich. Die Themen sind die Kategorien des Fachs (README, Abschnitt 4). Kein Server, keine Kamera, kein Mikrofon.
- **Bilder:** OpenMoji enthält fast alles, was Klasse 1 braucht (geprüft, Abschnitt 6). Es fehlen deutsche Verkehrszeichen, Zebrastreifen, einige Pflanzen (Löwenzahn, Gänseblümchen) und Mülltonnen; diese werden als eigene SVGs gezeichnet oder weggelassen.
- **Hauptaufwand sind die Inhalte:** etwa 250 Bildbegriffe in 16 Themen, fachlich geprüft, mit Prüfung der Aussprache.
- **Größtes Risiko:** fachlich falsche oder regional unpassende Inhalte, vor allem bei Verkehr und Mülltrennung. Dagegen helfen eindeutige Inhalte, eine Quelle pro Thema und die Freigabe der Themen durch die Eltern.
- **Empfehlung:** Umsetzen, in drei Stufen. Stufe 1 kommt ohne neue Grafiken aus und ist noch im laufenden Schuljahr nutzbar.

## 1. Was der Lehrplan verlangt

### Aufbau

- Ein gemeinsamer Fachlehrplan für die Jahrgangsstufen 1 und 2. Die Kompetenzerwartungen beschreiben das Ende von Klasse 2.
- **Keine Vorgabe zur Reihenfolge:** „Die Anordnung der Lernbereiche stellt keine Aussage über deren Wertigkeit und keine Vorgabe für eine zeitliche Abfolge im Unterricht dar. Vielmehr sollen Lernbereiche … wiederholt aufgegriffen und – unter verschiedenen Perspektiven – vielfältig vernetzt werden.“ (Fachprofil). Was in Klasse 1 drankommt, entscheiden Schule und Schulbuch.
- **Kompetenzstrukturmodell** nach dem Perspektivrahmen Sachunterricht der Gesellschaft für Didaktik des Sachunterrichts (2013): sechs Gegenstandsbereiche (= Lernbereiche), fünf Perspektiven (naturwissenschaftlich, technisch, geographisch, sozialwissenschaftlich, historisch) und sechs prozessbezogene Kompetenzen (Fragen stellen, Erkennen und verstehen, Eigenständig und mit anderen zusammenarbeiten, Kommunizieren und präsentieren, Reflektieren und bewerten, Handeln und umsetzen).
- **Handeln steht im Mittelpunkt:** „Handlungsorientierte und direkte Begegnungen (mit Menschen, Tieren und Pflanzen, Naturphänomenen, Werkzeugen, Gegenständen und Bauwerken auch an außerschulischen Lernorten) unterstützen die Kinder dabei, ihre Kenntnisse und Fähigkeiten auf ihren Alltag zu übertragen.“ (Fachprofil)
- **Sprache:** Fachbegriffe sicher anwenden ist „ein wesentlicher Bestandteil“ des Fachs; die Kinder verwenden „eine am Kind orientierte Fachsprache“. Hier kann eine App am meisten beitragen.
- **Stundentafel:** In den Jahrgangsstufen 1 und 2 gehört HSU mit Deutsch, Mathematik, Musik und Kunst zum „Grundlegenden Unterricht“ mit zusammen 16 Wochenstunden.

### Lernbereiche und Inhalte (HSU 1/2)

| Lernbereich                   | Teilbereich                                           | Inhalte laut Lehrplan (gekürzt)                                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Demokratie und Gesellschaft | 1.1 Zusammenleben in Familie, Schule und Gemeinschaft | Leben in der Klassengemeinschaft (Regeln, demokratische Entscheidungen, Konflikte, Feste); Familien und andere Lebensgemeinschaften                                                   |
|                               | 1.2 Leben in einer Medien- und Konsumgesellschaft     | Medien im Alltag; Grundbedürfnisse und Wünsche; Kaufen und Verkaufen                                                                                                                  |
| 2 Körper und Gesundheit       | 2.1 Körper und gesunde Ernährung                      | mein Körper und meine Gefühle; Gesundheitsvorsorge und Körperhygiene; Nahrungsmittel und ihre Inhaltsstoffe; Zähne und Zahngesundheit                                                 |
|                               | 2.2 Gefühle und Wohlbefinden                          | meine Gefühle und mein Körper; aktive Freizeitgestaltung                                                                                                                              |
| 3 Natur und Umwelt            | 3.1 Tiere, Pflanzen, Lebensräume                      | Tier- und Pflanzenarten aus Wiese oder Hecke (Merkmale, Artenkenntnis, Ausbreitung); einfache Nahrungsbeziehungen (Pflanze – Schnecke – Amsel); Haustiere, Nutztiere und -pflanzen    |
|                               | 3.2 Stoffe und Energie                                | Stoffe und ihre Eigenschaften (Plastik, Salz, Zucker, Holz, Metall, Wachs, Wolle, Glas, Stein, Papier); Brandschutz und Verhalten im Brandfall; Wertstoffe, Recycling, Müllvermeidung |
|                               | 3.3 Luft, Wasser, Wetter                              | Luft und ihre Wirkungen; Luftverschmutzung; Wettererscheinungen und ihre Messung                                                                                                      |
| 4 Zeit und Wandel             | 4.1 Zeitbewusstsein und Orientierung in der Zeit      | Tagesablauf und Jahresablauf; Jahreskreis und Zeitleiste; Feste im Jahreslauf                                                                                                         |
|                               | 4.2 Dauer und Wandel                                  | Quellen zur eigenen Lebensgeschichte; Veränderungen im Alltag von Kindern (Spiel, Freizeit, Schule, Familie)                                                                          |
|                               | 4.3 Fakten und Fiktion                                | Geschichte und Geschichten                                                                                                                                                            |
| 5 Raum und Mobilität          | 5.1 Räume wahrnehmen und sich orientieren             | vertraute Umgebungen (Klassenzimmer, Schulgelände, Schulweg); Räume nah und fern; Pläne als Abbildung der Realität                                                                    |
|                               | 5.2 Räume nutzen und schützen                         | Ausstattung eines vertrauten Raums (Wohnumgebung, Dorf); pfleglicher Umgang mit Räumen                                                                                                |
|                               | 5.3 Mobilität im Raum                                 | Formen der Mobilität (zu Fuß, Auto, Bahn, öffentliche Verkehrsmittel); Regeln im Straßenverkehr; Kinder im Straßenverkehr (Gefahren, 3A-Training, Schonraum)                          |
| 6 Technik und Kultur          | 6.1 Arbeit, technische und kulturelle Entwicklung     | Werkzeuge und Geräte (Schere, Messer, Hammer, Zange, Säge, Schaufel); Berufe in Landwirtschaft, Handwerk, Industrie, Dienstleistung                                                   |
|                               | 6.2 Bauen und Konstruieren                            | Standfestigkeit (Schwerpunkt, Grundfläche, Höhe); rollende Objekte; Modellzeichnungen und Anleitungen; kulturell bedeutsame Bauten (Stadtmauer, Kirchturm, Burg, Schloss)             |

## 2. Was eine Lern-App im HSU leisten kann

Eine Übung kommt nur in die App, wenn sie diese Bedingungen erfüllt:

1. **Bild und Sprache reichen.** Kinder in Klasse 1 können die Fachbegriffe nicht lesen; „Marienkäfer“ oder „Löwenzahn“ sind nicht lauttreu (PLAN.md, Abschnitt 5). Alles läuft über Bild und Sprachausgabe. Text erscheint erst nach der Antwort als Beschriftung, wie beim Reimen.
2. **Es gibt eine eindeutige richtige Antwort.** Zuordnen, Ordnen, Erkennen. Keine Meinungs- oder Wertungsfragen („Was ist fair?“).
3. **Kein persönlicher Bezug.** Keine Fotos, keine Angaben zu Familie, Schulweg oder Gefühlen des Kindes. Das folgt aus der Leitplanke „Offline und privat“ (PLAN.md, Abschnitt 2): Die App speichert nur den Lernstand.
4. **Sicher.** Wer falsch übt, darf sich danach nicht gefährlicher verhalten. Sicherheitsthemen (Verkehr, Feuer, Gewitter, Pflanzen) nur mit vollständigen, geprüften Regeln.
5. **Ergänzt das Handeln.** Nach einem Thema kann der Elternbereich einen „Forscherauftrag“ vorschlagen (z. B. „Pustet zusammen eine Pusteblume und schaut, wie weit die Schirmchen fliegen“). Die App bewertet ihn nicht.

## 3. Bewertung je Teilbereich

Eignung: **hoch** = ein großer Teil der Inhalte lässt sich üben; **mittel** = einzelne Begriffe oder Regeln; **gering** = fast nichts.

| Teilbereich                   | Eignung     | Das kann die App üben                                                                                                                                                                                                  | Das bleibt im Unterricht                                                 |
| ----------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1.1 Zusammenleben             | gering      | –                                                                                                                                                                                                                      | Regeln aushandeln, Konflikte lösen, Rollenspiel, Familienformen          |
| 1.2 Medien und Konsum         | mittel      | Medien benennen und unterscheiden (Buch, Hörspiel, Fernsehen, Tablet); „Brauche ich das oder wünsche ich es mir?“ (Brot, Jacke – Spielkonsole)                                                                         | eigene Mediennutzung besprechen; Kaufen mit Geld ab Klasse 2 (Messen 📏) |
| 2.1 Körper und Ernährung      | **hoch**    | Sinnesorgane und Sinne zuordnen; Lebensmittel nach „oft – manchmal – selten“; zahnfreundlich?; Händewaschen und Zähneputzen in Reihenfolge                                                                             | positive Beziehung zum eigenen Körper; eigene Essgewohnheiten            |
| 2.2 Gefühle                   | mittel      | Gefühle an Gesichtern erkennen und benennen (froh, traurig, wütend, ängstlich, überrascht)                                                                                                                             | eigene Gefühle ausdrücken, Strategien gegen Wut, Freizeit                |
| 3.1 Tiere und Pflanzen        | **hoch**    | Arten aus Wiese und Hecke erkennen; Körperbedeckung und Fortbewegung; Nahrungskette ordnen; Nutztier und Produkt (Kuh – Milch); was ein Haustier braucht; Obst und Gemüse nach Erntezeit; Baum im Jahreslauf           | bestimmen in der Natur, Beobachten, Löwenzahnfrüchte untersuchen         |
| 3.2 Stoffe und Energie        | mittel      | Stoffe benennen (Holz, Metall, Glas, Papier, Wolle, Stein, Plastik); Müll trennen; „Schwimmt es oder geht es unter?“ mit eindeutigen Fällen; Feuer: Was ist gefährlich? Notruf 112                                     | Stoffe untersuchen, Brandschutzübung an der Schule                       |
| 3.3 Luft, Wasser, Wetter      | mittel      | Wettersymbole benennen; passende Kleidung zum Wetter; warm oder kalt; Verhalten bei Gewitter                                                                                                                           | Experimente mit Luft, Wetter messen und dokumentieren                    |
| 4.1 Zeit                      | **hoch**    | Tageszeiten und Tagesablauf ordnen; Wochentage; Monate und Jahreszeiten; Feste im Jahreslauf                                                                                                                           | Jahreskreis der Klasse gestalten                                         |
| 4.2 Dauer und Wandel          | gering      | früher und heute vergleichen (Kerze – Glühbirne, Wählscheibe – Handy, Pferdekutsche – Auto)                                                                                                                            | eigene Lebensgeschichte, Zeitzeugen befragen, Quellen                    |
| 4.3 Fakten und Fiktion        | mittel      | „Gibt es das wirklich?“: gibt es heute – gab es früher – gibt es nur in Geschichten (Pferd – Dinosaurier – Einhorn)                                                                                                    | Sagen und Filme hinterfragen                                             |
| 5.1 Räume                     | mittel      | Raum-Lage-Begriffe (links, rechts, vor, hinter, auf, unter, zwischen); Stadt oder Land?; später: Raum von oben (Draufsicht)                                                                                            | Schulweg, Orientierung vor Ort, Pläne zeichnen                           |
| 5.2 Räume nutzen und schützen | gering      | Was gehört nicht hierher? (Müll in der Wiese)                                                                                                                                                                          | Wohnumgebung erkunden                                                    |
| 5.3 Mobilität                 | mittel–hoch | Verkehrsmittel benennen und sortieren; Fußgängerampel; Zebrastreifen; Verkehrszeichen für Fußgänger; „Wer ist im Dunkeln besser zu sehen?“ (helle Kleidung, Reflektoren); sichere und unsichere Stellen auf einem Bild | Schulwegtraining, Übungen im Schonraum, 3A-Training                      |
| 6.1 Arbeit und Technik        | **hoch**    | Werkzeug und Tätigkeit (Schere – schneiden); Berufe erkennen und ihrem Arbeitsort oder Werkzeug zuordnen                                                                                                               | Werkzeuge sicher benutzen                                                |
| 6.2 Bauen                     | gering      | „Welcher Turm steht sicherer?“; Bauwerke erkennen (Burg, Kirche, Schloss)                                                                                                                                              | Türme und Kugelbahnen bauen und testen, Anleitungen nutzen               |

**Ausgeschlossen werden bewusst:** alles zu Familie und Lebensgeschichte (persönliche Daten), die Abfrage eigener Gefühle (keine Speicherung von Gefühlslagen), giftige Pflanzen mit Bild (Verwechslungsgefahr; nur die Regel „Unbekannte Pflanzen und Beeren nie essen, erst einen Erwachsenen fragen“), der konkrete Schulweg und das Verhalten im Brandfall der eigenen Schule (regelt jede Schule selbst).

## 4. Themen für Klasse 1 (Vorschlag im Jahreslauf)

Weil der Lehrplan keine Reihenfolge vorgibt, folgt der Vorschlag den Jahreszeiten und Festen, wie es im HSU üblich ist. Die Eltern schalten im Elternbereich die Themen frei, die gerade in der Schule drankommen; die anderen bleiben verborgen.

| Zeitraum   | Thema in der App (Stufe)                       | Lehrplan | Beispiele                                                                             |
| ---------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| Sept./Okt. | **Sicher zu Fuß** (2)                          | 5.3      | Ampel rot/grün, Zebrastreifen, Gehweg, Bordstein, „erst schauen“; Verkehrsmittel      |
| Sept./Okt. | **Obst und Gemüse im Herbst** (1)              | 3.1, 2.1 | Apfel, Birne, Kürbis, Kartoffel, Karotte; Erntezeit; oft essen                        |
| Nov.       | **Meine Sinne** (1)                            | 2.1      | Auge – sehen, Ohr – hören, Nase – riechen, Zunge – schmecken, Hand – tasten           |
| Nov.       | **Gut sichtbar im Dunkeln** (2)                | 5.3      | helle Kleidung, Reflektoren, Warnweste, Licht am Roller                               |
| Nov./Dez.  | **Zeit: Tag, Woche, Jahr** (1)                 | 4.1      | morgens – mittags – abends – nachts; Wochentage; Monate; Jahreszeiten                 |
| Nov.–Apr.  | **Feste im Jahreslauf** (1)                    | 4.1      | Erntedank, St. Martin, Nikolaus, Weihnachten, Neujahr, Fasching, Ostern, Geburtstag   |
| Jan./Feb.  | **Wetter und Kleidung** (1)                    | 3.3      | Sonne, Regen, Schnee, Wind, Nebel, Gewitter; Mütze, Regenjacke, Sonnenhut             |
| Jan./Feb.  | **Gesund essen, gesunde Zähne** (2)            | 2.1      | oft – manchmal – selten; zahnfreundlich; Zähneputzen in Reihenfolge                   |
| Feb.       | **Gefühle erkennen** (2)                       | 2.2      | froh, traurig, wütend, ängstlich, überrascht                                          |
| März/Apr.  | **Frühling auf der Wiese** (1)                 | 3.1      | Marienkäfer, Biene, Schmetterling, Raupe, Schnecke, Regenwurm, Amsel; Tulpe, Klee     |
| März/Apr.  | **Müll trennen** (2)                           | 3.2      | Papier, Glas, Bioabfall, Verpackung, Restmüll; Müll vermeiden                         |
| Mai/Juni   | **Tiere bei uns: Haustiere und Nutztiere** (1) | 3.1      | Hund, Katze, Hamster; Kuh – Milch, Huhn – Ei, Schaf – Wolle, Biene – Honig, Schwein   |
| Mai/Juni   | **In der Hecke: Wer frisst wen?** (1)          | 3.1      | Pflanze – Schnecke – Amsel; Blattlaus – Marienkäfer; Igel                             |
| Juni/Juli  | **Berufe und Werkzeuge** (1)                   | 6.1      | Bäckerin, Landwirt, Ärztin, Feuerwehr, Polizei; Schere, Hammer, Säge, Schaufel, Zange |
| Juli       | **Gibt es das wirklich?** (2)                  | 4.3      | Pferd, Dinosaurier, Ritter, Einhorn, Drache, Hexe                                     |
| Juli       | **Früher und heute** (2, optional)             | 4.2      | Kerze – Glühbirne, Brief – Handy, Kutsche – Auto, Waschbrett – Waschmaschine          |

**Feste:** Nur Feste mit festem Datum oder fester Jahreszeit werden einem Monat zugeordnet. Bewegliche Feste wie Ostern nur der Jahreszeit; Feste mit wanderndem Datum (z. B. nach dem Mondkalender) nicht einem Monat. Die Auswahl soll die Vielfalt der Klasse spiegeln und lässt sich in der Länderanpassung ergänzen.

## 5. Übungstypen (Module)

| Modul                      | Ablauf                                                                                                                                                                                                               | Nutzt                            | Aufwand |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------- |
| `sache.hoeren-bild`        | „Wo ist der Marienkäfer?“ Die Stimme nennt den Begriff, drei oder vier Bilder stehen zur Wahl.                                                                                                                       | `ListenPictureTask` aus Lesen    | S       |
| `sache.paare`              | „Was gibt uns die Kuh?“ Ein Bild oben, drei Bilder zur Wahl (Milch, Ei, Wolle). Auch: Sinnesorgan – Sinn, Werkzeug – Tätigkeit, Beruf – Werkzeug                                                                     | `ListenPictureTask` mit Zielbild | S       |
| `sache.sortieren`          | Ein Bild erscheint, das Kind tippt die passende Gruppe an (2–4 große Kacheln mit Bild, der Name wird vorgelesen): Mülltonnen, Jahreszeiten, oft/manchmal/selten, Haustier/Nutztier/Wildtier, gibt es/gab es/erfunden | neue Komponente                  | M       |
| `sache.reihenfolge`        | 3–5 Bilder in die richtige Reihenfolge tippen: Tagesablauf, Nahrungskette, Händewaschen, Baum im Jahreslauf, vom Samen zur Blume                                                                                     | `TileBoard` aus Schreiben        | M       |
| `sache.stimmt-das`         | Ein Satz mit Bild wird vorgelesen („Bei Rot gehe ich über die Straße.“), das Kind wählt 👍 oder 👎. Danach wird die richtige Regel vorgelesen.                                                                       | neue kleine Komponente           | S       |
| `sache.suchbild` (Stufe 3) | Szene als SVG, das Kind tippt eine Stelle an: „Wo kannst du sicher über die Straße gehen?“                                                                                                                           | neue Komponente, eigene Grafik   | L       |

Für alle Module gilt:

- **Nach jeder Antwort** erscheint der Name unter dem Bild, und die Stimme sagt einen kurzen Merksatz („Die Amsel frisst Schnecken und Würmer.“). So lernt das Kind auch bei einer falschen Antwort etwas.
- **Ablenker** sind eindeutig verschieden. Wie bei „Reihen erkennen“ (PLAN.md, E5) kommen Motive, die sich bei OpenMoji zu ähnlich sehen (z. B. Biene und Wespe), nicht zusammen vor.
- **Lernstand** wie überall pro Item, z. B. `sache.hoeren-bild:marienkaefer` oder `sache.sortieren:muell:bananenschale`.
- **Fehler** werden wie bisher behandelt: zweiter Versuch, dann wird die Lösung gezeigt und vorgelesen.

## 6. Inhalte, Daten und Bilder

### Datendatei

`src/data/basis/klasse-1/sache.json` enthält Begriffe und Themen:

```json
{
  "begriffe": [
    {
      "id": "marienkaefer",
      "text": "Marienkäfer",
      "image": "1F41E",
      "merksatz": "Der Marienkäfer frisst Blattläuse.",
      "tags": { "lebensraum": "wiese", "gruppe": "insekt" }
    }
  ],
  "themen": [
    {
      "id": "wiese",
      "title": "Frühling auf der Wiese",
      "lehrplan": "HSU1/2 3.1",
      "quelle": "LehrplanPLUS HSU 1/2, 3.1; …",
      "aufgaben": [
        { "exercise": "sache.hoeren-bild", "begriffe": ["marienkaefer", "biene", "schnecke"] },
        { "exercise": "sache.reihenfolge", "folgen": [["klee", "schnecke", "amsel"]] }
      ]
    }
  ]
}
```

- Begriffe, die es im Hörwortschatz schon gibt (Apfel, Hund, Hase …), werden über ihre `id` wiederverwendet statt doppelt angelegt.
- Jedes Thema wird ein Katalog-Eintrag pro Übungstyp mit `unit` = Thema (README, Abschnitt 4), z. B. `k1.sache.wiese.erkennen`.
- **Mülltrennung** ist nicht einmal innerhalb Bayerns einheitlich (Gelber Sack, Gelbe Tonne oder Wertstoffhof; nicht überall eine Biotonne). Der Elternbereich fragt deshalb, welche Tonnen es zu Hause gibt; nur diese erscheinen als Gruppen.

### Prüfungen (`data:check`)

- Jedes Bild existiert, jeder Begriff hat einen Merksatz, jedes Thema hat `lehrplan` und `quelle`.
- Jede Sortiergruppe hat mindestens 4 Begriffe, jede Reihenfolge 3–5 Schritte, jede Aussage bei `sache.stimmt-das` hat `richtig` und eine Erklärung.
- Kein Begriff steht in zwei Gruppen derselben Sortierung.
- Im Sprachtest des Elternbereichs gibt es eine Gruppe „HSU“, damit alle Begriffe und Merksätze auf dem Gerät angehört werden (Aussprache von Amsel, Löwenzahn, Erntedank …).

### Bilder

OpenMoji 17 (im Projekt vorhanden) wurde auf die Motive der Stufe 1 und 2 geprüft. Vorhanden sind unter anderem:

| Thema                | Motive (OpenMoji-Code)                                                                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wiese und Hecke      | Marienkäfer 1F41E, Biene 1F41D, Schmetterling 1F98B, Raupe 1F41B, Schnecke 1F40C, Regenwurm 1FAB1, Amsel 1F426-200D-2B1B, Igel 1F994, Tulpe 1F337, Blüte 1F33C, Baum 1F333, Pilz 1F344                                                                                  |
| Haus- und Nutztiere  | Kuh 1F404, Schwein 1F416, Schaf 1F411, Huhn 1F414, Ei 1F95A, Milch 1F95B, Wolle 1F9F6, Getreide 1F33E                                                                                                                                                                   |
| Obst und Gemüse      | Apfel 1F34E, Birne 1F350, Kirschen 1F352, Erdbeere 1F353, Trauben 1F347, Kürbis 1F383, Karotte 1F955, Kartoffel 1F954, Brokkoli 1F966                                                                                                                                   |
| Sinne und Körper     | Auge 1F441, Ohr 1F442, Nase 1F443, Zunge 1F445, Hand 270B, Fuß 1F9B6, Zahn 1F9B7, Zahnbürste 1FAA5, Seife 1F9FC                                                                                                                                                         |
| Gefühle              | 1F600, 1F622, 1F621, 1F628, 1F632                                                                                                                                                                                                                                       |
| Wetter               | Sonne 2600, Wolke 2601, Regen 1F327, Gewitter 26C8, Schnee 2744, Wind 1F32C, Regenbogen 1F308, Thermometer 1F321                                                                                                                                                        |
| Stoffe und Müll      | Holz 1FAB5, Stein 1FAA8, Papier 1F4C4, Salz 1F9C2, Magnet 1F9F2, Recycling 267B, Mülleimer 1F5D1, Feuer 1F525, Feuerlöscher 1F9EF                                                                                                                                       |
| Verkehr              | Ampel 1F6A6, Kinder-Warnschild 1F6B8, Stoppschild 1F6D1, Warnweste 1F9BA, Bus 1F68C, Fahrrad 1F6B2, Roller 1F6F4, Zug 1F686, Traktor 1F69C                                                                                                                              |
| Berufe und Werkzeuge | Landwirt 1F9D1-200D-1F33E, Feuerwehr 1F9D1-200D-1F692, Polizei 1F46E, Ärztin 1F9D1-200D-2695-FE0F, Lehrkraft 1F9D1-200D-1F3EB, Koch 1F9D1-200D-1F373, Mechaniker 1F9D1-200D-1F527; Schere 2702, Hammer 1F528, Säge 1FA9A, Schraubenschlüssel 1F527, Schraubzwinge 1F5DC |
| Zeit und Bauwerke    | Kalender 1F4C5, Geburtstagskuchen 1F382, Weihnachtsbaum 1F384, Burg 1F3F0, Kirche 26EA, Schule 1F3EB, Haus 1F3E0                                                                                                                                                        |

**Es fehlen:** Zebrastreifen und Fußgängerampel mit Männchen, deutsche Verkehrszeichen (Fußgängerüberweg, Gehweg, verkehrsberuhigter Bereich), Löwenzahn, Gänseblümchen, Hummel, Maulwurf, Mülltonnen in den deutschen Farben, Grundrisse und Türme. Diese Motive zeichnen wir selbst als einfache SVGs im Stil von OpenMoji (MIT-Lizenz wie der übrige Code) oder lassen sie weg. Verkehrszeichen gelten als amtliche Werke (§ 5 UrhG); auch sie werden aber neu gezeichnet, damit alles im Build liegt.

## 7. Technische Umsetzung

| Baustein            | Änderung                                                                                                                                                                                                                                                                        | Aufwand |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Bereich             | `Topic` um `'sache'` erweitern; Name aus der Länderanpassung (Bayern: „HSU“, sonst „Sachunterricht“), Symbol 🔍                                                                                                                                                                 | S       |
| Startseite          | HSU-Kachel nur, wenn mindestens ein Thema freigeschaltet ist; Kacheln nur für Bereiche der eigenen Klasse (README, Abschnitt 3)                                                                                                                                                 | S       |
| Themenwahl          | Die Themen sind die Kategorien des Fachs (README, Abschnitt 4): Nach dem Tipp auf HSU wählt das Kind ein Thema (Bildkachel, Name wird vorgelesen); die Einheit mischt nur die Aufgaben dieses Themas. Kein „Alles gemischt“; „Stolpersteine“ gibt es wie in den anderen Fächern | M       |
| Module              | `sache.hoeren-bild`, `sache.paare`, `sache.sortieren`, `sache.reihenfolge`, `sache.stimmt-das` (Abschnitt 5)                                                                                                                                                                    | M       |
| Daten               | `basis/klasse-1/sache.json`, Typen, Laden in `content.ts`, Länderanpassung (Feste, Namen)                                                                                                                                                                                       | M       |
| Elternbereich       | „HSU“: Themen-Raster zum Freischalten, Mülltonnen zu Hause, Forscheraufträge zum Vorlesen                                                                                                                                                                                       | S–M     |
| Prüfungen und Tests | `data:check`-Regeln (Abschnitt 6), Unit-Tests der Generatoren (keine Dopplungen, eindeutige Lösung), E2E: eine HSU-Einheit                                                                                                                                                      | S–M     |

Session-Engine, Leitner, Sterne, Kronen und Statistik bleiben unverändert; die Statistik zeigt HSU als eigenes Fach.

## 8. Umsetzung in drei Stufen

| Stufe | Inhalt                                                                                                                                                                                                                           | Fertig, wenn …                                                                                    | Umfang |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| **1** | Bereich, Themenwahl, Elternraster; Module `hoeren-bild`, `paare`, `sortieren`, `reihenfolge`; neun Themen nur mit OpenMoji: Obst und Gemüse, Sinne, Zeit, Feste, Wetter, Wiese, Haus- und Nutztiere, Hecke, Berufe und Werkzeuge | … jedes Thema eine spielbare Einheit hat, `data:check` grün ist und alle Begriffe angehört wurden | M–L    |
| **2** | Modul `stimmt-das`; Themen Sicher zu Fuß und Gut sichtbar (mit eigenen Verkehrszeichen-SVGs), Müll trennen (mit Elterneinstellung), Gesund essen und Zähne, Gefühle, Gibt es das wirklich?, Früher und heute                     | … die Verkehrsinhalte gegen die Quellen geprüft sind                                              | M      |
| **3** | Suchbilder (sicherer Übergang, Gefahren im Haushalt), Draufsicht und einfache Pläne, Turm-Standfestigkeit, Jahreskreis als eigene Komponente                                                                                     | … die Grafiken auf dem Handy gut erkennbar sind                                                   | L      |

**Zeitlich:** Stufe 1 lässt sich noch im laufenden Schuljahr nutzen; die Themen ab Frühling (Wiese, Tiere, Hecke, Berufe) liegen dann genau im Zeitraum der Schule. Das Verkehrsthema gehört an den Schuljahresanfang und kommt deshalb mit Stufe 2 rechtzeitig vor September 2027. Ab Klasse 2 läuft der Bereich weiter ([klasse-2.md](klasse-2.md), Abschnitt 10).

**Testrunde mit dem Kind** nach Stufe 1, wie in PLAN.md (Abschnitt 12): Erkennt es die Bilder? Versteht es die Merksätze? Sind die Einheiten zu lang?

## 9. Risiken

| Risiko                                                          | Gegenmaßnahme                                                                                                                                                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fachlich falsche Inhalte                                        | Pflichtfeld `quelle` pro Thema, nur eindeutige Fakten, Durchsicht durch die Eltern vor dem Freischalten                                                                                                            |
| Verkehrsregeln vereinfacht und dadurch falsch („Grün = sicher“) | Regeln vollständig formulieren („Bei Grün darf ich gehen. Ich schaue trotzdem nach links und rechts.“), nach StVO und Unterlagen der Verkehrserziehung prüfen; Hinweis, dass die App kein Schulwegtraining ersetzt |
| Regionale Unterschiede (Mülltrennung, Feste, Dialektwörter)     | Elterneinstellung für Mülltonnen; Länderanpassung für Feste; Standardsprache in den Merksätzen                                                                                                                     |
| Sensible Themen (Familie, Gefühle, Körper)                      | nur Erkennen und Benennen; nichts über das Kind abfragen oder speichern                                                                                                                                            |
| Mehrdeutige Bilder                                              | nur eindeutige Motive, ähnliche Motive nie als Ablenker zusammen; Testrunde                                                                                                                                        |
| Sprachausgabe spricht Fachbegriffe falsch                       | Sprachtest-Gruppe „HSU“, `say`-Overrides wie im Wörterbuch                                                                                                                                                         |
| Zu viel auf einmal                                              | Themen nur nach Freischaltung, Themenwahl vor der Einheit                                                                                                                                                          |
| App verdrängt das Erleben draußen                               | Forscheraufträge für die Familie; Einheiten bleiben kurz (5 Minuten)                                                                                                                                               |

---

## Anhang: Kompetenzerwartungen HSU 1/2 einzeln

✅ = die App übt einen wesentlichen Teil · ◐ = die App übt einen kleinen Teil (meist Begriffe oder Regeln) · – = nicht in der App

| Teilbereich | Kompetenzerwartung (gekürzt)                                             | App | So                                                                  |
| ----------- | ------------------------------------------------------------------------ | --- | ------------------------------------------------------------------- |
| 1.1         | wenden Kompromisse zum Lösen von Konflikten an                           | –   |                                                                     |
| 1.1         | versetzen sich in fremde Rollen und Positionen                           | –   |                                                                     |
| 1.1         | beschreiben die Bedeutung von Aufgaben und Regeln, gestalten sie mit     | –   |                                                                     |
| 1.1         | benennen eigene Interessen und Bedürfnisse und die anderer               | –   |                                                                     |
| 1.1         | beschreiben die Bedeutung von Bezugspersonen, Achtung vor Familienformen | –   |                                                                     |
| 1.2         | unterscheiden Medien und beschreiben die eigene Nutzung                  | ◐   | Medien benennen und unterscheiden                                   |
| 1.2         | unterscheiden zwischen Bedürfnissen und Wünschen                         | ✅  | `sache.sortieren`                                                   |
| 1.2         | beschreiben das Prinzip des Kaufvorgangs, verfügbare Mittel              | ◐   | ab Klasse 2 mit Geld (Messen 📏)                                    |
| 2.1         | beschreiben eine positive Beziehung zum eigenen Körper                   | –   |                                                                     |
| 2.1         | beschreiben die Bedeutung der Sinne, auch bei Behinderung                | ✅  | `sache.paare` Sinnesorgan – Sinn                                    |
| 2.1         | begründen Schutz und Pflege des Körpers                                  | ◐   | `sache.reihenfolge` Händewaschen, Zähneputzen                       |
| 2.1         | bewerten Nahrungsmittel, stellen ihr Pausenbrot zusammen                 | ✅  | `sache.sortieren` oft – manchmal – selten                           |
| 2.1         | beurteilen ihre eigenen Ernährungsgewohnheiten                           | –   | persönlich                                                          |
| 2.2         | drücken eigene Gefühle aus und gestehen sie anderen zu                   | ◐   | Gefühle an Gesichtern erkennen                                      |
| 2.2         | wenden Strategien gegen negative Gefühle an                              | –   |                                                                     |
| 2.2         | erklären den Zusammenhang von Ernährung, Bewegung, Wohlbefinden          | ◐   | Merksätze                                                           |
| 2.2         | reflektieren ihr Freizeitverhalten                                       | –   |                                                                     |
| 3.1         | bestimmen heimische Tier- und Pflanzenarten mit Bestimmungshilfen        | ✅  | `sache.hoeren-bild`, `sache.sortieren` (Merkmale)                   |
| 3.1         | beobachten Ausbreitung von Pflanzen, Bau und Funktion                    | ◐   | Zuordnen (Pusteblume fliegt), Forscherauftrag                       |
| 3.1         | beschreiben Angepasstheit an den Lebensraum                              | ◐   | Merksätze, Sortieren nach Lebensraum                                |
| 3.1         | beschreiben einfache Nahrungsbeziehungen                                 | ✅  | `sache.reihenfolge`                                                 |
| 3.1         | beobachten jahreszeitliche Veränderungen                                 | ◐   | Baum im Jahreslauf ordnen                                           |
| 3.1         | ordnen Obst und Gemüse der Reifezeit zu                                  | ✅  | `sache.sortieren` nach Jahreszeit                                   |
| 3.1         | beschreiben die Bedeutung von Nutztieren und Nutzpflanzen                | ✅  | `sache.paare` Tier – Produkt                                        |
| 3.1         | gehen mit Haustieren verantwortungsvoll um                               | ◐   | „Was braucht der Hamster?“                                          |
| 3.1         | zeigen Sicherheitsbewusstsein bei giftigen Pflanzen                      | ◐   | nur die Verhaltensregel, keine Pflanzenbilder                       |
| 3.2         | untersuchen und dokumentieren Eigenschaften von Stoffen                  | ◐   | Stoffe benennen, „schwimmt oder sinkt?“                             |
| 3.2         | sortieren Abfälle, vermeiden Müll                                        | ✅  | `sache.sortieren` mit den Tonnen von zu Hause                       |
| 3.2         | zeigen Gefahren im Umgang mit Feuer auf, Brandschutz                     | ◐   | `sache.stimmt-das`, Notruf 112                                      |
| 3.3         | wenden am Beispiel der Luft naturwissenschaftliche Arbeitsweisen an      | –   | Experiment                                                          |
| 3.3         | erklären die Bedeutung der Luft                                          | ◐   | „Was macht die Luft schmutzig?“                                     |
| 3.3         | untersuchen Wettererscheinungen mit Messgeräten                          | ◐   | Wettersymbole, warm/kalt                                            |
| 3.3         | nutzen Wissen über Wetter, um sich angemessen zu verhalten (Gewitter)    | ✅  | `sache.stimmt-das`, Kleidung zum Wetter                             |
| 4.1         | verwenden Begriffe zur zeitlichen Einteilung                             | ✅  | Tageszeiten, Wochentage, Monate                                     |
| 4.1         | bringen Zeitspannen mit Beobachtungen in Bezug, natürliche Rhythmen      | ◐   | Tag und Nacht, Jahreszeiten ordnen                                  |
| 4.1         | ordnen Feste ihrem Datum oder ihrer Lage im Jahreslauf zu                | ✅  | `sache.sortieren` nach Jahreszeit oder Monat                        |
| 4.2         | berichten über eine Zeitspanne im eigenen Leben, Zeitleiste              | –   | persönlich                                                          |
| 4.2         | erklären die Bedeutung von Quellen                                       | –   |                                                                     |
| 4.2         | beschreiben Veränderungen und Kontinuitäten der Lebenswelt               | ◐   | früher und heute                                                    |
| 4.3         | unterscheiden historische Begebenheiten und erfundene Geschichten        | ◐   | „Gibt es das wirklich?“                                             |
| 4.3         | hinterfragen den geschichtlichen Gehalt von Erzählungen, Sagen, Filmen   | –   |                                                                     |
| 5.1         | beschreiben, was ihnen in Räumen auffällt                                | –   |                                                                     |
| 5.1         | vergleichen räumliche Situationen (nah/fern, ländlich/städtisch)         | ◐   | Stadt oder Land?                                                    |
| 5.1         | nutzen Strategien zur Orientierung in vertrauter Umgebung                | –   | vor Ort                                                             |
| 5.1         | lesen einfache Pläne, nutzen Raum-Lage-Begriffe                          | ◐   | Lagebegriffe, ab Stufe 3 Draufsicht                                 |
| 5.1         | fertigen einfache Pläne und Modelle an                                   | –   |                                                                     |
| 5.2         | beschreiben Nutzung, Veränderung, Gefährdung eines vertrauten Raums      | –   | vor Ort                                                             |
| 5.2         | beachten Grundsätze des achtsamen Umgangs mit Räumen                     | ◐   | „Was gehört nicht hierher?“                                         |
| 5.3         | beschreiben Formen der Mobilität im vertrauten Raum                      | ◐   | Verkehrsmittel benennen und sortieren                               |
| 5.3         | nutzen Wege sicherheitsbewusst, benennen sichere und unsichere Stellen   | ◐   | an Bildern, ab Stufe 3 Suchbild                                     |
| 5.3         | berücksichtigen Verkehrsregeln, Verkehrszeichen, Sicherheitsvorkehrungen | ✅  | `sache.stimmt-das`, `sache.hoeren-bild`, „Wer ist besser zu sehen?“ |
| 5.3         | reagieren bei Übungen im Schonraum rasch und angemessen                  | –   | Training                                                            |
| 6.1         | wenden einfache Werkzeuge sach- und sicherheitsgemäß an                  | –   | Handeln                                                             |
| 6.1         | erklären die Funktion ausgewählter Werkzeuge                             | ✅  | `sache.paare` Werkzeug – Tätigkeit                                  |
| 6.1         | beschreiben Berufe und ordnen sie Arbeitsfeldern zu                      | ✅  | `sache.paare`; Arbeitsfelder ab Klasse 2                            |
| 6.2         | überprüfen die Standfestigkeit selbst gebauter Modelle                   | ◐   | ab Stufe 3 „Welcher Turm steht sicherer?“                           |
| 6.2         | beschreiben das Bewegungsverhalten rollender Objekte                     | ◐   | „Was rollt?“                                                        |
| 6.2         | nutzen einfache Anleitungen und Modellzeichnungen                        | –   | Handeln                                                             |
| 6.2         | beschreiben kulturell bedeutsame Bauten der Region                       | ◐   | Bauwerke erkennen; Regionales nicht                                 |

**Summe:** 14 × ✅, 25 × ◐, 20 × – (59 Kompetenzerwartungen).

## Quellen

- [LehrplanPLUS Grundschule, Fachlehrplan Heimat- und Sachunterricht 1/2](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/hsu) (abgerufen am 27.11.2026)
- [LehrplanPLUS Grundschule, Fachprofil Heimat- und Sachunterricht](https://www.lehrplanplus.bayern.de/fachprofil/grundschule/hsu) (abgerufen am 27.11.2026)
- [LehrplanPLUS Grundschule, Fachlehrplan Mathematik 1/2](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik) (Lagebegriffe, Zeit, Kalender, Geld als Anknüpfungspunkte)
- Bayerisches Staatsministerium für Unterricht und Kultus, [Grundschule: Unterricht und Fächer](https://www.km.bayern.de/lernen/schularten/grundschule/unterricht-und-faecher) (Grundlegender Unterricht)
- OpenMoji 17 (`node_modules/openmoji`, CC BY-SA 4.0): Abdeckung der Motive am 27.11.2026 im Projekt geprüft
