<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { Lage, OrnamentData } from './index'

defineProps<{ data: OrnamentData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const TRANSFORM: Record<Lage, string> = {
  normal: '',
  'spiegel-x': 'translate(40 0) scale(-1 1)',
  'spiegel-y': 'translate(0 40) scale(1 -1)',
  gedreht: 'rotate(180 20 20)',
}
</script>

<template>
  <div class="task">
    <svg
      class="band"
      :viewBox="`0 0 ${(data.band.length + 1) * 48 + 8} 56`"
      role="img"
      aria-label="Bandornament mit Lücke"
    >
      <rect
        x="2"
        y="2"
        :width="(data.band.length + 1) * 48 + 4"
        height="52"
        rx="6"
        fill="#fff"
        stroke="#000"
        stroke-width="2"
      />
      <g v-for="(lage, i) in data.band" :key="i" :transform="`translate(${8 + i * 48} 8)`">
        <path
          :d="data.motiv.d"
          :fill="data.motiv.color"
          stroke="#000"
          stroke-width="2"
          stroke-linejoin="round"
          :transform="TRANSFORM[lage]"
        />
      </g>
      <rect
        :x="8 + data.band.length * 48"
        y="8"
        width="40"
        height="40"
        rx="4"
        fill="none"
        stroke="#999"
        stroke-width="2"
        stroke-dasharray="5 4"
      />
      <text :x="28 + data.band.length * 48" y="36" text-anchor="middle" font-size="22" fill="#999">
        ?
      </text>
    </svg>
    <ChoiceButtons
      label-prefix="Muster"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <svg viewBox="-4 -4 48 48" width="72" height="72" aria-hidden="true">
          <path
            :d="data.motiv.d"
            :fill="data.motiv.color"
            stroke="#000"
            stroke-width="2"
            stroke-linejoin="round"
            :transform="TRANSFORM[option.key]"
          />
        </svg>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: 32px;
}

.band {
  width: 100%;
  max-width: 560px;
  height: auto;
}
</style>
