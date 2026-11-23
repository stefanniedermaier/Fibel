<script setup lang="ts">
import { computed } from 'vue'
import { TOPICS, TOPIC_INFO } from '@/core/types'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const SHELF_MAX = 60
// Stars and crowns expire (parent setting): the shelf shows the current period.
const period = computed(() =>
  (store.settings?.rewardDays ?? 14) >= 30 ? 'im letzten Monat' : 'in den letzten 14 Tagen',
)

const shelf = computed(() => Math.min(store.totals.crowns, SHELF_MAX))
const extra = computed(() => store.totals.crowns - shelf.value)
</script>

<template>
  <main class="page">
    <header>
      <RouterLink class="icon-btn" :to="{ name: 'home' }" aria-label="Zurück">🏠</RouterLink>
      <h1>Meine Schätze</h1>
    </header>

    <p class="period muted">Gesammelt {{ period }}</p>

    <section class="card totals">
      <div>
        <span class="big">⭐</span> {{ store.totals.stars }}
        {{ store.totals.stars === 1 ? 'Stern' : 'Sterne' }}
      </div>
      <div>
        <span class="big">👑</span> {{ store.totals.crowns }}
        {{ store.totals.crowns === 1 ? 'Krone' : 'Kronen' }}
      </div>
    </section>

    <section class="card">
      <h2>Kronen-Regal</h2>
      <p v-if="shelf === 0" class="muted">Hier stehen bald deine Kronen.</p>
      <div class="shelf">
        <span v-for="i in shelf" :key="i" class="crown">👑</span>
        <span v-if="extra > 0" class="more">+{{ extra }}</span>
      </div>
    </section>

    <section class="card">
      <h2>Nach Fächern</h2>
      <ul class="topics">
        <li v-for="t in TOPICS" :key="t">
          <span>{{ TOPIC_INFO[t].icon }} {{ TOPIC_INFO[t].label }}</span>
          <span>⭐ {{ store.totals.byTopic[t].stars }}</span>
          <span>👑 {{ store.totals.byTopic[t].crowns }}</span>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 16px;
}

section {
  margin-top: 16px;
}

.period {
  margin: 12px 0 0;
}

h2 {
  margin-top: 0;
}

.totals {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 40px;
  font-size: 28px;
  font-weight: 700;
}

.big {
  font-size: 40px;
}

.shelf {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 8px solid #b07b3e;
}

.crown {
  font-size: 40px;
}

.more {
  align-self: end;
  font-size: 24px;
  font-weight: 700;
}

.topics {
  margin: 0;
  padding: 0;
  list-style: none;
}

.topics li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  padding: 8px 0;
  font-size: 22px;
}

.topics li + li {
  border-top: 1px solid #eee2d0;
}
</style>
