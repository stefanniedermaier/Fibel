<script setup lang="ts">
import { computed } from 'vue'
import type { ProfileSettings } from '@/core/types'

// Writing: case, tracing and recognition, Lernwörter, experiments, joined script.
defineProps<{ grade: number; hasSchreiben: boolean }>()
const settings = defineModel<ProfileSettings>('settings', { required: true })

// Lernwörter: one per line or separated by commas; cleaned when saved.
const lernwoerterText = computed({
  get: () => settings.value.lernwoerter.join('\n'),
  set: (text: string) => (settings.value.lernwoerter = text.split(/[\n,;]+/)),
})
</script>

<template>
  <section v-if="hasSchreiben" class="card">
    <h2>Schreiben</h2>
    <label class="check">
      <input v-model="settings.strictCase" type="checkbox" />
      Groß-/Kleinschreibung werten (sonst wird der Anfangsbuchstabe von Nomen automatisch groß)
    </label>
    <label>
      Nachspuren: Wie genau muss der Finger der Linie folgen?
      <select v-model.number="settings.traceTolerance">
        <option :value="1.4">locker</option>
        <option :value="1">normal</option>
        <option :value="0.7">genau</option>
      </select>
    </label>
    <label>
      Lernwörter der Woche (ein Wort pro Zeile, z. B. aus dem Heft der Schule)
      <textarea v-model="lernwoerterText" rows="4" autocomplete="off" spellcheck="false" />
    </label>
    <label class="check">
      <input v-model="settings.schreibwerkstatt" type="checkbox" />
      Experiment: Schreibwerkstatt – frei tippen, die App liest vor, was dasteht (ohne Bewertung,
      nichts wird gespeichert)
    </label>
    <label class="check">
      <input v-model="settings.kaestchen" type="checkbox" />
      Experiment: Wörter frei in Kästchen schreiben (die App erkennt die Buchstaben)
    </label>
    <label v-if="settings.kaestchen">
      Erkennung: Wie genau muss geschrieben werden?
      <select v-model.number="settings.recognitionTolerance">
        <option :value="1.25">locker</option>
        <option :value="1">normal</option>
        <option :value="0.8">genau</option>
      </select>
    </label>
  </section>

  <section v-if="grade >= 2" class="card">
    <h2>Verbundene Schrift</h2>
    <label>
      Schrift der Schule
      <select v-model="settings.schreibschrift">
        <option :value="null">noch nicht gewählt</option>
        <option value="va">Vereinfachte Ausgangsschrift (VA)</option>
        <option value="sas">Schulausgangsschrift (SAS)</option>
      </select>
    </label>
    <p v-if="!settings.schreibschrift" class="voice-warn">
      Bitte die Schrift wählen, die die Schule ab Klasse 2 lehrt (steht im Schreibheft oder auf der
      Liste der Lehrkraft). Bis dahin übt die App mit der Vereinfachten Ausgangsschrift.
    </p>
    <p class="muted">
      Beim Nachspuren der Schreibschrift nutzt die App diese Vorlage. Unter „Schrift-Vorlagen“
      lassen sich beide Schriften ansehen und ausprobieren.
    </p>
  </section>
</template>
