<script setup lang="ts">
import { useRouter } from 'vue-router'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { createRng } from '@/core/random'
import { phrase } from '@/core/speech'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()
const rng = createRng()

async function choose(id: string) {
  await store.selectProfile(id)
  const name = store.active?.name ?? ''
  void store.say(phrase('greeting', rng, { name }))
  await router.push({ name: 'home' })
}
</script>

<template>
  <main class="page profiles">
    <template v-if="store.profiles.length === 0">
      <h1>Willkommen bei Fibel!</h1>
      <p class="muted">
        Bevor es losgeht, legt ein Erwachsener ein Profil für das Kind an: Name, Bundesland und
        Klasse.
      </p>
      <RouterLink class="btn btn-primary" :to="{ name: 'profile-new' }">App einrichten</RouterLink>
    </template>

    <template v-else>
      <h1>Wer lernt heute?</h1>
      <div class="grid">
        <button v-for="p in store.profiles" :key="p.id" class="profile" @click="choose(p.id)">
          <EmojiPicture :code="p.avatar" :size="72" />
          <span class="name">{{ p.name }}</span>
          <span class="muted">Klasse {{ p.grade }}</span>
        </button>
      </div>
      <RouterLink class="parents" :to="{ name: 'parent' }">Für Eltern</RouterLink>
    </template>
    <RouterLink class="privacy-link" :to="{ name: 'privacy' }">Datenschutz</RouterLink>
  </main>
</template>

<style scoped>
.privacy-link {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  color: var(--muted);
}

.profiles {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-top: 48px;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: clamp(32px, 8vw, 48px);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  width: 100%;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 4px solid var(--accent);
  border-radius: var(--radius);
  background: var(--surface);
}

.name {
  font-size: 28px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.parents {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  color: var(--muted);
}
</style>
