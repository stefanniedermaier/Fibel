<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Placeholder for phase 0. Profiles, subjects and sessions follow in phase 1.
const topics = [
  { id: 'lesen', label: 'Lesen', icon: '📖' },
  { id: 'schreiben', label: 'Schreiben', icon: '✏️' },
  { id: 'rechnen', label: 'Rechnen', icon: '🔢' },
]
</script>

<template>
  <main class="home">
    <h1>Fibel</h1>
    <div class="tiles">
      <button v-for="t in topics" :key="t.id" class="tile" disabled>
        <span class="icon" aria-hidden="true">{{ t.icon }}</span>
        <span>{{ t.label }}</span>
        <small>kommt bald</small>
      </button>
    </div>
    <RouterLink class="device-check" to="/geraetetest">Gerätetest</RouterLink>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 32px 16px;
}

h1 {
  font-size: 48px;
  margin: 0;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 820px;
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 180px;
  padding: 24px;
  border: 4px solid var(--accent);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 32px;
  font-weight: 700;
}

.tile:disabled {
  opacity: 0.6;
  cursor: default;
}

.tile small {
  font-size: 16px;
  font-weight: 400;
  color: var(--muted);
}

.icon {
  font-size: 64px;
  line-height: 1;
}

.device-check {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  padding: 0 24px;
  color: var(--muted);
}
</style>
