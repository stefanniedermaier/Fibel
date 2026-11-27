<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { HunderterData } from './index'

defineProps<{ data: HunderterData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div v-if="data.mode === 'tafel'" class="chart" aria-hidden="true">
      <span
        v-for="(c, i) in data.cells"
        :key="i"
        class="cell"
        :class="{ empty: c === null && i !== 4, gap: i === 4 }"
        >{{ i === 4 ? (revealed ? data.n : '?') : (c ?? '') }}</span
      >
    </div>
    <p v-else class="number" aria-hidden="true">{{ data.n }}</p>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="110"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="label">{{ option.label }}</span>
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

.chart {
  display: grid;
  grid-template-columns: repeat(3, 72px);
  grid-template-rows: repeat(3, 72px);
}

.cell {
  display: grid;
  place-items: center;
  border: 3px solid var(--text);
  margin: -1.5px;
  background: var(--surface);
  font-size: 30px;
  font-weight: 700;
}

.cell.empty {
  border-color: transparent;
  background: transparent;
}

.cell.gap {
  background: #fff5a8;
  color: var(--accent-strong);
}

.number {
  margin: 0;
  font-size: 72px;
  font-weight: 700;
}

.label {
  font-size: 28px;
  font-weight: 700;
}
</style>
