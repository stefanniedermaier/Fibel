<script setup lang="ts">
import { computed } from 'vue'
import SyllableWord from '@/components/SyllableWord.vue'
import { readableSentences } from '@/core/saetze'
import type { LandCode, ProfileSettings } from '@/core/types'
import {
  LETTERS,
  baseSyllables,
  resolveWords,
  syllablesForSettings,
  wordsForSettings,
} from '@/core/words'
import { READING_LEVEL_KEY } from '@/exercises/lesen/shared'
import { levelSetting } from './levels'

// Reading: letters learnt at school, syllable colours, flash time and word level.
const props = defineProps<{ land: LandCode; grade: number }>()
const settings = defineModel<ProfileSettings>('settings', { required: true })

const gradeWordList = computed(() => resolveWords(props.land, props.grade))
const readable = computed(() => wordsForSettings(gradeWordList.value, settings.value))
const readableSyllables = computed(
  () => syllablesForSettings(baseSyllables(props.grade), settings.value).length,
)
const letterSet = computed(() => new Set(settings.value.letters))
const readableSentenceCount = computed(
  () => readableSentences(props.land, props.grade, settings.value).length,
)
const readingLevel = levelSetting(settings, READING_LEVEL_KEY)

function toggleLetter(id: string) {
  const set = new Set(settings.value.letters)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  // Keep the school order of letters.json.
  settings.value.letters = LETTERS.map((l) => l.id).filter((l) => set.has(l))
}

/** All letters up to (and including) this one, in school order. */
function lettersUpTo(id: string) {
  const index = LETTERS.findIndex((l) => l.id === id)
  settings.value.letters = LETTERS.slice(0, index + 1).map((l) => l.id)
}
</script>

<template>
  <section v-if="gradeWordList.length > 0" class="card">
    <h2>Lesen</h2>

    <label class="check">
      <input v-model="settings.letterFilter" type="checkbox" />
      Nur Buchstaben, die in der Schule schon dran waren
    </label>

    <template v-if="settings.letterFilter">
      <p class="muted">
        Tippe die gelernten Buchstaben an. Lange drücken markiert alle bis zu diesem Buchstaben.
      </p>
      <div class="letters">
        <button
          v-for="l in LETTERS"
          :key="l.id"
          type="button"
          class="letter"
          :class="{ on: letterSet.has(l.id) }"
          :aria-pressed="letterSet.has(l.id)"
          @click="toggleLetter(l.id)"
          @contextmenu.prevent="lettersUpTo(l.id)"
        >
          {{ l.upper }}
        </button>
      </div>
    </template>
    <p class="count" :class="{ warn: readable.length < 3 }">
      Damit gibt es <strong>{{ readable.length }}</strong> Wörter und
      <strong>{{ readableSyllables }}</strong> Silben und
      <strong>{{ readableSentenceCount }}</strong> Sätze zum Lesen.
      <span v-if="readable.length < 3">Für alle Leseübungen braucht es mindestens 3 Wörter.</span>
    </p>

    <label class="check">
      <input v-model="settings.syllableColoring" type="checkbox" />
      Silben farbig (blau/rot)
    </label>
    <label class="check">
      <input v-model="settings.syllableArcs" type="checkbox" />
      Silbenbögen
    </label>
    <p class="preview">
      <SyllableWord
        :syllables="['To', 'ma', 'te']"
        :coloring="settings.syllableColoring"
        :arcs="settings.syllableArcs"
        :size="44"
      />
    </p>

    <label>
      Blitzlesen: So lange ist das Wort zu sehen
      <select v-model.number="settings.flashMs">
        <option :value="1000">1 Sekunde</option>
        <option :value="1500">1,5 Sekunden</option>
        <option :value="2500">2,5 Sekunden</option>
        <option :value="4000">4 Sekunden</option>
      </select>
    </label>

    <label>
      Wort-Level beim Lesen
      <select v-model.number="readingLevel">
        <option :value="0">automatisch (steigt mit dem Lernfortschritt)</option>
        <option :value="1">1 – zwei offene Silben (Oma, Rose)</option>
        <option :value="2">2 – drei offene Silben (Tomate)</option>
        <option :value="3">3 – geschlossene Silben (Igel, Brot)</option>
        <option :value="4">4 – Sch, Ei, Au, Umlaute (Schaf, Eis)</option>
      </select>
    </label>
  </section>
</template>

<style scoped>
.letters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
}

.letter {
  min-height: 52px;
  border: 2px solid #e2d3bd;
  border-radius: 12px;
  background: var(--bg);
  font-size: 22px;
  font-weight: 700;
  color: var(--muted);
}

.letter.on {
  border-color: var(--accent-strong);
  background: var(--accent);
  color: var(--text);
}

.count {
  margin: 0 0 14px;
}

.count.warn span {
  display: block;
  color: var(--accent-strong);
}

.preview {
  margin: 0 0 14px;
}
</style>
