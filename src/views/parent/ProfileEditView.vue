<script setup lang="ts">
import BackButton from '@/components/BackButton.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { AVATARS, DEFAULT_AVATAR } from '@/core/avatars'
import { LEVEL_KEY as REIHEN_LEVEL_KEY } from '@/exercises/rechnen/reihen'
import { CLOCK_LEVEL_KEY } from '@/exercises/uhr/time'
import {
  DEFAULT_LAND,
  LAENDER,
  catalogFor,
  getLand,
  gradeHasContent,
  resolveDefaults,
} from '@/core/content'
import { plain } from '@/core/plain'
import { cleanLernwoerter } from '@/exercises/schreiben/diktat'
import type { ProfileSettings } from '@/core/types'
import { useAppStore } from '@/stores/app'
import { levelSetting } from './profile/levels'
import ReadingSection from './profile/ReadingSection.vue'
import UnitsSection from './profile/UnitsSection.vue'
import VoiceSection from './profile/VoiceSection.vue'
import WritingSection from './profile/WritingSection.vue'
import './profile/settings-form.css'

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
      const keep = {
        voiceURI: settings.value.voiceURI,
        voiceURIEn: settings.value.voiceURIEn,
        schreibschrift: settings.value.schreibschrift,
        speechRate: settings.value.speechRate,
      }
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

const reihenLevelSetting = levelSetting(settings, REIHEN_LEVEL_KEY)
const clockLevelSetting = levelSetting(settings, CLOCK_LEVEL_KEY)

// --- Arithmetic --------------------------------------------------------------
const hasRechnen = computed(() => catalogFor(form.land, form.grade, 'rechnen').length > 0)
const hasUhr = computed(() => catalogFor(form.land, form.grade, 'uhr').length > 0)
const hasSchreiben = computed(() => catalogFor(form.land, form.grade, 'schreiben').length > 0)
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
        applyDefaults
          ? {
              sound: s.sound,
              voiceURI: s.voiceURI,
              voiceURIEn: s.voiceURIEn,
              schreibschrift: s.schreibschrift,
              speechRate: s.speechRate,
            }
          : s,
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

  <form class="settings-form" @submit.prevent="save">
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

    <UnitsSection v-model:settings="settings" :grade="form.grade" />

    <ReadingSection v-model:settings="settings" :land="form.land" :grade="form.grade" />

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

    <WritingSection v-model:settings="settings" :grade="form.grade" :has-schreiben="hasSchreiben" />

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

    <VoiceSection v-model:settings="settings" :name="form.name" :grade="form.grade" />

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
</style>
