<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import ClockFace from '@/components/ClockFace.vue'
import type { UhrLesenData } from './index'

defineProps<{ data: UhrLesenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <ClockFace :total="data.total" :minute-labels="data.minuteLabels" />
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="200"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="time">
          <span class="spoken">{{ option.spoken }}</span>
          <span class="digital">{{ option.digital }} Uhr</span>
        </span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: clamp(16px, 4vh, 32px);
}

.time {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.15;
}

.spoken {
  font-size: clamp(22px, 6vw, 30px);
  font-weight: 700;
}

.digital {
  font-size: clamp(16px, 4.5vw, 22px);
  color: var(--muted);
}
</style>
