<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import { GRID_H, GRID_W, type FlaecheData } from './index'

defineProps<{ data: FlaecheData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const S = 30
const pos = (c: string) => c.split('-').map((v) => Number(v) * S + 4) as [number, number]
</script>

<template>
  <div class="task">
    <div class="figures">
      <figure v-for="(f, i) in data.figures" :key="i">
        <svg
          class="grid card"
          :viewBox="`0 0 ${GRID_W * S + 8} ${GRID_H * S + 8}`"
          role="img"
          :aria-label="f.label ? `Fläche ${f.label}` : 'Fläche aus Kästchen'"
        >
          <g stroke="#ddd" stroke-width="1">
            <path
              v-for="x in GRID_W + 1"
              :key="`x${x}`"
              :d="`M${(x - 1) * S + 4} 4v${GRID_H * S}`"
            />
            <path
              v-for="y in GRID_H + 1"
              :key="`y${y}`"
              :d="`M4 ${(y - 1) * S + 4}h${GRID_W * S}`"
            />
          </g>
          <rect
            v-for="c in f.cells"
            :key="c"
            :x="pos(c)[0]"
            :y="pos(c)[1]"
            :width="S"
            :height="S"
            :fill="f.color"
            stroke="#000"
            stroke-width="1.5"
          />
          <rect
            v-if="f.border"
            x="4"
            y="4"
            :width="(Math.max(...f.cells.map((c) => Number(c.split('-')[0]))) + 1) * S"
            :height="(Math.max(...f.cells.map((c) => Number(c.split('-')[1]))) + 1) * S"
            fill="none"
            stroke="#D22F27"
            stroke-width="5"
          />
        </svg>
        <figcaption v-if="f.label">{{ f.label }}</figcaption>
      </figure>
    </div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
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
  gap: 20px;
}

.figures {
  display: flex;
  gap: 16px;
  justify-content: center;
}

figure {
  margin: 0;
  text-align: center;
}

figcaption {
  font-size: 24px;
  font-weight: 700;
}

.grid {
  width: min(42vw, 200px);
  height: auto;
  padding: 6px;
}

.label {
  font-size: 28px;
  font-weight: 700;
}
</style>
