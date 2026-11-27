<script setup lang="ts">
import { computed } from 'vue'
import { visibleGrades } from '@/core/content'
import { practiceEntries, topicRoute } from '@/core/practice'
import { TOPICS, TOPIC_INFO, topicLabel } from '@/core/types'
import { getExercise } from '@/exercises/registry'
import { useAppStore } from '@/stores/app'

// Lower grades for revision plus higher grades the parents unlocked.
const store = useAppStore()

const groups = computed(() => {
  const profile = store.active
  const settings = store.settings
  if (!profile || !settings) return []
  const v = visibleGrades(profile, settings)
  return [...v.lower, ...v.higher].map((grade) => {
    const ctx = { land: profile.land, grade, settings }
    const options = { revision: grade < profile.grade }
    return {
      grade,
      lower: grade < profile.grade,
      topics: TOPICS.filter(
        (t) => practiceEntries(ctx, t, getExercise, undefined, options).length > 0,
      ).map((t) => ({
        topic: t,
        ...TOPIC_INFO[t],
        label: topicLabel(t, profile.land),
        to: topicRoute(ctx, t, getExercise, options),
      })),
    }
  })
})
</script>

<template>
  <main class="page">
    <header>
      <RouterLink class="icon-btn" :to="{ name: 'home' }" aria-label="Zurück">🏠</RouterLink>
      <h1>Andere Klassen</h1>
    </header>
    <section v-for="g in groups" :key="g.grade" class="card group">
      <h2>
        Klasse {{ g.grade }} <small class="muted">{{ g.lower ? 'wiederholen' : 'extra' }}</small>
      </h2>
      <p v-if="g.topics.length === 0" class="muted">Hier gibt es noch keine Übungen.</p>
      <div class="topics">
        <RouterLink v-for="t in g.topics" :key="t.topic" class="btn btn-primary" :to="t.to">
          {{ t.icon }} {{ t.label }}
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.group {
  margin-top: 16px;
}

h2 {
  margin-top: 0;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
