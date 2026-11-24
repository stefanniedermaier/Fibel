<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { getLand } from '@/core/content'
import { applyUpdate, needRefresh } from '@/core/pwa'
import { backupDue, lastBackup } from '@/core/storage/backup'
import { getDb } from '@/core/storage/db'
import {
  APP_VERSION,
  BUILD_TIME,
  fetchLatestVersion,
  isNewer,
  type VersionInfo,
} from '@/core/version'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

/** Test builds share a version number – the build time tells them apart. */
function formatBuild(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '–'
  return date.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
}

function hasUpdate(info: VersionInfo): boolean {
  return (
    isNewer(info.version, APP_VERSION) ||
    (info.version === APP_VERSION && info.builtAt > BUILD_TIME)
  )
}

const remindBackup = ref(false)
const latest = ref<VersionInfo | null>()
onMounted(async () => {
  const db = await getDb()
  remindBackup.value = backupDue(await lastBackup(db), await db.count('sessions'))
  latest.value = await fetchLatestVersion()
})
</script>

<template>
  <header class="top">
    <RouterLink class="icon-btn" :to="store.active ? { name: 'home' } : { name: 'profiles' }"
      >🏠</RouterLink
    >
    <h1>Elternbereich</h1>
  </header>

  <section v-if="needRefresh" class="card update">
    <p>
      Eine neue Version der App ist da<template v-if="latest"> ({{ latest.version }})</template>.
    </p>
    <button class="btn btn-primary" @click="applyUpdate">Jetzt aktualisieren</button>
  </section>

  <section v-if="remindBackup" class="card reminder">
    <p>
      💾 Die letzte Sicherung ist länger als 30 Tage her – oder es gibt noch keine. Sichere die
      Sterne und den Lernstand, damit nichts verloren geht.
    </p>
    <RouterLink class="btn btn-primary" :to="{ name: 'backup' }">Jetzt sichern</RouterLink>
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
        <RouterLink
          class="icon-btn stats"
          :to="{ name: 'stats', params: { id: p.id } }"
          :aria-label="`Statistik von ${p.name}`"
          >📊</RouterLink
        >
      </li>
    </ul>
    <RouterLink class="btn" :to="{ name: 'profile-new' }">＋ Neues Profil</RouterLink>
  </section>

  <section class="card">
    <h2>Sicherung</h2>
    <p class="muted">Alle Daten als Datei speichern oder auf einem neuen Gerät wieder laden.</p>
    <RouterLink class="btn" :to="{ name: 'backup' }">Sicherung öffnen</RouterLink>
  </section>

  <section class="card">
    <h2>Gerät</h2>
    <p class="muted">Sprachausgabe, Offline-Betrieb und Speicher prüfen.</p>
    <RouterLink class="btn" :to="{ name: 'device-check' }">Gerätetest öffnen</RouterLink>
  </section>

  <section class="card">
    <h2>Version</h2>
    <p>
      Installiert: <strong>{{ APP_VERSION }}</strong>
      <span class="muted">&nbsp;· Stand {{ formatBuild(BUILD_TIME) }}</span
      ><br />
      Neueste:
      <template v-if="latest">
        <strong>{{ latest.version }}</strong>
        <span class="muted">&nbsp;· Stand {{ formatBuild(latest.builtAt) }}</span>
      </template>
      <span v-else-if="latest === null" class="muted">unbekannt (offline)</span>
      <span v-else class="muted">wird geprüft …</span>
      <span v-if="latest && hasUpdate(latest)" class="new"> – Update verfügbar</span>
    </p>
  </section>

  <section class="card">
    <h2>Wörter und Silben anhören</h2>
    <p class="muted">
      Alle Wörter und Silben der Übungen vorlesen lassen und markieren, was falsch klingt.
    </p>
    <RouterLink class="btn" :to="{ name: 'speech-check' }">Sprachtest öffnen</RouterLink>
  </section>

  <section class="card">
    <h2>Schrift-Vorlagen</h2>
    <p class="muted">
      So schreibt die App die Buchstaben beim Nachspuren vor: Reihenfolge und Richtung der Striche.
    </p>
    <RouterLink class="btn" :to="{ name: 'script-preview' }">Vorlagen ansehen</RouterLink>
  </section>

  <section class="card info">
    <h2>Info</h2>
    <p>
      Fibel speichert alles nur auf diesem Gerät. Es gibt kein Konto und keinen Server, und es
      werden keine Lern- oder Profildaten verschickt. Einzelheiten, auch zur Sprachausgabe:
      <RouterLink :to="{ name: 'privacy' }">Datenschutz</RouterLink>.
    </p>
    <p>
      Bilder, Schrift und Programmbibliotheken mit ihren Lizenzen:
      <RouterLink :to="{ name: 'about' }">Über Fibel</RouterLink>.
    </p>
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

.update,
.reminder {
  border: 3px solid var(--accent);
}

.profiles li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profiles .profile {
  flex: 1;
  min-width: 0;
}

.stats {
  flex: none;
  font-size: 24px;
}

.new {
  color: var(--ok);
  font-weight: 700;
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

.profiles li + li {
  border-top: 1px solid #eee2d0;
}

.info {
  font-size: 16px;
}

.info h3 {
  margin-bottom: 4px;
  font-size: 17px;
}

.info ul {
  margin: 0;
  padding-left: 20px;
}

.info li + li {
  margin-top: 6px;
}
</style>
