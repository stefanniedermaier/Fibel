<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { WinkelData } from './index'

defineProps<{ data: WinkelData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ')
</script>

<template>
  <div class="task">
    <ChoiceButtons
      label-prefix="Bild"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="130"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <svg class="pic" viewBox="-10 -10 120 120" aria-hidden="true">
          <polygon
            v-if="option.closed"
            :points="pts(option.points)"
            fill="#92D3F5"
            stroke="#000"
            stroke-width="3"
            stroke-linejoin="round"
          />
          <polyline
            v-else
            :points="pts(option.points)"
            fill="none"
            stroke="#000"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  padding-top: 24px;
  gap: normal;
}

.pic {
  width: 110px;
  height: 110px;
}
</style>
