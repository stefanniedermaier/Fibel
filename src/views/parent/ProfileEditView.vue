<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import EmojiPicture from '@/components/EmojiPicture.vue'
import SyllableWord from '@/components/SyllableWord.vue'
import { AVATARS, DEFAULT_AVATAR } from '@/core/avatars'
import {
  LETTERS,
  baseSyllables,
  resolveWords,
  syllablesForSettings,
  wordsForSettings,
} from '@/core/words'
import { READING_LEVEL_KEY } from '@/exercises/lesen/shared'
import {
  DEFAULT_LAND,
  LAENDER,
  catalogFor,
  getLand,
  gradeHasContent,
  resolveDefaults,
} from '@/core/content'
import { plain } from '@/core/plain'
import { say } from '@/core/speech'
import { loadVoices, rankGermanVoices } from '@/core/tts'
import type { ProfileSettings } from '@/core/types'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ id?: string }>()
const store = useAppStore()
const router = useRouter()

const existing = computed(() => store.profiles.find((p) => p.id === props.id))
const isNew = computed(() => !props.id)

const form = reactive({
  name: '',
  avatar: DEFAULT_AVATAR,
  land: DEFAULT_LAND,
  grade: 1,
})
const settings = ref<ProfileSettings>(resolveDefaults(DEFAULT_LAND, 1))
const error = ref<string>()
const saving = ref(false)

onMounted(() => {
  if (existing.value) {
    const p = existing.value
    Object.assign(form, { name: p.name, avatar: p.avatar, land: p.land, grade: p.grade })
    const s = store.settingsById[p.id]
    if (s) settings.value = plain(s)
  }
})

// For a new profile the start values follow Bundesland and Klasse directly.
watch(
  () => [form.land, form.grade] as const,
  ([land, grade]) => {
    if (isNew.value) {
      const keep = { voiceURI: settings.value.voiceURI, speechRate: settings.value.speechRate }
      settings.value = { ...resolveDefaults(land, grade), ...keep }
    }
  },
)

const land = computed(() => getLand(form.land))
const grades = computed(() => land.value?.grades ?? [1, 2, 3, 4])
const higherGrades = computed(() => grades.value.filter((g) => g > form.grade))

// Crown threshold as "x of N stars"; stored as a ratio so it survives changing N.
const crownStars = computed({
  get: () => Math.round(settings.value.crownRatio * settings.value.tasksPerUnit),
  set: (n: number) => (settings.value.crownRatio = n / settings.value.tasksPerUnit),
})

// --- Reading: letters, syllables, word level -------------------------------
const gradeWordList = computed(() => resolveWords(form.land, form.grade))
const readable = computed(() => wordsForSettings(gradeWordList.value, settings.value))
const readableSyllables = computed(
  () => syllablesForSettings(baseSyllables(form.grade), settings.value).length,
)
const letterSet = computed(() => new Set(settings.value.letters))

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

const readingLevel = computed({
  get: () => settings.value.levels[READING_LEVEL_KEY] ?? 0,
  set: (level: number) => {
    const levels = { ...settings.value.levels }
    if (level === 0) delete levels[READING_LEVEL_KEY]
    else levels[READING_LEVEL_KEY] = level
    settings.value.levels = levels
  },
})

// --- Arithmetic --------------------------------------------------------------
const hasRechnen = computed(() => catalogFor(form.land, form.grade, 'rechnen').length > 0)
/** Number ranges up to the grade's start value (grade 1: 10 and 20). */
const numberRanges = computed(() => {
  const start = resolveDefaults(form.land, form.grade).numberRange
  return [10, 20, 100, 1000, 1000000].filter((n) => n <= Math.max(start, 20))
})

function toggleGrade(g: number, on: boolean) {
  const set = new Set(settings.value.unlockedGrades)
  if (on) set.add(g)
  else set.delete(g)
  settings.value.unlockedGrades = [...set].sort()
}

// Voices
const voices = ref<SpeechSynthesisVoice[]>([])
const germanVoices = computed(() => rankGermanVoices(voices.value))
onMounted(async () => (voices.value = await loadVoices()))

function testVoice() {
  void say(`Hallo ${form.name || 'du'}! So klinge ich.`, settings.value)
}

async function save() {
  error.value = undefined
  const name = form.name.trim()
  if (!name) {
    error.value = 'Bitte einen Namen eingeben.'
    return
  }
  saving.value = true
  try {
    const s: ProfileSettings = {
      ...settings.value,
      unlockedGrades: settings.value.unlockedGrades.filter((g) => g > form.grade),
    }
    if (isNew.value) {
      const profile = await store.createProfile({ ...form, name })
      await store.updateSettings(profile.id, s)
    } else if (existing.value) {
      const before = existing.value
      const schoolChanged = before.land !== form.land || before.grade !== form.grade
      const applyDefaults =
        schoolChanged &&
        window.confirm(
          `Sollen die Einstellungen auf die Startwerte für Klasse ${form.grade} ` +
            `(${land.value?.name ?? form.land}) gesetzt werden?\n\n` +
            'Der Lernfortschritt bleibt in jedem Fall erhalten.',
        )
      await store.updateProfile({ ...before, ...form, name }, applyDefaults)
      await store.updateSettings(
        before.id,
        applyDefaults ? { sound: s.sound, voiceURI: s.voiceURI, speechRate: s.speechRate } : s,
      )
    }
    await router.push({ name: 'parent' })
  } finally {
    saving.value = false
  }
}

async function remove() {
  const p = existing.value
  if (!p) return
  const ok = window.confirm(
    `Profil „${p.name}“ mit allen Sternen, Kronen und dem Lernfortschritt löschen?\n\n` +
      'Das kann nicht rückgängig gemacht werden.',
  )
  if (!ok) return
  await store.removeProfile(p.id)
  await router.push({ name: 'parent' })
}
</script>

<template>
  <header class="top">
    <RouterLink class="icon-btn" :to="{ name: 'parent' }" aria-label="Zurück">←</RouterLink>
    <h1>{{ isNew ? 'Neues Profil' : 'Profil bearbeiten' }}</h1>
  </header>

  <form @submit.prevent="save">
    <section class="card">
      <h2>Kind</h2>
      <label>
        Name
        <input v-model="form.name" type="text" maxlength="20" autocomplete="off" required />
      </label>

      <fieldset>
        <legend>Bild</legend>
        <div class="avatars">
          <button
            v-for="a in AVATARS"
            :key="a.code"
            type="button"
            class="avatar"
            :class="{ selected: form.avatar === a.code }"
            :aria-pressed="form.avatar === a.code"
            @click="form.avatar = a.code"
          >
            <EmojiPicture :code="a.code" :size="40" :label="a.label" />
          </button>
        </div>
      </fieldset>

      <label>
        Bundesland
        <select v-model="form.land">
          <option v-for="l in LAENDER" :key="l.code" :value="l.code" :disabled="!l.enabled">
            {{ l.name }}{{ l.enabled ? '' : ' (kommt später)' }}
          </option>
        </select>
      </label>

      <label>
        Klasse
        <select v-model.number="form.grade">
          <option v-for="g in grades" :key="g" :value="g">
            Klasse {{ g }}{{ gradeHasContent(form.land, g) ? '' : ' (noch ohne Übungen)' }}
          </option>
        </select>
      </label>
    </section>

    <section v-if="higherGrades.length > 0" class="card">
      <h2>Höhere Klassen freischalten</h2>
      <p class="muted">Die Klassen darunter stehen immer zum Wiederholen bereit.</p>
      <label v-for="g in higherGrades" :key="g" class="check">
        <input
          type="checkbox"
          :checked="settings.unlockedGrades.includes(g)"
          @change="toggleGrade(g, ($event.target as HTMLInputElement).checked)"
        />
        Klasse {{ g }}
      </label>
    </section>

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
        <strong>{{ readableSyllables }}</strong> Silben zum Lesen.
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

    <section v-if="hasRechnen" class="card">
      <h2>Rechnen</h2>
      <label>
        Zahlenraum
        <select v-model.number="settings.numberRange">
          <option v-for="n in numberRanges" :key="n" :value="n">bis {{ n }}</option>
        </select>
      </label>
      <label class="check">
        <input v-model="settings.allowMinus" type="checkbox" />
        Minus-Aufgaben
      </label>
      <label v-if="settings.numberRange >= 20" class="check">
        <input v-model="settings.tenCrossing" type="checkbox" />
        Mit Zehnerübergang (z. B. 8 + 5, 13 − 5)
      </label>
    </section>

    <section class="card">
      <h2>Einheit</h2>
      <label>
        Aufgaben pro Einheit
        <select v-model.number="settings.tasksPerUnit">
          <option v-for="n in [6, 7, 8, 9, 10]" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
      <label>
        Krone ab
        <select v-model.number="crownStars">
          <option :value="0">immer (für jede fertige Einheit)</option>
          <option v-for="n in settings.tasksPerUnit" :key="n" :value="n">
            {{ n }} von {{ settings.tasksPerUnit }} Sternen
          </option>
        </select>
      </label>
      <label class="check">
        <input v-model="settings.sound" type="checkbox" />
        Töne bei richtig und falsch
      </label>
    </section>

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
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="actions">
      <button type="submit" class="btn btn-primary" :disabled="saving">Speichern</button>
      <RouterLink class="btn" :to="{ name: 'parent' }">Abbrechen</RouterLink>
    </div>

    <section v-if="!isNew" class="card danger">
      <h2>Profil löschen</h2>
      <button type="button" class="btn btn-danger" @click="remove">Profil löschen</button>
    </section>
  </form>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card {
  margin-top: 16px;
}

h2 {
  margin-top: 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

label.check {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-height: 48px;
}

.check input {
  width: 28px;
  height: 28px;
}

input[type='text'],
select {
  width: 100%;
  min-width: 0;
  min-height: 52px;
  padding: 0 12px;
  border: 2px solid var(--accent);
  border-radius: 12px;
  background: #fff;
}

fieldset {
  margin: 0 0 14px;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 4px;
}

.avatars {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 8px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 3px solid transparent;
  border-radius: 16px;
  background: var(--bg);
}

.avatar.selected {
  border-color: var(--accent-strong);
  background: #ffe8b0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.error {
  color: var(--error);
}

.danger {
  margin-top: 32px;
}

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
