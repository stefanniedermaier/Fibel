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
```

Der Service Worker (Offline-Betrieb, Installation) funktioniert nur über HTTPS oder `localhost`.
Im WLAN per `http://<PC-IP>:5173` lässt sich die Sprachausgabe testen, aber nicht die Installation.

## Veröffentlichen (GitHub Pages)

1. Repo auf GitHub anlegen und pushen (Branch `main`).
2. Auf GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Jeder Push auf `main` prüft (Lint, Tests), baut und veröffentlicht unter
   `https://<benutzer>.github.io/<repo>/`.

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
