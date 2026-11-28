<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { BlitzlesenData } from './index'

const props = defineProps<{ data: BlitzlesenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// First the word flashes up, then it is covered and the choices appear.
const visible = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined

function flash() {
  clearTimeout(timer)
  visible.value = true
  timer = setTimeout(() => (visible.value = false), props.data.showMs)
}

onMounted(flash)
onUnmounted(() => clearTimeout(timer))
watch(() => props.data, flash)
watch(
  () => props.revealed,
  (r) => {
    if (r) visible.value = true
  },
)
</script>

<template>
  <div class="task">
    <div class="flash card" :class="{ hidden: !visible }" aria-live="polite">
      <span v-if="visible" class="word">{{ data.word }}</span>
      <span v-else class="cover" aria-hidden="true">❓</span>
      <span v-if="visible && data.merkwort" class="badge">⭐ Merkwort</span>
    </div>
    <button v-if="!visible" type="button" class="btn again" @click="flash">
      👀 Nochmal zeigen
    </button>
    <ChoiceButtons
      v-if="!visible || revealed"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="choice-word">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.flash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 240px;
  min-height: 140px;
  padding: 16px 32px;
}

.word {
  font-size: 72px;
  font-weight: 700;
}

.cover {
  font-size: 64px;
}

.badge {
  font-size: 18px;
  color: var(--muted);
}

.choice-word {
  font-size: 40px;
  font-weight: 700;
}
</style>
