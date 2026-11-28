<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { TurmData } from './index'

defineProps<{ data: TurmData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const COLORS = ['#EA5A47', '#61B2E4', '#F1B31C', '#B1CC33']
</script>

<template>
  <div class="turm">
    <ChoiceButtons
      label-prefix="Turm"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="150"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <svg viewBox="0 0 120 160" width="140" height="186" aria-hidden="true">
          <path d="M4 150h112" stroke="#6A462F" stroke-width="4" stroke-linecap="round" />
          <template v-for="(p, i) in option.parts" :key="i">
            <circle
              v-if="p.kind === 'ball'"
              :cx="p.x + p.w / 2"
              :cy="p.y + p.h / 2"
              :r="p.w / 2"
              fill="#D0CFCE"
              stroke="#000"
              stroke-width="2"
            />
            <rect
              v-else
              :x="p.x"
              :y="p.y"
              :width="p.w"
              :height="p.h"
              rx="3"
              :fill="COLORS[i % COLORS.length]"
              stroke="#000"
              stroke-width="2"
            />
          </template>
        </svg>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.turm {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
