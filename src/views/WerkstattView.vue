<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { stopSpeaking } from '@/core/speech'
import { useAppStore } from '@/stores/app'

// D15 Schreibwerkstatt (plaene/klasse-1-abgleich.md): the child types freely and the
// voice reads out exactly what is there – a feedback on the sounds, not a rating. The
// app cannot know the meant word, so it shows no correct spelling. No stars, and
// nothing is saved: the text is gone when the page is left.
const store = useAppStore()
const text = ref('')
const field = ref<HTMLTextAreaElement>()
const MAX = 300

const empty = computed(() => text.value.trim().length === 0)

function readAloud() {
  if (!empty.value) void store.say(text.value, 15000)
}

function clear() {
  stopSpeaking()
  text.value = ''
  field.value?.focus()
}

onMounted(() => {
  void store.say('Schreib, was du möchtest. Ich lese dir vor, was da steht.')
  field.value?.focus()
})
onUnmounted(stopSpeaking)
</script>

<template>
  <main class="page werkstatt">
    <header>
      <RouterLink
        class="icon-btn"
        :to="{ name: 'topic', params: { grade: store.active?.grade ?? 1, topic: 'schreiben' } }"
        aria-label="Zurück"
      >
        🏠
      </RouterLink>
      <h1><span aria-hidden="true">📝</span> Schreibwerkstatt</h1>
    </header>

    <textarea
      ref="field"
      v-model="text"
      class="field"
      :maxlength="MAX"
      rows="4"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="sentences"
      spellcheck="false"
      aria-label="Dein Text"
    />

    <div class="buttons">
      <button class="btn big" type="button" :disabled="empty" @click="readAloud">
        🔊 Vorlesen
      </button>
      <button class="btn" type="button" :disabled="empty" @click="clear">🧽 Neu</button>
    </div>
  </main>
</template>

<style scoped>
.werkstatt {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

header {
  display: flex;
  align-items: center;
  gap: 16px;
}

h1 {
  margin: 0;
}

.field {
  width: 100%;
  min-height: 160px;
  padding: 16px;
  border: 4px solid var(--accent);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 36px;
  line-height: 1.4;
  resize: vertical;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn.big {
  font-size: 26px;
  padding: 14px 28px;
}
</style>
