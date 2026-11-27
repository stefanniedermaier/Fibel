<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import { RULER_CM, type LinealData } from './index'

defineProps<{ data: LinealData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const CM = 36
const PAD = 16
const x = (cm: number) => PAD + cm * CM
const W = PAD * 2 + RULER_CM * CM
</script>

<template>
  <div class="task">
    <svg class="ruler" :viewBox="`0 0 ${W} 130`" role="img" aria-label="Stift am Lineal">
      <!-- The pencil above the ruler. -->
      <rect
        :x="x(data.start)"
        y="12"
        :width="data.length * CM - 18"
        height="26"
        rx="4"
        :fill="data.color"
        stroke="#000"
        stroke-width="2"
      />
      <path
        :d="`M${x(data.start + data.length) - 18} 12L${x(data.start + data.length)} 25L${x(data.start + data.length) - 18} 38Z`"
        fill="#F4D6A0"
        stroke="#000"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <rect
        x="4"
        y="48"
        :width="W - 8"
        height="74"
        rx="6"
        fill="#FCEA9E"
        stroke="#000"
        stroke-width="2"
      />
      <g v-for="mm in RULER_CM * 2 + 1" :key="mm">
        <line
          :x1="x((mm - 1) / 2)"
          :x2="x((mm - 1) / 2)"
          y1="48"
          :y2="(mm - 1) % 2 === 0 ? 76 : 64"
          stroke="#000"
          stroke-width="2"
        />
        <text
          v-if="(mm - 1) % 2 === 0"
          :x="x((mm - 1) / 2)"
          y="104"
          text-anchor="middle"
          font-size="20"
          font-weight="700"
        >
          {{ (mm - 1) / 2 }}
        </text>
      </g>
      <text :x="W - 34" y="118" font-size="14">cm</text>
    </svg>
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

.ruler {
  width: 100%;
  max-width: 640px;
  height: auto;
}

.label {
  font-size: 28px;
  font-weight: 700;
}
</style>
