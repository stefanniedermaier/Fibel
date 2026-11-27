<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { practiceCategories } from '@/core/practice'
import { stopSpeaking } from '@/core/speech'
import { TOPIC_INFO, type Topic } from '@/core/types'
import { getExercise } from '@/exercises/registry'
import { useAppStore } from '@/stores/app'

// A subject with its categories: "Alles gemischt" first, then one tile per category
// (plaene/README.md, section 4). Reached only when there are at least two categories.
const route = useRoute()
const store = useAppStore()
const grade = Number(route.params.grade)
const topic = route.params.topic as Topic
const info = TOPIC_INFO[topic]

const revision = computed(() => !!store.active && grade < store.active.grade)

const categories = computed(() => {
  const profile = store.active
  const settings = store.settings
  if (!profile || !settings) return []
  const ctx = { land: profile.land, grade, settings }
  return practiceCategories(ctx, topic, getExercise, { revision: revision.value })
})

/** "Alles gemischt, Hören oder Wörter lesen?" – the child cannot read the names yet. */
const question = computed(() => {
  const names = ['Alles gemischt', ...categories.value.map((c) => c.title)]
  const last = names.pop()
  return `Was möchtest du üben? ${names.join(', ')} oder ${last}?`
})

function speak() {
  void store.say(question.value)
}

onMounted(speak)
onUnmounted(stopSpeaking)
</script>

<template>
  <main class="page topic">
    <header>
      <RouterLink class="icon-btn" :to="{ name: revision ? 'grades' : 'home' }" aria-label="Zurück">
        🏠
      </RouterLink>
      <h1>
        <span aria-hidden="true">{{ info.icon }}</span> {{ info.label }}
        <small v-if="grade !== store.active?.grade" class="muted">Klasse {{ grade }}</small>
      </h1>
      <button class="icon-btn" type="button" aria-label="Vorlesen" @click="speak">🔊</button>
    </header>

    <div class="tiles">
      <RouterLink class="tile mixed" :to="{ name: 'session', params: { grade, topic } }">
        <span class="icon" aria-hidden="true">🎲</span>
        <span>Alles gemischt</span>
      </RouterLink>
      <RouterLink
        v-for="c in categories"
        :key="c.id"
        class="tile"
        :to="{ name: 'session', params: { grade, topic, category: c.id } }"
      >
        <span class="icon" aria-hidden="true">{{ c.icon }}</span>
        <span>{{ c.title }}</span>
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.topic {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

header {
  display: flex;
  align-items: center;
  gap: 16px;
}

h1 {
  flex: 1;
  margin: 0;
}

h1 small {
  font-size: 18px;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 150px;
  padding: 16px;
  border: 5px solid var(--accent);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 6px 0 var(--accent-strong);
}

.tile:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--accent-strong);
}

.tile.mixed {
  grid-column: 1 / -1;
  min-height: 130px;
  font-size: 30px;
}

.icon {
  font-size: 56px;
  line-height: 1;
}
</style>
