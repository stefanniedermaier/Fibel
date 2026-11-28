<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { say } from '@/core/speech'
import { loadVoices, rankEnglishVoices, rankGermanVoices } from '@/core/tts'
import type { ProfileSettings } from '@/core/types'

// Voices for German and (from grade 3) English, speaking rate.
const props = defineProps<{ name: string; grade: number }>()
const settings = defineModel<ProfileSettings>('settings', { required: true })

const voices = ref<SpeechSynthesisVoice[]>([])
const germanVoices = computed(() => rankGermanVoices(voices.value))
const englishVoices = computed(() => rankEnglishVoices(voices.value))
/** English starts in grade 3 (plaene/klasse-3.md, section 10). */
const showEnglish = computed(() => props.grade >= 3)
onMounted(async () => (voices.value = await loadVoices()))

function testVoice() {
  void say(`Hallo ${props.name || 'du'}! So klinge ich.`, settings.value)
}
function testEnglish() {
  void say('So klingt Englisch: [[en:Hello! How are you? I am fine, thank you.]]', settings.value)
}
</script>

<template>
  <section class="card">
    <h2>Stimme</h2>
    <label v-if="germanVoices.length > 0">
      Stimme
      <select v-model="settings.voiceURI">
        <option :value="null">automatisch (beste Offline-Stimme)</option>
        <option v-for="v in germanVoices" :key="v.voiceURI" :value="v.voiceURI">
          {{ v.name }}{{ v.localService ? '' : ' (nur online)' }}
        </option>
      </select>
    </label>
    <p v-else class="muted">Keine deutsche Stimme gefunden – siehe Gerätetest.</p>
    <label>
      Tempo {{ settings.speechRate.toFixed(2) }}
      <input v-model.number="settings.speechRate" type="range" min="0.5" max="1.3" step="0.05" />
    </label>
    <button type="button" class="btn" @click="testVoice">🔊 Stimme testen</button>
    <template v-if="showEnglish">
      <label v-if="englishVoices.length > 0">
        Englische Stimme
        <select v-model="settings.voiceURIEn">
          <option :value="null">automatisch (britisches Englisch bevorzugt)</option>
          <option v-for="v in englishVoices" :key="v.voiceURI" :value="v.voiceURI">
            {{ v.name }} ({{ v.lang }}){{ v.localService ? '' : ' – nur online' }}
          </option>
        </select>
      </label>
      <p v-else class="voice-warn">
        Keine englische Stimme gefunden. Die Englisch-Übungen brauchen eine: In den Einstellungen
        des Geräts unter „Sprachausgabe“ eine englische Stimme laden (wie für Deutsch, siehe
        Gerätetest). Sonst liest die deutsche Stimme die englischen Wörter.
      </p>
      <button type="button" class="btn" @click="testEnglish">🔊 Englisch testen</button>
    </template>
  </section>
</template>
