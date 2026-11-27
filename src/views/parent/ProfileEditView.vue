<script setup lang="ts">
import BackButton from '@/components/BackButton.vue'
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
import { LEVEL_KEY as REIHEN_LEVEL_KEY } from '@/exercises/rechnen/reihen'
import { CLOCK_LEVEL_KEY } from '@/exercises/uhr/time'
import {
  DEFAULT_LAND,
  LAENDER,
  catalogFor,
  getLand,
  gradeHasContent,
  resolveDefaults,
  unitEnabled,
  unitsFor,
} from '@/core/content'
import { plain } from '@/core/plain'
import { readableSentences } from '@/core/saetze'
import { cleanLernwoerter } from '@/exercises/schreiben/diktat'
import { MUELLTONNEN, THEMEN } from '@/exercises/sache/shared'
import { say } from '@/core/speech'
import { loadVoices, rankGermanVoices } from '@/core/tts'
import { TOPICS, TOPIC_INFO, type ProfileSettings, type Topic } from '@/core/types'
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
const readableSentenceCount = computed(
  () => readableSentences(form.land, form.grade, settings.value).length,
)

// Lernwörter: one per line or separated by commas; cleaned when saved.
const lernwoerterText = computed({
  get: () => settings.value.lernwoerter.join('\n'),
  set: (text: string) => (settings.value.lernwoerter = text.split(/[\n,;]+/)),
})

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

/** A level set by hand (0 = automatic), stored in settings.levels[key]. */
function levelSetting(key: string) {
  return computed({
    get: () => settings.value.levels[key] ?? 0,
    set: (level: number) => {
      const levels = { ...settings.value.levels }
      if (level === 0) delete levels[key]
      else levels[key] = level
      settings.value.levels = levels
    },
  })
}
const reihenLevelSetting = levelSetting(REIHEN_LEVEL_KEY)
const clockLevelSetting = levelSetting(CLOCK_LEVEL_KEY)

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
const hasUhr = computed(() => catalogFor(form.land, form.grade, 'uhr').length > 0)
const hasSchreiben = computed(() => catalogFor(form.land, form.grade, 'schreiben').length > 0)
/** Number ranges up to the grade's start value (grade 1: 10 and 20). */
const numberRanges = computed(() => {
  const start = resolveDefaults(form.land, form.grade).numberRange
  return [10, 20, 100, 1000, 1000000].filter((n) => n <= Math.max(start, 20))
})

// --- Teaching units (plaene/README.md, section 4) ---------------------------
const unitGroups = computed(() =>
  TOPICS.map((topic) => ({
    topic,
    ...TOPIC_INFO[topic],
    units: unitsFor(form.grade, topic),
  })).filter((g) => g.units.length > 0),
)

// Focus of the week: one unit per subject gets about half of the mixed tasks.
const DAY = 24 * 60 * 60 * 1000
function focusOf(topic: Topic): string {
  const f = settings.value.focus?.[topic]
  return f && f.until > Date.now() ? f.unit : ''
}
function focusDays(topic: Topic): string {
  const f = settings.value.focus?.[topic]
  if (!f || f.until <= Date.now()) return ''
  return new Date(f.until).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
function setFocus(topic: Topic, unit: string, days = 7) {
  const focus = { ...settings.value.focus }
  if (unit) focus[topic] = { unit, until: Date.now() + days * DAY }
  else delete focus[topic]
  settings.value.focus = focus
}

// HSU: a task to do together per theme, and the waste bins at home.
function forscherauftrag(unitId: string): string | undefined {
  return THEMEN.find((t) => `k1.sache.${t.id}` === unitId)?.forscherauftrag
}
function toggleTonne(id: string, on: boolean) {
  const set = new Set(settings.value.muelltonnen)
  if (on) set.add(id)
  else set.delete(id)
  settings.value.muelltonnen = MUELLTONNEN.map((t) => t.id).filter((t) => set.has(t))
}
const hasMuell = computed(() =>
  unitsFor(form.grade, 'sache').some((u) => u.id === 'k1.sache.muell'),
)

function toggleUnit(id: string, on: boolean) {
  settings.value.units = { ...settings.value.units, [id]: on }
}

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
      lernwoerter: cleanLernwoerter(settings.value.lernwoerter),
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
    <BackButton :to="{ name: 'parent' }" />
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

    <section v-if="unitGroups.length > 0" class="card">
      <h2>Einheiten</h2>
      <p class="muted">
        Was in der Schule schon dran war. Einheiten des 1. Halbjahrs sind von Anfang an an, die des
        2. Halbjahrs schalten Sie ein, sobald die Schule so weit ist.
      </p>
      <fieldset v-for="g in unitGroups" :key="g.topic" class="units">
        <legend>{{ g.icon }} {{ g.label }}</legend>
        <template v-for="u in g.units" :key="u.id">
          <label class="check">
            <input
              type="checkbox"
              :checked="unitEnabled(u.id, settings)"
              @change="toggleUnit(u.id, ($event.target as HTMLInputElement).checked)"
            />
            {{ u.title }} <small class="muted">{{ u.term }}. Halbjahr</small>
          </label>
          <p v-if="forscherauftrag(u.id)" class="muted small auftrag">
            🔎 Forscherauftrag: {{ forscherauftrag(u.id) }}
          </p>
        </template>
        <fieldset v-if="g.topic === 'sache' && hasMuell" class="tonnen">
          <legend>Müll trennen: Diese Tonnen gibt es bei uns</legend>
          <label v-for="t in MUELLTONNEN" :key="t.id" class="check">
            <input
              type="checkbox"
              :checked="settings.muelltonnen.includes(t.id)"
              @change="toggleTonne(t.id, ($event.target as HTMLInputElement).checked)"
            />
            {{ t.title }}
          </label>
        </fieldset>
        <label v-if="g.topic !== 'sache'" class="focus">
          🚩 Schwerpunkt (kommt in „Alles gemischt“ etwa in jeder zweiten Aufgabe)
          <select
            :value="focusOf(g.topic)"
            @change="setFocus(g.topic, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">kein Schwerpunkt</option>
            <option
              v-for="u in g.units.filter((x) => unitEnabled(x.id, settings))"
              :key="u.id"
              :value="u.id"
            >
              {{ u.title }}
            </option>
          </select>
        </label>
        <p v-if="g.topic !== 'sache' && focusOf(g.topic)" class="muted small">
          Gilt bis {{ focusDays(g.topic) }}.
          <button type="button" class="link" @click="setFocus(g.topic, focusOf(g.topic), 14)">
            Auf 2 Wochen verlängern
          </button>
        </p>
      </fieldset>
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
      <label>
        Reihen erkennen: Level
        <select v-model.number="reihenLevelSetting">
          <option :value="0">automatisch (steigt mit dem Lernfortschritt)</option>
          <option :value="1">1 – Formen im Wechsel (AB)</option>
          <option :value="2">2 – Formen-Muster (AAB, ABB, ABC)</option>
          <option :value="3">3 – Bilder-Muster, Lücke auch in der Mitte</option>
          <option :value="4">4 – Zahlenfolgen +1, +2, −1</option>
          <option :value="5">5 – größere Sprünge bis 20</option>
        </select>
      </label>
    </section>

    <section v-if="hasUhr" class="card">
      <h2>Uhr</h2>
      <label>
        Level
        <select v-model.number="clockLevelSetting">
          <option :value="0">automatisch (Klasse 1: bis halbe Stunden, Klasse 2 ab Viertel)</option>
          <option :value="1">1 – volle Stunden</option>
          <option :value="2">2 – halbe Stunden</option>
          <option :value="3">3 – Viertelstunden</option>
          <option :value="4">4 – 5-Minuten-Schritte</option>
          <option :value="5">5 – auf die Minute (nur lesen)</option>
        </select>
      </label>
    </section>

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
      <label>
        Sterne, Kronen und Statistik gelten
        <select v-model.number="settings.rewardDays">
          <option :value="14">14 Tage</option>
          <option :value="30">1 Monat</option>
        </select>
      </label>
      <p class="muted">
        Ältere Einheiten werden automatisch vom Gerät gelöscht. Der Lernstand (was schon sitzt)
        bleibt erhalten.
      </p>
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

.auftrag {
  margin: -4px 0 10px 36px;
}

.tonnen {
  margin: 8px 0;
}

.focus {
  margin-top: 8px;
}

.small {
  font-size: 15px;
}

button.link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-strong);
  font: inherit;
  text-decoration: underline;
}

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid var(--accent);
  border-radius: 12px;
  background: #fff;
  font: inherit;
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
