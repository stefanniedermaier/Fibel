<script setup lang="ts">
import { computed } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { AblesenData } from './index'

const props = defineProps<{ data: AblesenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// Ruler: 10 cm with millimetres.
const MM = 6
const PAD = 16
const rx = (mm: number) => PAD + mm * MM
const RULER_W = PAD * 2 + 100 * MM

// Scale: 0 to 1000 g on a three-quarter circle.
const CX = 150
const CY = 150
const R = 110
const angle = (g: number) => ((-225 + (g / 1000) * 270) * Math.PI) / 180
const at = (g: number, r: number) => ({
  x: CX + r * Math.cos(angle(g)),
  y: CY + r * Math.sin(angle(g)),
})
const pointer = computed(() => at(props.data.value, R + 14))

// Jug: 0 to 1000 ml, 30 px per 100 ml.
const JUG_BOTTOM = 330
const jugY = (ml: number) => JUG_BOTTOM - ml * 0.3
</script>

<template>
  <div class="task">
    <svg
      v-if="data.instrument === 'lineal'"
      class="pic wide"
      :viewBox="`0 0 ${RULER_W} 130`"
      role="img"
      aria-label="Stift am Lineal"
    >
      <rect
        :x="rx(0)"
        y="12"
        :width="data.value * MM - 14"
        height="26"
        rx="4"
        fill="#61B2E4"
        stroke="#000"
        stroke-width="2"
      />
      <path
        :d="`M${rx(data.value) - 14} 12L${rx(data.value)} 25L${rx(data.value) - 14} 38Z`"
        fill="#F4D6A0"
        stroke="#000"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <rect
        x="4"
        y="48"
        :width="RULER_W - 8"
        height="74"
        rx="6"
        fill="#FCEA9E"
        stroke="#000"
        stroke-width="2"
      />
      <g v-for="i in 101" :key="i">
        <line
          :x1="rx(i - 1)"
          :x2="rx(i - 1)"
          y1="48"
          :y2="(i - 1) % 10 === 0 ? 78 : (i - 1) % 5 === 0 ? 68 : 60"
          stroke="#000"
          :stroke-width="(i - 1) % 10 === 0 ? 2 : 1"
        />
        <text
          v-if="(i - 1) % 10 === 0"
          :x="rx(i - 1)"
          y="104"
          text-anchor="middle"
          font-size="20"
          font-weight="700"
        >
          {{ (i - 1) / 10 }}
        </text>
      </g>
      <text :x="RULER_W - 34" y="118" font-size="14">cm</text>
    </svg>

    <div v-else-if="data.instrument === 'waage'" class="scale">
      <EmojiPicture code="1F34E" :size="48" class="load" />
      <svg class="pic" viewBox="0 0 300 300" role="img" aria-label="Küchenwaage">
        <circle :cx="CX" :cy="CY" r="140" fill="#fff" stroke="#000" stroke-width="3" />
        <g v-for="i in 21" :key="i">
          <line
            :x1="at((i - 1) * 50, R).x"
            :y1="at((i - 1) * 50, R).y"
            :x2="at((i - 1) * 50, (i - 1) % 2 === 0 ? R + 22 : R + 12).x"
            :y2="at((i - 1) * 50, (i - 1) % 2 === 0 ? R + 22 : R + 12).y"
            stroke="#000"
            :stroke-width="(i - 1) % 2 === 0 ? 3 : 2"
          />
          <text
            v-if="(i - 1) % 2 === 0"
            :x="at((i - 1) * 50, R - 22).x"
            :y="at((i - 1) * 50, R - 22).y + 5"
            text-anchor="middle"
            font-size="15"
            font-weight="700"
          >
            {{ (i - 1) * 50 }}
          </text>
        </g>
        <text :x="CX" :y="CY + 60" text-anchor="middle" font-size="18">g</text>
        <line
          :x1="CX"
          :y1="CY"
          :x2="pointer.x"
          :y2="pointer.y"
          stroke="#D22F27"
          stroke-width="5"
          stroke-linecap="round"
        />
        <circle :cx="CX" :cy="CY" r="8" fill="#D22F27" />
      </svg>
    </div>

    <svg v-else class="pic" viewBox="0 0 260 350" role="img" aria-label="Messbecher">
      <rect x="60" :y="jugY(data.value)" width="140" :height="data.value * 0.3" fill="#F4AA41" />
      <path
        d="M60 20 V330 H200 V20"
        fill="none"
        stroke="#000"
        stroke-width="4"
        stroke-linejoin="round"
      />
      <path d="M200 60 C240 60 240 160 200 160" fill="none" stroke="#000" stroke-width="4" />
      <g v-for="i in 20" :key="i">
        <line
          x1="60"
          :x2="i % 2 === 0 ? 100 : 82"
          :y1="jugY(i * 50)"
          :y2="jugY(i * 50)"
          stroke="#000"
          :stroke-width="i % 2 === 0 ? 3 : 2"
        />
        <text
          v-if="i % 2 === 0"
          x="56"
          :y="jugY(i * 50) + 5"
          text-anchor="end"
          font-size="15"
          font-weight="700"
        >
          {{ i * 50 }}
        </text>
      </g>
      <text x="110" y="45" font-size="16">ml</text>
    </svg>

    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="100"
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

.pic {
  width: 100%;
  max-width: min(260px, 30vh);
  height: auto;
}

.pic.wide {
  max-width: 640px;
}

.scale {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.label {
  font-size: 26px;
  font-weight: 700;
}
</style>
