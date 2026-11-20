<script setup lang="ts">
import BackButton from '@/components/BackButton.vue'
import { onMounted, ref } from 'vue'
import {
  backupFileName,
  exportBackup,
  importBackup,
  lastBackup,
  markBackedUp,
  validateBackup,
} from '@/core/storage/backup'
import { getDb } from '@/core/storage/db'

// Backup as a file on the device (e.g. in "Downloads"). Restoring replaces all data,
// so it is confirmed first.
const last = ref<number>()
const message = ref<{ kind: 'ok' | 'error'; text: string }>()
const busy = ref(false)
const fileInput = ref<HTMLInputElement>()

onMounted(async () => {
  last.value = await lastBackup(await getDb())
})

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

async function save() {
  busy.value = true
  message.value = undefined
  try {
    const db = await getDb()
    const backup = await exportBackup(db)
    const blob = new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backupFileName()
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    await markBackedUp(db)
    last.value = Date.now()
    message.value = {
      kind: 'ok',
      text: `Gespeichert als „${a.download}“ (meist im Ordner „Downloads“). Bewahre die Datei gut auf, z. B. auf dem Computer.`,
    }
  } catch (e) {
    message.value = { kind: 'error', text: `Speichern hat nicht geklappt: ${(e as Error).message}` }
  } finally {
    busy.value = false
  }
}

async function restore(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  message.value = undefined
  try {
    const backup = validateBackup(JSON.parse(await file.text()))
    const date = new Date(backup.exportedAt).toLocaleDateString('de-DE')
    const ok = window.confirm(
      `Sicherung vom ${date} mit ${backup.data.profiles.length} Profil(en) laden?\n\n` +
        'Alle Daten auf diesem Gerät werden dabei ersetzt.',
    )
    if (!ok) return
    busy.value = true
    const result = await importBackup(await getDb(), backup)
    message.value = {
      kind: 'ok',
      text: `Geladen: ${result.profiles} Profil(e), ${result.sessions} Einheiten. Die App startet neu …`,
    }
    // Reload so every part of the app reads the restored data.
    setTimeout(() => window.location.reload(), 1500)
  } catch (e) {
    const text =
      e instanceof SyntaxError ? 'Die Datei ist keine gültige Sicherung.' : (e as Error).message
    message.value = { kind: 'error', text }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <header class="top">
    <BackButton :to="{ name: 'parent' }" />
    <h1>Sicherung</h1>
  </header>
  <p class="muted">
    Alle Profile, Sterne, Kronen und der Lernstand liegen nur auf diesem Gerät. Werden die
    Browser-Daten gelöscht oder die App entfernt, sind sie weg – außer du hast eine Sicherung.
  </p>

  <section class="card">
    <h2>Sicherung speichern</h2>
    <p>
      Letzte Sicherung:
      <strong>{{ last ? formatDate(last) : 'noch keine' }}</strong>
    </p>
    <button class="btn btn-primary" :disabled="busy" @click="save">💾 Jetzt sichern</button>
  </section>

  <section class="card">
    <h2>Sicherung laden</h2>
    <p class="muted">Zum Beispiel auf einem neuen Gerät. Ersetzt alle Daten auf diesem Gerät.</p>
    <button class="btn" :disabled="busy" @click="fileInput?.click()">📂 Datei auswählen</button>
    <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="restore" />
  </section>

  <p v-if="message" class="message" :class="message.kind" role="status">{{ message.text }}</p>
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

.message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 12px;
}

.message.ok {
  background: #e6f6ea;
  color: #1d6b34;
}

.message.error {
  background: #fde2df;
  color: var(--error);
}
</style>
