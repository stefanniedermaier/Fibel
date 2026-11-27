<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import NumberInput from '@/components/NumberInput.vue'
import type { EinmaleinsData } from './index'

defineProps<{ data: EinmaleinsData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div
      v-if="data.mode === 'bild'"
      class="dots card"
      role="img"
      :aria-label="`${data.rows} Reihen mit je ${data.cols} Punkten`"
      :style="{ gridTemplateColumns: `repeat(${data.cols}, 1fr)` }"
    >
      <span v-for="i in (data.rows ?? 0) * (data.cols ?? 0)" :key="i" class="dot" />
    </div>
    <p v-else class="equation" aria-hidden="true">{{ data.task }} = <span class="gap">?</span></p>

    <ChoiceButtons
      v-if="data.choices"
      :options="data.choices"
      :correct-key="data.correctKey!"
      :revealed="revealed"
      :locked="locked"
      :min-width="130"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="label">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
    <NumberInput
      v-else
      :answer="data.answer"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    />
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(16px, 4vh, 32px);
  width: 100%;
}

.dots {
  display: grid;
  gap: 10px;
  padding: 16px 20px;
}

.dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ea5a47;
  border: 2px solid #000;
}

.equation {
  margin: 0;
  font-size: clamp(36px, min(12vw, 9dvh), 64px);
  font-weight: 700;
  white-space: nowrap;
}

.gap {
  color: var(--accent-strong);
}

.label {
  font-size: 30px;
  font-weight: 700;
}
</style>
