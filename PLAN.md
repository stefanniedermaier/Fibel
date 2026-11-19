# Fibel – Umsetzungsplan

> Eine Lern-PWA für eine Erstklässlerin (6 Jahre) mit den Bereichen Lesen, Schreiben und Rechnen in kurzen Einheiten von etwa 5 Minuten.
> Sie läuft komplett offline auf dem Gerät: kein Server, kein Konto, alle Daten bleiben lokal.

Stand: 19.11.2026

---

## 1. Entscheidungen aus dem Wizard

| Thema | Entscheidung | Folge für die Umsetzung |
|---|---|---|
| Zielgerät | Android-Tablet/-Handy (Chrome) | Sprachausgabe über Google-TTS mit offline geladener deutscher Stimme; Installation über Chrome; Tests auf dem echten Gerät |
| Stack | Vite + Vue 3 + TypeScript | Pinia für den State, Vue Router im Hash-Modus, vite-plugin-pwa |
| Hosting | GitHub Pages | Deployment per GitHub Action; das Repo ist öffentlich, deshalb stehen keine Daten des Kindes im Code |
| Profile | mehrere | Profilauswahl beim Start; Fortschritt und Einstellungen pro Kind |
| Klassenstufen | 1–4 vorgesehen, Inhalte in Version 1 nur für Klasse 1 | Jedes Profil hat eine Klassenstufe; die Übungen sind in einem Katalog nach Klasse und Fach gruppiert (Abschnitt 4) |
| Andere Klassen | eigene Klasse und alle darunter | Die Klassen darunter dienen zum Wiederholen; höhere Klassen schaltet nur der Elternbereich frei |
| Klassenwechsel | nur manuell | Kein automatischer Wechsel zum Schuljahr; die Klasse wird im Elternbereich umgestellt |
| Klasse und Einstellungen | Klasse setzt Startwerte | Jede Klasse bringt Voreinstellungen mit (Buchstaben-Filter, Zahlenraum, Silbenfärbung …), die sich weiter fein anpassen lassen |
| Bundesland | pro Profil, Standard Bayern | Bundesland und Klasse bestimmen zusammen Übungskatalog, Startwerte, Wortlisten und Schrift (Abschnitt 4) |
| Länder in Version 1 | nur Bayern wählbar | Die anderen 15 Länder erscheinen ausgegraut („kommt später“) |
| Silbenfärbung | umschaltbar | Standard: an (blau/rot); Silbenbögen optional; beides im Elternbereich abschaltbar |
| Wortauswahl | nach gelernten Buchstaben | Eltern haken die Buchstaben ab, die App filtert das Wörterbuch danach |
| Schreiben | alle vier Formen | Silben legen, Buchstaben legen, ABC-Tastatur, Nachspuren |
| Einzellaute | TTS spricht nur Silben und Wörter | Anlaut-Übungen laufen über Bild + gesprochenes Wort, isolierte Laute gibt es nicht |
| Rechnen | Mengen bis 10, Zahlzerlegung, Plus/Minus bis 10, Zahlenraum bis 20 | Der Zahlenraum 20 wird im Elternbereich freigeschaltet |
| Belohnung | Sterne und Kronen sammeln und anzeigen | Trophäen-Ansicht, kein Shop und nichts zum Freischalten |
| Bilder | OpenMoji (CC BY-SA 4.0) | Nur die benötigten SVGs kommen ins Build; Namensnennung im Info-Screen |
| Einheit | feste Aufgabenzahl | 8 Aufgaben (einstellbar 6–10), kein Timer, Krone am Ende |

## 2. Leitplanken

- **Offline und privat:** Die App macht keine externen Requests. Schrift, Bilder und Daten liegen alle im Build. Eine Content-Security-Policy per `<meta>`-Tag (`default-src 'self'`) setzt das technisch durch. Kein Tracking, keine Werbung, keine Links nach außen.
- **Kindgerecht:** Jede Anweisung wird vorgelesen, und es gibt kaum Text. Touch-Ziele sind mindestens 64 px groß. Es gibt keinen Zeitdruck, und Fehler werden nicht bestraft.
- **Kurz:** Eine Einheit dauert etwa 5 Minuten und lässt sich jederzeit abbrechen. Der Fortschritt wird nach jeder Aufgabe gespeichert.
- **Erweiterbar:** Übungstypen sind eigene Module, die sich über Parameter in mehreren Klassenstufen wiederverwenden lassen. Inhalte liegen als JSON-Dateien pro Klasse und, wo nötig, pro Bundesland vor und werden automatisch geprüft. Die Klassen 2–4 und weitere Bundesländer lassen sich später ergänzen, ohne die Struktur umzubauen.

## 3. Architektur

### Technik

- **Vite**, **Vue 3** (`<script setup>`), **TypeScript** im strict-Modus
- **Pinia** für den State, **Vue Router** mit `createWebHashHistory`, damit Deep-Links auf GitHub Pages keine 404 liefern
- **vite-plugin-pwa** (Workbox) legt das gesamte Build in den Precache. Mit `registerType: 'prompt'` erscheint der Update-Hinweis nur im Elternbereich und nicht mitten in einer Übung.
- **IndexedDB** über die kleine Bibliothek `idb`
- Schrift **Andika** (SIL OFL), die für Leseanfänger gestaltet ist: einstöckiges a, gut unterscheidbares I/l. Sie wird über `@fontsource/andika` selbst gehostet.
- **Tests:** Vitest, @vue/test-utils, fake-indexeddb; **Code-Qualität:** ESLint und Prettier

### Kernmodule (`src/core`)

| Modul | Aufgabe |
|---|---|
| `tts.ts` | Web Speech API: wählt eine deutsche Stimme (bevorzugt `localService`, also offline), steuert Tempo und Tonhöhe und hält eine Warteschlange (`cancel()` vor jedem neuen Satz). Wendet `say`-Overrides aus dem Wörterbuch an und spricht Zahlen als Wörter. |
| `sounds.ts` | Erfolgs- und Fehlertöne, per Web Audio synthetisiert, ohne Audiodateien |
| `graphemes.ts` | Zerlegt Wörter in Grapheme; `sch`, `ch`, `ei`, `au`, `eu` und `äu` zählen jeweils als eine Einheit |
| `leitner.ts` | Lernstand pro Item (Box 1–5) und Auswahl der nächsten Items |
| `session.ts` | Generischer Ablauf einer Einheit: Aufgaben erzeugen, Antworten auswerten, Sterne und Krone vergeben, speichern |
| `content.ts` | Stellt die Inhalte für ein Profil zusammen: Basis plus Anpassung des Bundeslands, gefiltert nach Klasse (Katalog, Startwerte, Wortlisten, Schrift) |
| `storage/` | IndexedDB-Schema, Migrationen, Repositories, Export/Import |

### Übungsmodule und Katalog

Ein Übungsmodul ist ein Übungs*typ* wie „Wort → Bild“, bestehend aus Generator und Vue-Komponente, und meldet sich in einer Registry an. Die Klassenstufe kennt es nicht: Inhalte und Schwierigkeit bekommt es über Parameter.

```ts
interface ExerciseModule<P, T> {
  id: string;                                            // z. B. 'lesen.wort-bild'
  topic: 'lesen' | 'schreiben' | 'rechnen';
  isAvailable(ctx: LearnerContext, params: P): boolean;  // z. B.: genug Wörter mit freigeschalteten Buchstaben?
  generate(ctx: LearnerContext, params: P): Task<T>;     // wählt Items über Leitner aus
  component: Component;                                  // zeigt die Aufgabe und meldet 'answer'
}
```

Welche Übungen es in welcher Klasse gibt, legt der Übungskatalog fest. Ausgangspunkt ist ein länderneutraler Basis-Katalog (`src/data/basis/catalog.json`), den jedes Bundesland anpassen kann (siehe Abschnitt 4):

```ts
interface CatalogEntry {
  id: string;                 // z. B. 'k1.rechnen.plus-minus-10'
  grade: number;              // 1–4; die Länderliste legt die gültigen Klassen fest
  topic: 'lesen' | 'schreiben' | 'rechnen';
  exercise: string;           // Modul-ID, z. B. 'rechnen.plus-minus'
  params: object;             // z. B. { max: 10, ops: ['+', '-'] } oder { words: 'klasse-1' }
  title: string;              // Anzeigename im Elternbereich
}
```

Die Session-Engine mischt für jede Einheit die verfügbaren Katalog-Einträge eines Fachs und einer Klasse, und zwar aus dem Katalog, den `content.ts` für das Profil zusammengestellt hat (Basis + Bundesland). Eine neue Übung bedeutet ein neues Modul plus Katalog-Einträge; an der Engine ändert sich nichts. Ein Modul kann in mehreren Klassen vorkommen, zum Beispiel „Plus/Minus“ mit Zahlenraum 10 in Klasse 1 und mit Zahlenraum 100 in Klasse 2.

### Projektstruktur

```
fibel/
├─ .github/workflows/deploy.yml   # data:check, Tests, Build, Deploy auf GitHub Pages
├─ public/
│  ├─ img/                        # generiert: benötigte OpenMoji-SVGs
│  └─ icons/                      # App-Icons (maskable)
├─ scripts/
│  ├─ check-data.ts               # prüft die Wörterbücher
│  └─ sync-openmoji.ts            # kopiert die verwendeten Bilder
├─ src/
│  ├─ data/
│  │  ├─ common/                  # letters, phrases (länderneutral)
│  │  ├─ basis/                   # länderneutraler Grundstock
│  │  │  ├─ catalog.json          # Übungskatalog: Klasse → Fach → Übungen
│  │  │  ├─ grade-defaults.json   # Startwerte der Einstellungen pro Klasse
│  │  │  └─ klasse-1/             # words, syllables (später klasse-2 … klasse-4)
│  │  ├─ laender/
│  │  │  ├─ index.json            # alle 16 Länder: Code, Name, aktiv ja/nein, gültige Klassen
│  │  │  └─ DE-BY/                # Bayern: overlay.json, eigene Wortlisten
│  │  └─ schriften/               # Strichvorlagen je Schrift, z. B. druckschrift/strokes.json
│  ├─ core/                       # tts, sounds, graphemes, leitner, session, storage/
│  ├─ exercises/
│  │  ├─ registry.ts
│  │  ├─ lesen/
│  │  ├─ schreiben/
│  │  └─ rechnen/
│  ├─ components/                 # BigButton, SpeakerButton, SyllableWord, TileBoard,
│  │                              # TenFrame, NumberHouse, NumberPad, StarBurst, Crown …
│  ├─ views/                      # ProfileSelect, Home, Session, SessionEnd, Trophies,
│  │                              # parent/*, dev/* (nur im Dev-Build)
│  ├─ stores/                     # Pinia: profile, settings, session
│  ├─ router.ts
│  └─ main.ts
├─ tests/
├─ PLAN.md
└─ vite.config.ts                 # base: '/<repo-name>/' für GitHub Pages
```

## 4. Klassenstufen, Bundesländer und Übungskatalog

### Aufbau

Welche Übungen ein Kind bekommt, hängt von Bundesland und Klasse seines Profils ab. Gegliedert sind die Übungen in drei Ebenen: **Klasse → Fach → Übung**. Innerhalb einer Übung steigt die Schwierigkeit über Level (Abschnitte 5 und 7).

- Jedes Profil hat ein Bundesland (Standard: Bayern) und eine Klassenstufe von 1 bis 4. Beides wird beim Anlegen gewählt.
- Version 1 enthält nur Inhalte für Klasse 1. Für die Klassen 2–4 sind Struktur, Datenordner und Startwerte schon angelegt; die Inhalte kommen später.
- Die Klasse wechselt nur, wenn sie im Elternbereich umgestellt wird. Der Fortschritt bleibt dabei erhalten.

### Welche Klassen ein Kind sieht

| Bereich | Inhalt |
|---|---|
| Startseite | Lesen, Schreiben und Rechnen der eigenen Klasse |
| „Wiederholen“ 🔁 | die Übungen aller niedrigeren Klassen, nach Klasse gruppiert; erscheint erst ab Klasse 2 |
| Höhere Klassen | nur sichtbar, wenn der Elternbereich sie für dieses Profil freischaltet |

### Startwerte pro Klasse (`basis/grade-defaults.json`)

Wenn ein Profil angelegt wird, übernimmt es die Startwerte seiner Klasse; das Bundesland kann einzelne davon ändern. Wechseln Klasse oder Bundesland, fragt die App, ob sie die neuen Startwerte übernehmen soll, damit eigene Anpassungen nicht unbemerkt verloren gehen. Danach lässt sich jede Einstellung im Elternbereich fein anpassen.

| Einstellung | Klasse 1 | Klasse 2 | Klasse 3 | Klasse 4 |
|---|---|---|---|---|
| Buchstaben-Filter | an, Start mit A, E, I, O, U, M, L | aus | aus | aus |
| Silbenfärbung | an | an | aus | aus |
| Groß-/Kleinschreibung werten | aus | an | an | an |
| Zahlenraum | 10 (20 freischaltbar) | 100 | 1000 | 1 000 000 |
| Aufgaben pro Einheit | 8 | 8 | 10 | 10 |

Die Werte für die Klassen 2–4 sind nur ein Vorschlag. Festgelegt werden sie, wenn die Inhalte dieser Klassen entstehen.

### Katalog-Skizze

| Klasse | Lesen | Schreiben | Rechnen |
|---|---|---|---|
| **1** (Version 1) | Silben, lauttreue Wörter, Anlaute, Silben klatschen | Silben und Buchstaben legen, ABC-Tastatur, Nachspuren | Mengen bis 10, Vergleichen, Zahlenhaus, Plus/Minus bis 10 und 20 |
| 2 (später) | Sätze lesen, Satz und Bild zuordnen | Wörter mit Besonderheiten (ie, Doppelkonsonanten, ck/tz, Dehnungs-h, Auslautverhärtung), Großschreibung von Nomen | Zahlenraum 100, Zehner und Einer, Einmaleins, Uhrzeit, Geld |
| 3 (später) | kurze Texte mit Fragen zum Inhalt | Wortfamilien, Ableiten (ä/äu), Wortarten | Zahlenraum 1000, halbschriftliches Rechnen, Größen |
| 4 (später) | längere Texte, Informationen entnehmen | Satzzeichen, wörtliche Rede, das/dass | Zahlenraum 1 Million, schriftliche Rechenverfahren |

Die Skizze beschreibt den länderneutralen Basis-Katalog und ist für die Klassen 2–4 bewusst grob. Was ein Land anders macht, steht in seiner Länderanpassung (siehe unten).

### Bundesländer

Jedes Profil hat ein Bundesland, vorbelegt ist Bayern. In Version 1 lässt sich nur Bayern auswählen. Die anderen 15 Länder stehen ausgegraut in der Liste („kommt später“) und werden aktiviert, sobald es für sie eine Anpassung gibt.

Ein Bundesland kann vier Bereiche anpassen:

| Bereich | Was das Land ändern kann | Beispiel |
|---|---|---|
| Übungskatalog | Einträge hinzufügen, entfernen, in eine andere Klasse verschieben, Parameter ändern | Verfahren der schriftlichen Subtraktion (Abziehen oder Ergänzen) |
| Startwerte | einzelne Werte pro Klasse überschreiben | Zahlenraum zu Beginn einer Klasse |
| Wortlisten | Wörter ergänzen oder herausnehmen | ein vorgegebener Grundwortschatz |
| Schrift | festlegen, welche Schrift die Nachspur-Vorlagen in welcher Klasse nutzen | Druckschrift in Klasse 1, später die Schreibschrift des Landes (Grundschrift, Schulausgangsschrift, Lateinische oder Vereinfachte Ausgangsschrift) |

**Basis plus Länderanpassung:** `basis/` enthält alles, was überall gleich ist. Jedes Land beschreibt in `laender/<Code>/overlay.json` nur seine Abweichungen. Die Codes folgen ISO 3166-2, Bayern ist zum Beispiel `DE-BY`.

```json
{
  "land": "DE-BY",
  "gradeDefaults": { "1": { "numberRange": 10 } },
  "catalog": {
    "add":    [],
    "remove": ["k1.lesen.silben-klatschen"],
    "patch":  { "k1.rechnen.plus-minus-20": { "grade": 1, "params": { "max": 20 } } }
  },
  "words":  { "klasse-1": { "add": "klasse-1/words.json", "remove": ["mofa"] } },
  "script": { "1": "druckschrift" }
}
```

Das Beispiel zeigt nur, wie der Mechanismus funktioniert. Es sind nicht die echten Inhalte für Bayern.

- `core/content.ts` setzt Basis und Länderanpassung zur Laufzeit zusammen. Es ist eine reine Funktion und hat Unit-Tests.
- `data:check` prüft jede Länderanpassung: Alle Verweise auf Einträge und Wörter müssen existieren, die Parameter müssen gültig sein, und der zusammengesetzte Inhalt jedes aktiven Landes muss alle Regeln erfüllen.
- Für die Wortlisten der Länder gelten dieselben Regeln wie für die Basis, in Klasse 1 also strenge Lauttreue. Wörter eines Grundwortschatzes mit Besonderheiten gehören deshalb in die Listen ab Klasse 2.
- **Bayern in Version 1:** Abgeglichen mit dem LehrplanPLUS Grundschule (Deutsch 1/2, Abschnitt 4.4 „Richtig schreiben“) und dem ISB-Grundwortschatz für die Jahrgangsstufen 1 und 2. Ergebnis:
  - **Wortliste:** Die lauttreuen Wörter des Grundwortschatzes stehen größtenteils schon in der Basis, z. B. Oma, Hase, Tomate, Esel und Gabel. `laender/DE-BY/klasse-1/words.json` ergänzt Blüte, Buch, Raupe, Schere, Nadel, Nebel und Euro. Das Feld `grundwortschatz` in `overlay.json` markiert alle Wörter, die auf der offiziellen Liste stehen.
  - **Wörter mit Besonderheiten:** Wörter mit ie, Doppelkonsonanten, Auslautverhärtung, Dehnungs-h, ck/tz, v/x/y usw. ordnet der Grundwortschatz eigenen Übungsschwerpunkten zu. Sie kommen in Klasse 2, das passt zu unserer Lauttreue-Regel.
  - **Schrift:** Klasse 1 schreibt in Druckschrift. Für die verbundene Schrift nennt der Lehrplan die Vereinfachte Ausgangsschrift oder die Schulausgangsschrift; welche, entscheidet die Schule. Sobald Klasse 2 dazukommt, braucht es dafür also eine Einstellung pro Profil.
  - **Rechnen:** Für Klasse 1 gibt es keine Abweichung vom Basis-Katalog.
- In Berlin und Brandenburg dauert die Grundschule sechs Jahre. Die gültigen Klassen sind deshalb nicht fest im Code verdrahtet, sondern stehen pro Land in `laender/index.json`.

## 5. Wörterbücher (`src/data`)

### Dateien

| Datei | Inhalt |
|---|---|
| `common/letters.json` | Grapheme in typischer Schulreihenfolge mit Typ (Vokal, Konsonant, Mehrgraph), Groß- und Kleinform und Anlautbild |
| `common/phrases.json` | Anweisungen und wechselnde Lobsätze („Super!“, „Toll gelesen!“) für die Sprachausgabe |
| `schriften/druckschrift/strokes.json` | Strichvorlagen fürs Nachspuren (Phase 6); jede weitere Schrift bekommt einen eigenen Ordner |
| `basis/klasse-1/words.json` | Wörter mit Silben, Kategorie, Bild und Ablenker-Gruppe |
| `basis/klasse-1/syllables.json` | Silben, vor allem Konsonant + Vokal (ma, lo, ri …), mit optionaler TTS-Korrektur |
| `laender/DE-BY/…` | Anpassung und zusätzliche Wortlisten für Bayern (Abschnitt 4) |

Jede Klasse bekommt einen eigenen Ordner, und das Prüfskript wendet pro Klasse eigene Regeln an. In Klasse 1 gilt strenge Lauttreue. Ab Klasse 2 muss jedes Wort seine Besonderheit angeben, zum Beispiel `"phenomena": ["ie"]`. Diese Regeln gelten auch für die Wortlisten der Länder.

### Format (Beispiel `basis/klasse-1/words.json`)

```json
{
  "id": "rose",
  "text": "Rose",
  "syllables": ["Ro", "se"],
  "image": "1F339",
  "category": "pflanzen",
  "similar": ["dose", "hose", "nase"]
}
```

- `graphemes` und `level` werden automatisch abgeleitet und nicht von Hand gepflegt: die Grapheme über `graphemes.ts`, das Level aus der Silbenstruktur.
- `similar` liefert gezielte Ablenker (Rose/Dose/Hose). So muss das Kind genau erlesen und kann nicht raten.
- Das optionale Feld `say` legt eine abweichende Aussprache für die TTS fest.
- Nomen werden groß, alle anderen Wörter klein geschrieben.

### Lauttreue-Regeln für Klasse 1 (vom Prüfskript erzwungen)

Zugelassen sind nur Wörter, in denen jeder Laut genau einem Buchstaben bzw. Graphem entspricht. Ausgeschlossen sind:

- Dehnungs-h und Doppelvokale (Kuh, Boot) sowie `ie`
- Doppelkonsonanten, `ck`, `tz` (Sonne, Ball, Hecke)
- Auslautverhärtung (Hund, Rad, Berg)
- `v`, `x`, `y`, `ß`, `qu` und `c` außerhalb von `ch`/`sch`
- `st`/`sp` am Wortanfang (Stern, Spiel)
- vokalisiertes r und `-er`-Endungen (Tiger, Wurm)
- `ng`, `nk`, `chs`
- Mehrgraphe (`sch`, `ei`, `au`, `eu`, `ch`) und Umlaute kommen erst in Level 4 und nur, wenn sie freigeschaltet sind.

### Wort-Level in Klasse 1

| Level | Struktur | Beispiele |
|---|---|---|
| 1 | zwei offene Silben (KV-KV) | Oma 👵, Opa 👴, Lama 🦙, Sofa 🛋️, Rose 🌹, Nase 👃, Hase 🐇, Dose 🥫, Hose 👖, Limo 🥤, Lupe 🔍, Dino 🦕, Mofa 🛵 |
| 2 | drei oder mehr offene Silben | Tomate 🍅, Banane 🍌, Melone 🍉, Rakete 🚀 |
| 3 | geschlossene Silben, einfache Konsonantenfolgen | Igel 🦔, Esel 🫏, Kamel 🐫, Ananas 🍍, Tulpe 🌷, Wal 🐋, Gabel 🍴 |
| 4 | Mehrgraphe und Umlaute (später) | Maus 🐭, Eis 🍦, Auto 🚗, Schaf 🐑, Fisch 🐟, Käse 🧀 |

**Umfang für Phase 2:** etwa 120 Wörter (Schwerpunkt Level 1–3) und etwa 80 Silben.

**Umgesetzt:** 100 Wörter in der Basis und 7 Ergänzungen für Bayern, zusammen 107 mit Bild:

| Level | Wörter |
|---|---|
| 1 | 22 |
| 2 | 7 |
| 3 | 48 |
| 4 | 30 |

Dazu kommen 80 Silben (16 Konsonanten × 5 Vokale) und 40 Buchstaben und Mehrgraphe in Schulreihenfolge. Level 2 ist bewusst klein, weil es nur wenige drei- oder mehrsilbige lauttreue Wörter gibt, zu denen ein passendes Bild existiert.

**Zusammenspiel mit der Buchstaben-Freischaltung:** Ein Wort kommt nur vor, wenn alle seine Grapheme freigeschaltet sind und sein Level erreicht ist. Gibt es für eine Übung zu wenige passende Wörter, weicht sie auf Silben aus. Der Elternbereich zeigt an, wie viele Wörter mit den gewählten Buchstaben möglich sind.

### Werkzeuge

- **`npm run data:check`** läuft in CI vor jedem Deploy. Es prüft das Schema, ob die Silben zusammen das Wort ergeben, die Lauttreue-Regeln, eindeutige IDs, ob jedes OpenMoji-Bild existiert und ob die `similar`-Verweise gültig sind. Außerdem prüft es die Anpassung jedes aktiven Bundeslands (Abschnitt 4).
- **`npm run data:openmoji`** kopiert nur die verwendeten SVGs aus dem npm-Paket `openmoji` nach `public/img/`.
- **Dev-Seite `#/dev/tts`** spricht alle Wörter und Silben nacheinander und lässt „klingt falsch“ markieren. Das ist nötig, weil die TTS kurze Silben gern als Abkürzung liest („Mo“ → „Montag“). Solche Fälle bekommen ein `say`-Override.

## 6. Übungen in Klasse 1

Alle folgenden Übungen sind Einträge im Basis-Katalog der Klasse 1; die Anpassung für Bayern kann sie noch verändern. Die Module dahinter sind so gebaut, dass höhere Klassen sie mit anderen Parametern wiederverwenden können.

In jeder Aufgabe wird die Anweisung automatisch vorgelesen, der 🔊-Button wiederholt sie.

### Lesen

| ID | Übung | Ablauf |
|---|---|---|
| L1 | Silben hören | Die TTS spricht eine Silbe, das Kind tippt sie unter drei Silben an. |
| L2 | Wort → Bild | Das Wort steht da (silbengefärbt), das Kind wählt aus 3–4 Bildern. Nach einem Fehler wird das Wort als Hilfe vorgelesen. |
| L3 | Bild → Wort | Zu einem Bild stehen drei ähnliche Wörter zur Wahl (Rose/Dose/Hose). |
| L4 | Anlaut | Bild und gesprochenes Wort: „Womit fängt *Hase* an?“ Drei Buchstaben stehen zur Wahl. |
| L5 | Silben klatschen | Das Kind hört ein Wort und wählt die Anzahl der Silben (1–4); klatschende Hände als Animation. |

### Schreiben

| ID | Übung | Ablauf |
|---|---|---|
| S1 | Silben legen | Wort hören + Bild; das Kind tippt die Silbenkacheln (inklusive 1–2 Ablenkern) in der richtigen Reihenfolge an. |
| S2 | Buchstaben legen | Wort hören + Bild; das Kind setzt Buchstabenkacheln in die Lücken. Leichte Variante: Es fehlt nur ein Buchstabe. |
| S3 | ABC-Tastatur | Eigene Bildschirmtastatur mit nur den freigeschalteten Buchstaben; das Wort wird frei geschrieben. Groß-/Kleinschreibung zählt anfangs nicht (umschaltbar). |
| S4 | Nachspuren | Buchstabe groß und klein mit Startpunkt und Richtungspfeilen. Der Finger muss die Kontrollpunkte in der richtigen Reihenfolge treffen, die Toleranz ist einstellbar. |

Für S4 entsteht ein eigener Editor (`#/dev/strokes`), mit dem die Strichvorlagen gezeichnet und als `strokes.json` gespeichert werden: normierte Koordinaten, Striche in Reihenfolge, Schreibrichtung nach der Schrift, die das Bundesland für die Klasse vorgibt (in Klasse 1 Druckschrift). Jede Schrift hat einen eigenen Ordner unter `schriften/`.

### Rechnen

| ID | Übung | Ablauf |
|---|---|---|
| R1 | Mengen erkennen | Würfelbild oder Zehnerfeld → Zahl wählen; umgekehrt: Zahl → so viele Plättchen antippen |
| R2 | Vergleichen | „Wo sind mehr?“ bzw. <, > oder = bei Zahlen bis 10 |
| R3 | Zahlenhaus | Dach 7, Stockwerk 3 + ? → die fehlende Zahl finden |
| R4 | Plus/Minus bis 10 | Mit einblendbarem Zehnerfeld als Rechenhilfe; das Ergebnis wird über große Zahlen-Tasten eingegeben |
| R5 | Plus/Minus bis 20 | Nur nach Freischaltung: erst ohne, dann mit Zehnerübergang (Zwanzigerfeld) |

Die Rechenaufgaben brauchen kein Wörterbuch, sie werden nach Regeln erzeugt. Dabei gilt: kein negatives Ergebnis, alles bleibt im Zahlenraum, und dieselbe Aufgabe kommt in einer Einheit nicht zweimal vor. Die TTS liest Aufgaben mit Zahlwörtern („drei plus vier“). R4 und R5 sind dasselbe Modul (`rechnen.plus-minus`) mit anderem Zahlenraum; in Klasse 2 wird es mit Zahlenraum 100 weiterverwendet.

## 7. Ablauf einer Einheit und Belohnung

1. **Start:** Das Kind wählt sein Profil (Avatar, Name und Klasse) und wird per TTS begrüßt. Dieser erste Tipp schaltet zugleich die Sprachausgabe frei, denn Chrome verlangt dafür eine Nutzeraktion.
2. **Startseite:** drei große Kacheln für Lesen 📖, Schreiben ✏️ und Rechnen 🔢 der eigenen Klasse, darüber die Zähler für Sterne und Kronen. Ab Klasse 2 kommt eine Kachel „Wiederholen“ 🔁 für die niedrigeren Klassen dazu.
3. **Einheit:** 8 Aufgaben aus dem gewählten Fach und der gewählten Klasse. Eine Fortschrittsleiste zeigt sie als Perlenkette, ohne Timer.
4. **Feedback:**
   - Richtig im 1. oder 2. Versuch: Ein ⭐ fliegt in den Zähler, dazu ein Erfolgston und ein wechselnder Lobsatz.
   - Falsch: Die Antwort wackelt sanft, und es heißt „Versuch's nochmal“. Nach dem 2. Fehler wird die Lösung gezeigt bzw. vorgelesen. Dafür gibt es keinen Stern, aber Lob fürs Weitermachen.
   - Es wird nie etwas abgezogen, und es gibt kein „Game Over“.
5. **Ende:** 👑 Krone ab 6 von 8 Sternen (Schwelle einstellbar; 0 bedeutet: immer). Danach eine kurze Zusammenfassung und die Wahl zwischen „Nochmal“ und „Fertig“.
6. **Trophäen-Ansicht:** Sterne und Kronen gesamt und pro Thema, die Kronen stehen in einem Regal. Sie werden nur gesammelt und schalten nichts frei.

**Anpassung an das Kind:** Jedes Item liegt in einer Leitner-Box. Die Auswahl mischt etwa 70 % sichere mit 30 % neuen oder schwierigen Items, damit die Erfolgsquote bei etwa 80 % bleibt. Das nächste Level einer Übung öffnet sich, sobald 80 % der Items des aktuellen Levels mindestens in Box 3 liegen. Im Elternbereich lässt sich das Level auch von Hand setzen.

## 8. Datenmodell (IndexedDB `fibel`)

| Store | Schlüssel | Inhalt |
|---|---|---|
| `profiles` | `id` | Name, Avatar, Bundesland (z. B. `DE-BY`), Klassenstufe, Anlagedatum |
| `settings` | `profileId` | Startwerte aus Klasse und Bundesland, danach frei anpassbar: freigeschaltete höhere Klassen, von Hand gesetzte Level, freigeschaltete Buchstaben, Silbenfärbung, Silbenbögen, Groß-/Klein werten, Zahlenraum, Minus, Zehnerübergang, Aufgaben pro Einheit, Kronen-Schwelle, Stimme, Tempo, Ton an/aus |
| `progress` | `[profileId, itemKey]` | Box, richtig/falsch, zuletzt gesehen; `itemKey` z. B. `lesen.wort-bild:rose` oder `rechnen.plus10:3+4` |
| `sessions` | `id` (Index `profileId`) | Bundesland, Klasse, Fach, Start, Dauer, Aufgaben mit Ergebnis, Sterne, Krone |
| `meta` | `key` | Schema-Version, Datum des letzten Backups |

- Sterne und Kronen werden aus `sessions` berechnet. So gibt es nur eine Quelle für diese Zahlen.
- Der Lernstand gehört zum Item, nicht zur Klasse oder zum Bundesland. Kommt „Rose“ in Klasse 2 wieder vor, zählt der bisherige Lernstand weiter.
- Beim ersten Start fragt die App `navigator.storage.persist()` an, damit Chrome die Daten nicht von sich aus löscht.
- **Export und Import** als JSON-Datei im Elternbereich sind das Backup für den Fall, dass Chrome-Daten gelöscht werden.
- Migrationen laufen über die IndexedDB-Versionsnummer und werden mit fake-indexeddb getestet.

## 9. Elternbereich

- **Zugang:** Eine Eltern-Schranke verlangt 2 Sekunden Gedrückthalten und dann eine Rechenaufgabe für Erwachsene (z. B. 7 × 8). Eine PIN ist nicht nötig.
- **Profile:** anlegen (mit Bundesland und Klassenstufe), umbenennen, Avatar wählen, löschen (mit Bestätigung)
- **Klassenstufe:** von Hand umstellen. Die App fragt dann, ob sie die Startwerte der neuen Klasse übernehmen soll. Höhere Klassen lassen sich einzeln freischalten.
- **Bundesland:** Lässt sich genauso umstellen wie die Klasse, inklusive der Frage nach den Startwerten. In Version 1 ist nur Bayern aktiv.
- **Buchstaben:** Raster aller Grapheme zum Abhaken, dazu die Anzeige „Damit gibt es 23 Wörter“
- **Darstellung:** Silbenfärbung an/aus, Farben, Silbenbögen
- **Rechnen:** Zahlenraum 10 oder 20, Minus an/aus, Zehnerübergang
- **Einheit:** Aufgaben pro Einheit, Kronen-Schwelle, Ton
- **Stimme:** Auswahl unter den deutschen Stimmen, Tempo, Testsatz. Ist keine Offline-Stimme installiert, erscheint eine Warnung.
- **Statistik:** Einheiten der letzten 14 Tage, Trefferquote pro Klasse und Fach, „Stolperwörter“
- **Backup und Update:** Export und Import; ein bereitstehendes App-Update hier einspielen
- **Info:** Lizenzen (OpenMoji CC BY-SA 4.0, Andika OFL)

## 10. UI/UX

- Funktioniert im Quer- und im Hochformat und passt sich bis zur Handygröße an.
- Schrift Andika, Wörter mindestens 48 px groß, Silbenfarben blau/rot mit ausreichendem Kontrast.
- Feedback läuft nie nur über Farbe, sondern zusätzlich über Form, Animation und Ton.
- Manifest mit `display: standalone`, Theme-Farbe und maskable Icons (`@vite-pwa/assets-generator`).
- Schutz vor versehentlichen Gesten:
  - `overscroll-behavior: none` (kein Pull-to-Refresh)
  - `touch-action: manipulation` (kein Doppeltipp-Zoom)
  - `user-select: none`
  - kein Kontextmenü bei langem Drücken
- Während einer Einheit verhindert die Screen-Wake-Lock-API, dass der Bildschirm ausgeht.
- Tipp für Eltern in der Anleitung: Mit Androids „Bildschirm anpinnen“ kann das Kind die App nicht versehentlich verlassen.

## 11. Umsetzungsphasen

**Stand:**
- Phase 0 ist erledigt: Die App ist auf GitHub Pages veröffentlicht und auf dem Handy getestet.
- Phase 1 ist umgesetzt. Als Test-Übung dient R1 „Mengen erkennen“ aus Phase 4, die damit schon fertig ist.
- Phase 2 ist umgesetzt:
  - Wörterbücher, Grapheme-Zerleger, Lauttreue-Prüfung (`npm run data:check`, auch in der CI), OpenMoji-Bilder (`npm run data:openmoji`) und der Sprachtest im Elternbereich sind fertig.
  - Offen ist noch das Anhören aller Einträge auf dem Gerät. Markierte Fälle bekommen danach ein `say`-Override.
- Phase 3 ist umgesetzt:
  - L1–L5 sind spielbar, mit Silbenfärbung und optionalen Silbenbögen.
  - Wort-Level steigen automatisch, sobald 80 % eines Levels sicher sitzen. Im Elternbereich lassen sie sich auch von Hand setzen.
  - Im Elternbereich gibt es ein Buchstaben-Raster, das zeigt, wie viele Wörter und Silben damit lesbar sind.
  - Eine Einheit verteilt die Aufgaben gleichmäßig auf die Übungen und bringt dieselbe Übung nicht zweimal hintereinander.
  - Offen ist noch der Test mit dem Kind (geplant nach Phase 3).

| Phase | Inhalt | Fertig, wenn … | Umfang |
|---|---|---|---|
| **0 – Setup und Geräte-Check** | Vite/Vue/TS-Projekt, ESLint/Prettier, Vitest, PWA-Plugin, GitHub-Repo mit Pages-Action, Andika, Hash-Router. Spike: TTS-Testseite, die Stimmen auflistet und Silben spricht | … die leere App auf dem Android-Tablet installiert ist, im Flugmodus startet und die deutsche Stimme spricht | S |
| **1 – Kern** | Storage mit Migrationen, Profile mit Bundesland und Klassenstufe, Übungskatalog und Startwerte mit Länderanpassung (`content.ts`, Länderliste mit nur Bayern aktiv), TTS-Service, Sounds, Session-Engine mit Registry, Startseite nach Klasse mit Wiederholen-Bereich, Komponenten für Feedback, Sterne und Kronen, Trophäen-Ansicht, Eltern-Schranke, Grundeinstellungen | … eine Dummy-Übung als Katalog-Eintrag der Klasse 1 komplett läuft, inklusive Krone und Speicherung | M |
| **2 – Wörterbücher Klasse 1** | Abgleich mit dem LehrplanPLUS Bayern (Jahrgangsstufe 1) und Anpassung `DE-BY`; `letters`, `words` (~120), `syllables` (~80), `phrases`; Grapheme-Zerleger, Prüfskript mit Regeln pro Klasse, OpenMoji-Sync, TTS-Prüfseite | … `data:check` grün ist und alle Einträge auf dem Gerät angehört wurden | M |
| **3 – Lesen** | L1–L5, Buchstaben-Filter, Silbenfärbung | … Lesen eine vollständig spielbare Einheit ist | M |
| **4 – Rechnen** | R1–R4, R5 freischaltbar; Zehnerfeld, Zahlenhaus, Zahlen-Tasten | … Rechnen spielbar ist und die Generatoren getestet sind | M |
| **5 – Schreiben I** | S1 Silben legen, S2 Buchstaben legen, S3 ABC-Tastatur | … Schreiben ohne Nachspuren spielbar ist | M |
| **6 – Schreiben II** | Stroke-Editor (Dev), `strokes.json`, S4 Nachspuren | … Nachspuren für alle Buchstaben aus `letters.json` funktioniert | L |
| **7 – Feinschliff** | Statistik, Backup, Update-Hinweis, Lighthouse-PWA-Check, Testrunde mit dem Kind | … Version 1.0 auf GitHub Pages läuft | M |

**Abhängigkeiten:** Rechnen (Phase 4) braucht nur den Kern und kann deshalb parallel zu den Wörterbüchern und zu Lesen entstehen. Lesen und Schreiben brauchen die Wörterbücher aus Phase 2.

**Klassen 2–4:** Sie sind keine Phase von Version 1. Später entsteht jede Klasse nach demselben Muster wie die Phasen 2–6: Wörterbuch, Katalog-Einträge und neue Module nur dort, wo die vorhandenen nicht ausreichen.

**Weitere Bundesländer:** Auch sie gehören nicht zu Version 1. Für ein neues Land wird eine Anpassung unter `laender/<Code>/` angelegt und das Land danach in `laender/index.json` aktiviert.

## 12. Tests

- **Unit-Tests (Vitest):**
  - Grapheme-Zerlegung
  - Lauttreue-Regeln mit Positiv- und Negativliste: „Rose“ wird angenommen, „Sonne“ abgelehnt
  - Leitner-Auswahl
  - Rechen-Generatoren als Property-Tests: Ergebnis immer im Zahlenraum, nie negativ
  - Wertung der Einheit (Sterne, Krone)
  - Storage-Migrationen
- **Komponenten-Tests:** Logik der Kacheln (Reihenfolge, Ablenker)
- **Katalog-Tests:**
  - Jeder Eintrag verweist auf ein vorhandenes Modul mit gültigen Parametern.
  - Jedes Profil sieht genau das, was es sehen soll: die eigene Klasse, die Klassen darunter und freigeschaltete höhere Klassen.
- **Länder-Tests:**
  - Basis plus Anpassung ergibt genau den erwarteten Katalog (hinzufügen, entfernen, verschieben, Parameter ändern).
  - Startwerte und Wortlisten werden richtig überschrieben.
  - Ausgegraute Länder lassen sich nicht auswählen.
- **Manuell auf dem Gerät**, mit einer Checkliste pro Phase: Installation, Betrieb im Flugmodus, Stimme, Touch im Hoch- und Querformat, Daten nach einem Neustart noch vorhanden
- **Test mit dem Kind** nach Phase 3 und Phase 7: zuschauen, wo es hakt, und dann Texte, Tempo und Schwierigkeit anpassen

## 13. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Die TTS liest Silben falsch oder als Abkürzung | `say`-Overrides, TTS-Prüfseite, Silben werden kleingeschrieben an die TTS übergeben |
| Die deutsche Stimme funktioniert nur online | `voice.localService` prüfen; im Elternbereich erklären, wie man die deutsche Stimme von Google-TTS offline lädt |
| Datenverlust (Chrome-Daten gelöscht, App entfernt) | `storage.persist()`, JSON-Export, Erinnerung im Elternbereich, wenn das letzte Backup älter als 30 Tage ist |
| Öffentliches Repo | Keine Namen oder Daten des Kindes im Code; Profile entstehen nur auf dem Gerät |
| Zu wenige Wörter bei wenigen Buchstaben | Ausweichen auf Silben, Hinweis im Elternbereich |
| Nachspuren ist zu streng oder zu locker | Toleranz einstellbar; zuerst mit wenigen Buchstaben testen |
| Ein Update unterbricht eine Übung | Updates werden nur nach Bestätigung im Elternbereich eingespielt |
| Basis-Katalog und Lehrpläne der Länder weichen voneinander ab | Abweichungen kommen in die Länderanpassung. Bayern wird vor jeder neuen Klasse mit dem LehrplanPLUS abgeglichen, andere Länder erst, wenn sie aktiviert werden. |
| Eine Länderanpassung verweist ins Leere oder widerspricht der Basis | `data:check` prüft den zusammengesetzten Inhalt jedes aktiven Landes |

## 14. Später (nicht in Version 1)

- Inhalte für die Klassen 2–4 nach der Katalog-Skizze (Abschnitt 4)
- Weitere Bundesländer: jeweils eine Länderanpassung, danach das Land in der Länderliste aktivieren
- Laute, die die Eltern selbst aufnehmen (Mikrofon, lokal gespeichert)
- Sticker-Album oder Welten zum Freischalten mit Kronen
- Geometrie und Formen
- Tageslimit für Einheiten
