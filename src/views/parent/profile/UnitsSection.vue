<script setup lang="ts">
import { computed } from 'vue'
import { unitEnabled, unitsFor } from '@/core/content'
import { TOPICS, TOPIC_INFO, type ProfileSettings, type Topic } from '@/core/types'
import { MUELLTONNEN, THEMEN, unitOf } from '@/exercises/sache/shared'

// Teaching units (plaene/README.md, section 4): on/off, focus of the week, HSU extras.
const props = defineProps<{ grade: number }>()
const settings = defineModel<ProfileSettings>('settings', { required: true })

const unitGroups = computed(() =>
  TOPICS.map((topic) => ({
    topic,
    ...TOPIC_INFO[topic],
    units: unitsFor(props.grade, topic),
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
  return THEMEN.find((t) => unitOf(t) === unitId)?.forscherauftrag
}
function toggleTonne(id: string, on: boolean) {
  const set = new Set(settings.value.muelltonnen)
  if (on) set.add(id)
  else set.delete(id)
  settings.value.muelltonnen = MUELLTONNEN.map((t) => t.id).filter((t) => set.has(t))
}
const hasMuell = computed(() =>
  unitsFor(props.grade, 'sache').some((u) => u.id === 'k1.sache.muell'),
)

function toggleUnit(id: string, on: boolean) {
  settings.value.units = { ...settings.value.units, [id]: on }
}
</script>

<template>
  <section v-if="unitGroups.length > 0" class="card">
    <h2>Einheiten</h2>
    <p class="muted">
      Was in der Schule schon dran war. Einheiten des 1. Halbjahrs sind von Anfang an an, die des 2.
      Halbjahrs schalten Sie ein, sobald die Schule so weit ist.
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
</template>

<style scoped>
.auftrag {
  margin: -4px 0 10px 36px;
}

.tonnen {
  margin: 8px 0;
}

.focus {
  margin-top: 8px;
}
</style>
