# Fibel

Lern-PWA für Grundschulkinder: Lesen, Schreiben und Rechnen in kurzen Einheiten.
Läuft komplett offline auf dem Gerät – kein Server, kein Konto. Details: [PLAN.md](PLAN.md).

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver, auch im WLAN erreichbar (--host)
npm test           # Unit-Tests (Vitest)
npm run lint       # ESLint
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # Build lokal ansehen (mit Service Worker)
npm run data:check     # Wörterbücher, Lauttreue, Bilder, Schrift-Vorlagen prüfen
npm run data:openmoji  # benötigte OpenMoji-Bilder nach public/img/openmoji kopieren
```

Der Service Worker (Offline-Betrieb, Installation) funktioniert nur über HTTPS oder `localhost`.
Im WLAN per `http://<PC-IP>:5173` lässt sich die Sprachausgabe testen, aber nicht die Installation.

## Veröffentlichen (GitHub Pages)

Jeder Push auf `main` wird geprüft (Lint, Datenprüfung, Tests, Build), aber **nicht**
veröffentlicht. Veröffentlicht wird nur eine Version mit Versions-Tag.

### Einmalig einrichten

1. Auf GitHub: **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Environments → github-pages → Deployment branches and tags**: eine Regel für
   Tags mit dem Muster `v*` hinzufügen. Ohne diese Regel lehnt GitHub das Deployment von
   Tags ab („not allowed to deploy to github-pages due to environment protection rules“).

### Neue Version veröffentlichen

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
