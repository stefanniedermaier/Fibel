<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { SatzzeichenData } from './index'

defineProps<{ data: SatzzeichenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <p class="sentence card">
      {{ data.text }}<span class="gap">{{ revealed ? data.correctKey : '_' }}</span>
    </p>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="mark" :aria-label="option.key === '.' ? 'Punkt' : 'Fragezeichen'">
          {{ option.label }}
        </span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: 28px;
}

.sentence {
  margin: 0;
  padding: 16px 28px;
  font-size: clamp(32px, 9vw, 52px);
  font-weight: 700;
  text-align: center;
}

.gap {
  color: var(--accent-strong);
}

.mark {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
}
</style>
