# Fibel

Lern-PWA für Grundschulkinder: Lesen, Schreiben und Rechnen in kurzen Einheiten.
Läuft komplett offline auf dem Gerät – kein Server, kein Konto. Details: [PLAN.md](PLAN.md).

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver, auch im WLAN erreichbar (--host)
npm test           # Unit-Tests (Vitest)
npm run test:coverage  # Unit-Tests mit Coverage-Schwellen (Bericht in coverage/)
npm run e2e        # E2E- und Barrierefreiheits-Tests (Playwright + axe) gegen den Build
npm run typecheck  # TypeScript prüfen (vue-tsc)
npm run lint       # ESLint
npm run format:check   # Prettier-Formatierung prüfen (npm run format korrigiert)
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # Build lokal ansehen (mit Service Worker)
npm run data:check     # Wörterbücher, Lauttreue, Bilder, Schrift-Vorlagen prüfen
npm run data:openmoji  # benötigte OpenMoji-Bilder nach public/img/openmoji kopieren
npm run dist:check     # nach dem Build: strenge CSP, keine externen Zugriffe in dist/
npm run licenses:check # Lizenzen der Laufzeit-Abhängigkeiten gegen die Erlaubt-Liste
```

Für `npm run e2e` einmalig den Browser laden (`npx playwright install chromium`) und vorher
`npm run build` ausführen. Ein schon installiertes Chromium lässt sich mit
`PW_CHROMIUM_PATH=/pfad/zu/chromium` verwenden.

Der Service Worker (Offline-Betrieb, Installation) funktioniert nur über HTTPS oder `localhost`.
Im WLAN per `http://<PC-IP>:5173` lässt sich die Sprachausgabe testen, aber nicht die Installation.

## Veröffentlichen (GitHub Pages)

Veröffentlicht wird nur ein Versions-Tag (`v1.0.0` …). Pushes auf `main` und Pull Requests
durchlaufen dieselben Prüfungen, werden aber nicht veröffentlicht.

**Vor jedem Deploy** (`deploy.yml`, ein Fehler stoppt das Deployment):

- **Qualität:** Formatierung, Lint, Typecheck, Datenprüfung, Unit-Tests mit Coverage-Schwellen
  (Bericht als Artefakt `coverage`).
- **Build und Sicherheit:** `npm audit` der Laufzeit-Abhängigkeiten, Lizenzprüfung, Build,
  `dist:check` (strenge Content-Security-Policy, keine fremden Ressourcen oder Verbindungen,
  keine Source-Maps – „nichts verlässt das Gerät“), SBOM im CycloneDX-Format (Artefakt `sbom`).
  Bei Releases wird zusätzlich eine signierte Build-Provenienz (Attestation) erzeugt.
- **E2E und Barrierefreiheit:** Genau das gebaute Artefakt läuft in Chromium (Pixel-7-Profil):
  erster Start, Profil anlegen, eine Einheit je Fach, keine Konsolenfehler, keine Anfragen an
  fremde Server, Manifest und Service Worker, dazu axe-Prüfungen nach WCAG 2.1 AA.

**Sicherheit** (`security.yml`, bei Push, Pull Request und montags; blockiert kein Deployment):
`npm audit` aller Abhängigkeiten samt Signaturen, Lizenzprüfung, Gitleaks gegen Geheimnisse im
Code, bei Pull Requests die Prüfung neuer Abhängigkeiten (Schwachstellen, GPL-Lizenzen, OpenSSF
Scorecard der neuen Pakete) und die Prüfung der Workflows selbst mit actionlint und zizmor
(Injections, ungepinnte Actions, zu weite Rechte). Die CodeQL-Codeanalyse läuft über das
„Default setup“ von GitHub. Die **OpenSSF Scorecard** (`scorecard.yml`) bewertet montags und bei
Pushes auf `main` die Sicherheitspraktiken des Repos; die Ergebnisse stehen unter
**Security → Code scanning**.

Alle Actions sind auf Commit-SHAs gepinnt, Checkouts behalten keine Zugangsdaten, und der
Deploy-Workflow nutzt keinen Abhängigkeits-Cache. Dependabot schlägt montags Updates für
npm-Pakete und Actions vor (auch für die SHA-Pins).

Im Elternbereich unter **Version** stehen Versionsnummer und Build-Zeitpunkt („Stand“) der
installierten und der neuesten Fassung.

### Einmalig einrichten

1. Auf GitHub: **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Environments → github-pages → Deployment branches and tags**: eine Regel für
   Tags mit dem Muster `v*` hinzufügen. Ohne diese Regel lehnt GitHub das Deployment von Tags
   ab („not allowed to deploy to github-pages due to environment protection rules“).
3. **Settings → Code security**: Dependabot alerts und Secret scanning mit Push protection
   einschalten, bei Code scanning „CodeQL analysis → Default setup“. In `security.yml` steht
   deshalb kein eigener CodeQL-Job (beides zusammen meldet einen Konflikt). Die Ergebnisse
   stehen unter **Security → Code scanning**.

### Version veröffentlichen (wenn alles fertig ist)

```bash
npm version minor            # oder patch / major: erhöht die Version, committet, legt Tag vX.Y.Z an
git push --follow-tags       # pusht Commit und Tag – der Tag löst das Deployment aus
```

Der Workflow prüft, ob der Tag zur Version in `package.json` passt. Danach ist die App unter
`https://<benutzer>.github.io/<repo>/` aktuell. Im Elternbereich unter **Version** stehen die
installierte und die neueste Version; das Update wird dort bestätigt, nie mitten in einer Übung.

Das Repo ist öffentlich: Es enthält keine Daten der Kinder. Profile und Fortschritt entstehen nur
auf dem Gerät.

## Auf dem Android-Tablet einrichten

1. **Deutsche Offline-Stimme laden:** Einstellungen → System → Sprachen → Sprachausgabe →
   Google-Sprachausgabe → Sprachdaten installieren → Deutsch.
2. Die App-Adresse in Chrome öffnen → Menü ⋮ → **App installieren**.
3. Die App einmal online öffnen, dann im Flugmodus erneut starten.
4. Unter **Gerätetest** prüfen: installiert, offline startklar, Speicher dauerhaft,
   deutsche Stimme mit „offline“.
5. Tipp: Mit **Bildschirm anpinnen** (Einstellungen → Sicherheit) kann das Kind die App nicht
   versehentlich verlassen.

## Lizenz

Der Code und die eigenen Inhalte (Wortlisten, Übungskatalog, Logo) stehen unter der
[MIT-Lizenz](LICENSE).

Eingebundene Werke Dritter behalten ihre eigene Lizenz:

- **OpenMoji** – Emojis und Bilder von [openmoji.org](https://openmoji.org),
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **Andika** – Schrift von SIL International,
  [SIL Open Font License 1.1](https://openfontlicense.org)
