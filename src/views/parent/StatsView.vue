<script setup lang="ts">
import BackButton from '@/components/BackButton.vue'
import { computed, onMounted, ref } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { rewardTotals } from '@/core/session'
import { exerciseTitle, hitRates, itemLabel, lastDays, stumbles } from '@/core/stats'
import { getDb, listSessions, loadProgress } from '@/core/storage/db'
import { TOPIC_INFO, type ProgressRecord, type SessionRecord } from '@/core/types'
import { resolveWords } from '@/core/words'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ id: string }>()
const store = useAppStore()
const profile = computed(() => store.profiles.find((p) => p.id === props.id))

const sessions = ref<SessionRecord[]>([])
const progress = ref<ProgressRecord[]>([])
const loaded = ref(false)

onMounted(async () => {
  const db = await getDb()
  sessions.value = await listSessions(db, props.id)
  progress.value = [...(await loadProgress(db, props.id)).values()]
  loaded.value = true
})

const totals = computed(() => rewardTotals(sessions.value))
const totalMinutes = computed(() =>
  Math.round(sessions.value.reduce((sum, s) => sum + s.durationMs, 0) / 60_000),
)
const days = computed(() => lastDays(sessions.value))
const maxUnits = computed(() => Math.max(1, ...days.value.map((d) => d.units)))
const rates = computed(() => hitRates(sessions.value))

const words = computed(() => {
  const p = profile.value
  const map = new Map<string, string>()
  if (!p) return map
  for (const grade of [1, 2, 3, 4])
    for (const w of resolveWords(p.land, grade)) map.set(w.id, w.text)
  return map
})
const trouble = computed(() =>
  stumbles(progress.value).map((s) => ({
    ...s,
    label: itemLabel(s.itemKey, (id) => words.value.get(id)),
    title: exerciseTitle(s.exercise),
  })),
)
</script>

<template>
  <header class="top">
    <BackButton :to="{ name: 'parent' }" />
    <h1>Statistik</h1>
  </header>

  <template v-if="profile && loaded">
    <section class="card who">
      <EmojiPicture :code="profile.avatar" :size="48" />
      <div>
        <strong>{{ profile.name }}</strong>
        <div class="muted">Klasse {{ profile.grade }}</div>
      </div>
    </section>

    <section class="card summary">
      <div>
        <strong>{{ totals.units }}</strong><span>Einheiten</span>
      </div>
      <div>
        <strong>{{ totalMinutes }}</strong><span>Minuten</span>
      </div>
      <div>
        <strong>{{ totals.stars }}</strong><span>Sterne</span>
      </div>
      <div>
        <strong>{{ totals.crowns }}</strong><span>Kronen</span>
      </div>
    </section>

    <section class="card">
      <h2>Letzte 14 Tage</h2>
      <div class="bars" role="img" aria-label="Fertige Einheiten pro Tag in den letzten 14 Tagen">
        <div
          v-for="d in days"
          :key="d.day"
          class="bar"
          :title="`${d.day}: ${d.units} Einheiten, ${d.minutes} Min.`"
        >
          <span class="value">{{ d.units || '' }}</span>
          <span class="fill" :style="{ height: `${(d.units / maxUnits) * 100}%` }" />
          <span class="label">{{ d.label }}</span>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Trefferquote</h2>
      <p v-if="rates.length === 0" class="muted">Noch keine Aufgaben gelöst.</p>
      <ul class="rates">
        <li v-for="r in rates" :key="`${r.grade}-${r.topic}`">
          <span
            >{{ TOPIC_INFO[r.topic].icon }} {{ TOPIC_INFO[r.topic].label }} · Klasse
            {{ r.grade }}</span
          >
          <span class="meter"><span :style="{ width: `${Math.round(r.rate * 100)}%` }" /></span>
          <span class="pct">{{ Math.round(r.rate * 100) }} %</span>
        </li>
      </ul>
      <p class="muted small">
        Anteil der Aufgaben mit Stern, also ohne dass die Lösung gezeigt wurde.
      </p>
    </section>

    <section class="card">
      <h2>Stolpersteine</h2>
      <p v-if="trouble.length === 0" class="muted">Gerade nichts, was öfter danebengeht. 👍</p>
      <ul class="trouble">
        <li v-for="t in trouble" :key="t.itemKey">
          <strong>{{ t.label }}</strong>
          <span class="muted">{{ t.title }}</span>
          <span class="count">{{ t.wrong }}× falsch</span>
        </li>
      </ul>
      <p class="muted small">Diese Aufgaben kommen automatisch häufiger dran, bis sie sitzen.</p>
    </section>
  </template>
  <p v-else-if="loaded" class="muted">Profil nicht gefunden.</p>
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

.who {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  text-align: center;
}

.summary strong {
  display: block;
  font-size: 28px;
}

.summary span {
  font-size: 14px;
  color: var(--muted);
}

.bars {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  align-items: end;
  gap: 4px;
  height: 140px;
}

.bar {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.fill {
  width: 100%;
  min-height: 2px;
  border-radius: 6px 6px 0 0;
  background: var(--accent);
}

.value {
  font-size: 12px;
  font-weight: 700;
}

.label {
  margin-top: 4px;
  font-size: 11px;
  color: var(--muted);
}

.rates,
.trouble {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rates li {
  display: grid;
  grid-template-columns: 1fr 80px 48px;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.meter {
  height: 10px;
  border-radius: 5px;
  background: #eee2d0;
  overflow: hidden;
}

.meter span {
  display: block;
  height: 100%;
  background: var(--ok);
}

.pct {
  text-align: right;
  font-weight: 700;
}

.trouble li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0;
}

.trouble li + li,
.rates li + li {
  border-top: 1px solid #eee2d0;
}

.count {
  color: var(--error);
  font-weight: 700;
  white-space: nowrap;
}

.small {
  margin-bottom: 0;
  font-size: 14px;
}

@media (max-width: 420px) {
  .summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
