<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import NumberLine from '@/components/NumberLine.vue'
import type { ZahlenstrahlData } from './index'

defineProps<{ data: ZahlenstrahlData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <p v-if="data.mode === 'nachbarn'" class="question" aria-hidden="true">
      <template v-if="data.side === 'vor'"><span class="gap">?</span> , {{ data.n }}</template>
      <template v-else>{{ data.n }} , <span class="gap">?</span></template>
    </p>
    <NumberLine :to="data.max" :mark="data.mode === 'ablesen' ? data.n : undefined" />
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="number">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.question {
  margin: 0;
  font-size: clamp(40px, 11vw, 64px);
  font-weight: 700;
}

.gap {
  color: var(--accent-strong);
}

.number {
  font-size: 44px;
  font-weight: 700;
}
</style>
