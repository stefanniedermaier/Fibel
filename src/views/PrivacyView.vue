<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'

// Privacy notice in plain language. Reachable from the start screen, the home screen
// and the parent area; the back button returns to wherever it was opened from.
const router = useRouter()
const back = computed(() => {
  const previous = router.options.history.state.back
  return typeof previous === 'string' ? previous : { name: 'profiles' }
})
</script>

<template>
  <main class="page privacy">
    <header class="top">
      <BackButton :to="back" />
      <h1>Datenschutz</h1>
    </header>

    <section class="card lead">
      <p>
        <strong>Kurz gesagt:</strong> Fibel braucht kein Konto, hat keinen eigenen Server, keine
        Werbung, kein Tracking und keine Cookies. Alles, was beim Üben entsteht, bleibt auf diesem
        Gerät.
      </p>
    </section>

    <section class="card">
      <h2>Was auf dem Gerät gespeichert wird</h2>
      <ul>
        <li><strong>Profil:</strong> Name oder Spitzname, Bild, Bundesland und Klasse.</li>
        <li><strong>Einstellungen</strong> aus dem Elternbereich (z. B. Buchstaben, Stimme).</li>
        <li>
          <strong>Lernstand:</strong> welche Aufgaben schon sitzen und welche öfter danebengehen.
          Damit kommen schwierige Aufgaben häufiger dran.
        </li>
        <li>
          <strong>Einheiten:</strong> Datum, Dauer, Sterne und Kronen. Sie werden nach 14 Tagen oder
          einem Monat (im Elternbereich einstellbar) automatisch gelöscht.
        </li>
      </ul>
      <p>
        Gespeichert wird im Browser-Speicher des Geräts (IndexedDB). Nichts davon wird übertragen.
        Die Daten bleiben, bis ein Profil im Elternbereich gelöscht, die App deinstalliert oder der
        Website-Speicher im Browser geleert wird.
      </p>
    </section>

    <section class="card">
      <h2>Sicherung</h2>
      <p>
        Nur wenn Sie im Elternbereich eine Sicherung speichern, entsteht eine Datei mit Profilen,
        Einstellungen und Lernstand. Sie liegt dann dort, wo Sie sie speichern, und enthält die
        Namen der Kinder – bitte entsprechend aufbewahren.
      </p>
    </section>

    <section class="card">
      <h2>Sprachausgabe</h2>
      <p>
        Fibel liest mit der Sprachausgabe des Geräts vor (Wörter, Anweisungen und beim Start den
        Namen des Kindes). Mit einer <strong>Offline-Stimme</strong> bleibt der Text auf dem Gerät.
        Manche Geräte nutzen <strong>Online-Stimmen</strong>; dann schickt das Betriebssystem den
        vorzulesenden Text an seinen Anbieter (z. B. Google). Der Gerätetest im Elternbereich zeigt,
        ob eine Offline-Stimme vorhanden ist, und in den Profil-Einstellungen lässt sich eine
        Offline-Stimme wählen.
      </p>
    </section>

    <section class="card">
      <h2>Laden und Aktualisieren der App</h2>
      <p>
        Die App wird über GitHub Pages (GitHub Inc.) bereitgestellt. Beim ersten Laden, bei Updates
        und bei der Versionsprüfung im Elternbereich ruft das Gerät Dateien von dort ab. Dabei
        verarbeitet GitHub technisch notwendige Verbindungsdaten wie die IP-Adresse; Näheres steht
        in der Datenschutzerklärung von GitHub. Danach läuft Fibel auch ohne Internet, und es werden
        keine Lern- oder Profildaten verschickt.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO: Ohne diese Verbindungsdaten lässt sich die
        App nicht ausliefern, und das berechtigte Interesse liegt darin, sie sicher und zuverlässig
        bereitzustellen. GitHub hat seinen Sitz in den USA, die Daten können also dorthin
        übermittelt werden. GitHub ist nach dem EU-US Data Privacy Framework zertifiziert; für die
        USA gilt damit ein Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO). Wie lange
        GitHub diese Daten speichert, steht in der Datenschutzerklärung von GitHub.
      </p>
    </section>

    <section class="card">
      <h2>Verantwortlich (Art. 13 DSGVO)</h2>
      <address>
        Stefan Niedermaier<br />
        Ostendstr. 5<br />
        85777 Fahrenzhausen<br />
        E-Mail: <a href="mailto:stefan@niedermaier.bayern">stefan@niedermaier.bayern</a>
      </address>
      <p>
        Fibel ist ein privates, nicht-kommerzielles Open-Source-Projekt; der Quellcode ist auf
        GitHub öffentlich einsehbar (Repository „Fibel“).
      </p>
    </section>

    <section class="card">
      <h2>Ihre Rechte</h2>
      <p>
        Da alle Lern- und Profildaten nur auf Ihrem Gerät liegen, haben Sie sie selbst in der Hand:
        Sie können sie im Elternbereich ansehen (Statistik), sichern und löschen. Dem
        Verantwortlichen liegen keine Daten über Sie oder Ihr Kind vor.
      </p>
      <p>
        Nach der DSGVO haben Sie das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
        Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Wenden Sie sich dafür
        an die oben genannte Adresse. Für die Verarbeitung durch GitHub beim Laden der App ist
        GitHub selbst zuständig.
      </p>
      <p>
        Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO),
        zum Beispiel beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA) in Ansbach.
      </p>
    </section>
  </main>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.top h1 {
  margin: 0;
}

.card {
  margin-top: 16px;
}

h2 {
  margin-top: 0;
  font-size: 22px;
}

p,
li {
  font-size: 18px;
  line-height: 1.5;
}

p:last-child {
  margin-bottom: 0;
}

ul {
  padding-left: 20px;
}

address {
  font-size: 18px;
  font-style: normal;
  line-height: 1.5;
}

.lead {
  border: 3px solid var(--accent);
}
</style>
