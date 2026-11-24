<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { APP_VERSION } from '@/core/version'

// "Über Fibel": the works the app uses and their licences, reachable without the
// parent gate (the licences ask for a notice the users can find). Addresses are shown
// as text, not as links: nothing in the app leads a child out of it.
const router = useRouter()
const back = computed(() => {
  const previous = router.options.history.state.back
  return typeof previous === 'string' ? previous : { name: 'profiles' }
})

const licenses = ref<string>()
const failed = ref(false)
async function showLicenses() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}THIRD-PARTY-LICENSES.txt`)
    if (!response.ok) throw new Error(String(response.status))
    licenses.value = await response.text()
  } catch {
    failed.value = true
  }
}
</script>

<template>
  <main class="page about">
    <header class="top">
      <BackButton :to="back" />
      <h1>Über Fibel</h1>
    </header>

    <section class="card">
      <p>
        Fibel ist ein privates, nicht-kommerzielles Open-Source-Projekt von Stefan Niedermaier
        (Version {{ APP_VERSION }}). Der Quellcode steht unter der MIT-Lizenz, Copyright © 2026
        Stefan Niedermaier.
      </p>
    </section>

    <section class="card">
      <h2>Bilder</h2>
      <p>
        Alle Bilder (Emojis) stammen von <strong>OpenMoji</strong> – the open-source emoji and icon
        project. License: <strong>CC BY-SA 4.0</strong>. Sie werden unverändert verwendet.
      </p>
      <p class="address">
        openmoji.org<br />
        creativecommons.org/licenses/by-sa/4.0/
      </p>
    </section>

    <section class="card">
      <h2>Schrift</h2>
      <p>
        <strong>Andika</strong>, Copyright © 2004–2022 SIL International, lizenziert unter der SIL
        Open Font License 1.1.
      </p>
      <p class="address">openfontlicense.org</p>
    </section>

    <section class="card">
      <h2>Programmbibliotheken</h2>
      <p>
        Fibel nutzt Vue, Vue Router, Pinia (MIT), idb (ISC) und Workbox (MIT). Die vollständigen
        Lizenztexte aller mitgelieferten Werke:
      </p>
      <button v-if="!licenses" type="button" class="btn" @click="showLicenses">
        Lizenztexte anzeigen
      </button>
      <p v-if="failed" class="muted">Die Lizenztexte konnten nicht geladen werden.</p>
      <pre v-if="licenses" class="licenses" tabindex="0" aria-label="Lizenztexte">{{
        licenses
      }}</pre>
    </section>

    <section class="card">
      <h2>Inhalte</h2>
      <p>
        Die Wortauswahl für Bayern ist abgeglichen mit dem Grundwortschatz für die Jahrgangsstufen 1
        und 2 (ISB, LehrplanPLUS Grundschule Bayern). Logo, Töne, Aufgaben und Schreibvorlagen sind
        für Fibel selbst gestaltet.
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

p {
  font-size: 18px;
  line-height: 1.5;
}

p:last-child {
  margin-bottom: 0;
}

.address {
  color: var(--muted);
  overflow-wrap: anywhere;
}

.licenses {
  max-height: 60vh;
  overflow: auto;
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  background: var(--bg);
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  -webkit-user-select: text;
  user-select: text;
}
</style>
