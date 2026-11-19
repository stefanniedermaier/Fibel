<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DEFAULT_RATE, isTtsSupported, loadVoices, rankGermanVoices, speak } from '@/core/tts'
import {
  applyUpdate,
  isInstalled,
  needRefresh,
  offlineReady,
  requestPersistentStorage,
} from '@/core/pwa'

const ttsSupported = isTtsSupported()
const voices = ref<SpeechSynthesisVoice[]>([])
const selectedURI = ref<string>()
const rate = ref(DEFAULT_RATE)
const customText = ref('')
const speakError = ref<string>()
const voicesLoaded = ref(false)

const germanVoices = computed(() => rankGermanVoices(voices.value))
const selectedVoice = computed(
  () => germanVoices.value.find((v) => v.voiceURI === selectedURI.value) ?? germanVoices.value[0],
)
const hasOfflineVoice = computed(() => germanVoices.value.some((v) => v.localService))

// Samples that test the critical cases from the plan (short syllables can be
// misread as abbreviations, e.g. "Mo" → "Montag").
const samples = [
  { group: 'Begrüßung', items: ['Hallo! Ich bin deine Lern-App.', 'Super gemacht!'] },
  { group: 'Silben', items: ['ma', 'mo', 'mi', 'la', 'lo', 'li', 'so', 'do', 'se', 'ne'] },
  { group: 'Silben groß (Abkürzungs-Falle)', items: ['Mo', 'Di', 'Mi', 'Do', 'Sa', 'So'] },
  { group: 'Wörter', items: ['Oma', 'Rose', 'Hose', 'Dose', 'Tomate', 'Banane', 'Igel'] },
  {
    group: 'Rechnen',
    items: ['drei plus vier', 'zehn minus sechs', 'Wie viele Punkte siehst du?'],
  },
]

async function say(text: string) {
  speakError.value = undefined
  try {
    await speak(text, { voice: selectedVoice.value, rate: rate.value })
  } catch (e) {
    speakError.value = e instanceof Error ? e.message : String(e)
  }
}

// App status
const online = ref(navigator.onLine)
const installed = ref(isInstalled())
const persisted = ref<boolean>()
const storageInfo = ref<string>()
const updateOnline = () => (online.value = navigator.onLine)

async function askPersist() {
  persisted.value = await requestPersistentStorage()
}

onMounted(async () => {
  window.addEventListener('online', updateOnline)
  window.addEventListener('offline', updateOnline)
  if (navigator.storage?.persisted) persisted.value = await navigator.storage.persisted()
  if (navigator.storage?.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    storageInfo.value = `${(usage / 1e6).toFixed(1)} MB von ${(quota / 1e9).toFixed(1)} GB`
  }
  voices.value = await loadVoices()
  selectedURI.value = germanVoices.value[0]?.voiceURI
  voicesLoaded.value = true
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnline)
  window.removeEventListener('offline', updateOnline)
})

const yesNo = (v: boolean | undefined) => (v === undefined ? 'unbekannt' : v ? 'ja' : 'nein')
</script>

<template>
  <main class="check">
    <header>
      <RouterLink to="/" class="back">← Zurück</RouterLink>
      <h1>Gerätetest</h1>
    </header>

    <section>
      <h2>App</h2>
      <dl>
        <dt>Als App installiert</dt>
        <dd :class="installed ? 'ok' : 'warn'">{{ yesNo(installed) }}</dd>
        <dt>Offline startklar</dt>
        <dd :class="offlineReady ? 'ok' : 'warn'">
          {{ offlineReady ? 'ja' : 'noch nicht gemeldet (nach dem ersten Laden neu öffnen)' }}
        </dd>
        <dt>Internet</dt>
        <dd>{{ online ? 'online' : 'offline' }}</dd>
        <dt>Speicher dauerhaft</dt>
        <dd :class="persisted ? 'ok' : 'warn'">
          {{ yesNo(persisted) }}
          <button v-if="!persisted" class="small" @click="askPersist">anfragen</button>
        </dd>
        <dt>Belegt</dt>
        <dd>{{ storageInfo ?? 'unbekannt' }}</dd>
      </dl>
      <p v-if="needRefresh" class="update">
        Eine neue Version ist da.
        <button class="small" @click="applyUpdate">Jetzt aktualisieren</button>
      </p>
    </section>

    <section>
      <h2>Sprachausgabe</h2>
      <p v-if="!ttsSupported" class="error">Dieser Browser unterstützt keine Sprachausgabe.</p>
      <template v-else>
        <p v-if="voicesLoaded && germanVoices.length === 0" class="error">
          Keine deutsche Stimme gefunden. Android: Einstellungen → System → Sprache → Sprachausgabe
          → Google-Sprachausgabe → Sprachdaten installieren → Deutsch.
        </p>
        <p v-else-if="voicesLoaded && !hasOfflineVoice" class="warn">
          Es gibt nur Online-Stimmen. Für den Offline-Betrieb die deutschen Sprachdaten in der
          Google-Sprachausgabe herunterladen.
        </p>

        <label v-if="germanVoices.length > 0">
          Stimme
          <select v-model="selectedURI">
            <option v-for="v in germanVoices" :key="v.voiceURI" :value="v.voiceURI">
              {{ v.name }} ({{ v.lang }}{{ v.localService ? ', offline' : ', online' }})
            </option>
          </select>
        </label>

        <label>
          Tempo {{ rate.toFixed(2) }}
          <input v-model.number="rate" type="range" min="0.5" max="1.3" step="0.05" />
        </label>

        <div v-for="s in samples" :key="s.group" class="samples">
          <h3>{{ s.group }}</h3>
          <button v-for="text in s.items" :key="text" class="sample" @click="say(text)">
            🔊 {{ text }}
          </button>
        </div>

        <form class="custom" @submit.prevent="say(customText)">
          <input v-model="customText" type="text" placeholder="Eigenen Text eingeben" />
          <button type="submit" :disabled="!customText.trim()">🔊 Sprechen</button>
        </form>

        <p v-if="speakError" class="error">Fehler beim Sprechen: {{ speakError }}</p>

        <details>
          <summary>Alle Stimmen ({{ voices.length }})</summary>
          <ul>
            <li v-for="v in voices" :key="v.voiceURI">
              {{ v.name }} – {{ v.lang }} – {{ v.localService ? 'offline' : 'online' }}
            </li>
          </ul>
        </details>
      </template>
    </section>
  </main>
</template>

<style scoped>
.check {
  max-width: 820px;
  margin: 0 auto;
  padding: 16px;
}

header {
  display: flex;
  align-items: center;
  gap: 16px;
}

h1 {
  margin: 0;
}

.back {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  color: var(--muted);
}

section {
  margin-top: 24px;
  padding: 16px 20px;
  background: var(--surface);
  border-radius: var(--radius);
}

h2 {
  margin-top: 0;
}

h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: var(--muted);
}

dl {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 8px 16px;
  margin: 0;
}

/* Phones in portrait: label above value instead of two columns. */
@media (max-width: 520px) {
  section {
    padding: 16px;
  }

  dl {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  dd {
    margin-bottom: 12px;
  }
}

dt {
  color: var(--muted);
}

dd {
  margin: 0;
}

.ok {
  color: var(--ok);
}

.warn {
  color: var(--accent-strong);
}

.error {
  color: var(--error);
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

select,
input[type='text'] {
  min-height: 48px;
  padding: 0 12px;
  border: 2px solid var(--accent);
  border-radius: 12px;
  background: #fff;
  /* Form controls have a large intrinsic width; let them shrink on phones. */
  width: 100%;
  min-width: 0;
}

.samples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.samples h3 {
  flex-basis: 100%;
}

.sample,
button[type='submit'] {
  min-height: var(--tap);
  padding: 0 20px;
  border: 3px solid var(--accent);
  border-radius: 16px;
  background: #fff;
  font-size: 22px;
}

.small {
  margin-left: 8px;
  padding: 4px 12px;
  border: 2px solid var(--accent);
  border-radius: 10px;
  background: #fff;
}

.custom {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.custom {
  flex-wrap: wrap;
}

.custom input {
  flex: 1 1 220px;
}

.custom button {
  flex: 1 0 auto;
}

.update {
  margin-bottom: 0;
}

details {
  margin-top: 16px;
  font-size: 16px;
  /* Android voice IDs such as "de-de-x-nfh-local" must not widen the page. */
  overflow-wrap: anywhere;
}

dd,
.sample {
  overflow-wrap: anywhere;
}
</style>
