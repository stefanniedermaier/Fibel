<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { canPromptInstall, installed, promptInstall } from '@/core/pwa'

// Shown every time the app is opened in the browser (not installed yet), never during
// an exercise. "Später" hides it until the app is opened again.
const baseUrl = import.meta.env.BASE_URL
const route = useRoute()
const dismissed = ref(false)
const visible = computed(
  () => !installed.value && !dismissed.value && route.name !== 'session' && route.name != null,
)

async function install() {
  await promptInstall()
}
</script>

<template>
  <aside v-if="visible" class="install" aria-labelledby="install-title">
    <img class="logo" :src="`${baseUrl}logo.svg`" alt="" width="48" height="48" />
    <div class="text">
      <h2 id="install-title">Fibel als App installieren</h2>
      <p v-if="canPromptInstall">
        Dann startet Fibel wie eine App vom Startbildschirm, im Vollbild und auch ohne Internet.
      </p>
      <p v-else>
        Im Browser-Menü <strong>⋮</strong> „App installieren“ oder „Zum Startbildschirm hinzufügen“
        wählen. Dann startet Fibel im Vollbild und auch ohne Internet.
      </p>
    </div>
    <div class="actions">
      <button v-if="canPromptInstall" type="button" class="btn btn-primary" @click="install">
        Installieren
      </button>
      <button type="button" class="btn" @click="dismissed = true">Später</button>
    </div>
  </aside>
</template>

<style scoped>
.install {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 14px;
  align-items: center;
  max-width: 720px;
  margin: 12px auto 0;
  padding: 14px 16px;
  border: 3px solid var(--accent);
  border-radius: var(--radius);
  background: var(--surface);
}

.logo {
  width: 48px;
  height: 48px;
}

h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

p {
  margin: 0;
  font-size: 16px;
}

.actions {
  display: flex;
  grid-column: 1 / -1;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 400px) {
  .install {
    margin: 8px 8px 0;
  }
}
</style>
