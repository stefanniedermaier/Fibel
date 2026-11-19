<script setup lang="ts">
import EmojiPicture from '@/components/EmojiPicture.vue'
import { getLand } from '@/core/content'
import { applyUpdate, needRefresh } from '@/core/pwa'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
</script>

<template>
  <header class="top">
    <RouterLink class="icon-btn" :to="store.active ? { name: 'home' } : { name: 'profiles' }"
      >🏠</RouterLink
    >
    <h1>Elternbereich</h1>
  </header>

  <section v-if="needRefresh" class="card update">
    <p>Eine neue Version der App ist da.</p>
    <button class="btn btn-primary" @click="applyUpdate">Jetzt aktualisieren</button>
  </section>

  <section class="card">
    <h2>Profile</h2>
    <p v-if="store.profiles.length === 0" class="muted">Noch kein Profil angelegt.</p>
    <ul class="profiles">
      <li v-for="p in store.profiles" :key="p.id">
        <RouterLink class="profile" :to="{ name: 'profile-edit', params: { id: p.id } }">
          <EmojiPicture :code="p.avatar" :size="40" />
          <span class="name">{{ p.name }}</span>
          <span class="muted">Klasse {{ p.grade }} · {{ getLand(p.land)?.name ?? p.land }}</span>
          <span aria-hidden="true">›</span>
        </RouterLink>
      </li>
    </ul>
    <RouterLink class="btn" :to="{ name: 'profile-new' }">＋ Neues Profil</RouterLink>
  </section>

  <section class="card">
    <h2>Gerät</h2>
    <p class="muted">Sprachausgabe, Offline-Betrieb und Speicher prüfen.</p>
    <RouterLink class="btn" :to="{ name: 'device-check' }">Gerätetest öffnen</RouterLink>
  </section>
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

.update {
  border: 3px solid var(--accent);
}

.profiles {
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
}

.profile {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'pic name arrow'
    'pic info arrow';
  align-items: center;
  column-gap: 12px;
  padding: 10px 0;
  color: var(--text);
  text-decoration: none;
}

.profile > :first-child {
  grid-area: pic;
}

.profile .name {
  grid-area: name;
  font-weight: 700;
  font-size: 22px;
  overflow-wrap: anywhere;
}

.profile .muted {
  grid-area: info;
}

.profile > :last-child {
  grid-area: arrow;
  font-size: 28px;
}

li + li {
  border-top: 1px solid #eee2d0;
}
</style>
