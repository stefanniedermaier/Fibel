<script setup lang="ts">
import { computed } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { catalogFor, visibleGrades } from '@/core/content'
import { availableEntries } from '@/core/session'
import { TOPICS, TOPIC_INFO } from '@/core/types'
import { getExercise } from '@/exercises/registry'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const tiles = computed(() => {
  const ctx = store.context
  if (!ctx) return []
  return TOPICS.map((topic) => ({
    topic,
    ...TOPIC_INFO[topic],
    available:
      availableEntries(catalogFor(ctx.land, ctx.grade, topic), ctx, getExercise).length > 0,
  }))
})

const otherGrades = computed(() => {
  if (!store.active || !store.settings) return undefined
  const v = visibleGrades(store.active, store.settings)
  if (v.lower.length === 0 && v.higher.length === 0) return undefined
  return v.higher.length > 0 ? 'Andere Klassen' : 'Wiederholen'
})
</script>

<template>
  <main v-if="store.active" class="page home">
    <header>
      <!-- The accessible names start with the visible text (WCAG 2.5.3 "Label in Name"). -->
      <RouterLink
        class="who"
        :to="{ name: 'profiles' }"
        :aria-label="`${store.active.name} – Profil wechseln`"
      >
        <EmojiPicture :code="store.active.avatar" :size="44" />
        <span class="name">{{ store.active.name }}</span>
      </RouterLink>
      <RouterLink
        class="rewards"
        :to="{ name: 'trophies' }"
        :aria-label="`⭐ ${store.totals.stars} 👑 ${store.totals.crowns} – meine Sterne und Kronen`"
      >
        <span>⭐ {{ store.totals.stars }}</span>
        <span>👑 {{ store.totals.crowns }}</span>
      </RouterLink>
    </header>

    <div class="tiles">
      <template v-for="t in tiles" :key="t.topic">
        <RouterLink
          v-if="t.available"
          class="tile"
          :to="{ name: 'session', params: { grade: store.active.grade, topic: t.topic } }"
        >
          <span class="icon" aria-hidden="true">{{ t.icon }}</span>
          <span>{{ t.label }}</span>
        </RouterLink>
        <div v-else class="tile disabled">
          <span class="icon" aria-hidden="true">{{ t.icon }}</span>
          <span>{{ t.label }}</span>
          <small>kommt bald</small>
        </div>
      </template>
      <RouterLink v-if="otherGrades" class="tile small" :to="{ name: 'grades' }">
        <span class="icon" aria-hidden="true">🔁</span>
        <span>{{ otherGrades }}</span>
      </RouterLink>
    </div>

    <footer>
      <RouterLink class="parents" :to="{ name: 'parent' }">Für Eltern</RouterLink>
    </footer>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: 100vh;
  min-height: 100dvh;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.who,
.rewards {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: var(--tap);
  padding: 4px 16px 4px 8px;
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
}

.who {
  flex: 0 1 auto;
  min-width: 0;
}

/* Long names are shortened with "…" instead of breaking mid-word. */
.who .name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rewards {
  flex: none;
  padding: 4px 16px;
  gap: 16px;
}

@media (max-width: 420px) {
  header {
    gap: 8px;
  }

  .who,
  .rewards {
    font-size: 20px;
  }

  .who {
    gap: 6px;
    padding-right: 12px;
  }

  .rewards {
    gap: 10px;
    padding: 4px 12px;
  }
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 190px;
  padding: 24px;
  border: 5px solid var(--accent);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 34px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 6px 0 var(--accent-strong);
}

.tile:active:not(.disabled) {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--accent-strong);
}

.tile.disabled {
  opacity: 0.5;
  box-shadow: none;
}

.tile.small {
  min-height: 120px;
  font-size: 26px;
}

.tile small {
  font-size: 18px;
  font-weight: 400;
  color: var(--muted);
}

.icon {
  font-size: 64px;
  line-height: 1;
}

footer {
  margin-top: auto;
  text-align: center;
}

.parents {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  color: var(--muted);
}
</style>
