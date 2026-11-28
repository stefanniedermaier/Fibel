<script setup lang="ts">
import { computed } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { GebaeudeData } from './index'

const props = defineProps<{ data: GebaeudeData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// Oblique view: front faces are squares, depth goes up and to the right.
const S = 40
const D = 20
const rows = computed(() => props.data.plan.length)
const cols = computed(() => Math.max(...props.data.plan.map((r) => r.length)))
const height = computed(() => Math.max(...props.data.plan.flat()))
const W = computed(() => cols.value * S + rows.value * D + 8)
const H = computed(() => height.value * S + rows.value * D + 8)

/** Cubes in drawing order: back to front, left to right, bottom to top. */
const cubes = computed(() => {
  const out: { x: number; y: number; key: string }[] = []
  props.data.plan.forEach((row, r) =>
    row.forEach((h, c) => {
      for (let z = 0; z < h; z++) {
        const back = rows.value - 1 - r
        out.push({
          key: `${r}-${c}-${z}`,
          x: 4 + c * S + back * D,
          y: H.value - 4 - S - z * S - back * D,
        })
      }
    }),
  )
  return out
})

const face = (x: number, y: number) => `M${x} ${y}h${S}v${S}h${-S}Z`
const top = (x: number, y: number) => `M${x} ${y}l${D} ${-D}h${S}l${-D} ${D}Z`
const side = (x: number, y: number) => `M${x + S} ${y}l${D} ${-D}v${S}l${-D} ${D}Z`
</script>

<template>
  <div class="task">
    <svg class="building" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Würfelgebäude">
      <g v-for="c in cubes" :key="c.key" stroke="#000" stroke-width="2" stroke-linejoin="round">
        <path :d="face(c.x, c.y)" fill="#F4AA41" />
        <path :d="top(c.x, c.y)" fill="#FCEA9E" />
        <path :d="side(c.x, c.y)" fill="#E27022" />
      </g>
    </svg>
    <ChoiceButtons
      :label-prefix="data.mode === 'bauplan' ? 'Bauplan' : undefined"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="data.mode === 'bauplan' ? 84 : 96"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span v-if="option.label" class="label">{{ option.label }}</span>
        <table v-else-if="option.plan" class="plan">
          <tr v-for="(row, r) in option.plan" :key="r">
            <td v-for="(n, c) in row" :key="c" :class="{ empty: n === 0 }">{{ n || '' }}</td>
          </tr>
        </table>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: 28px;
}

.building {
  width: 100%;
  max-width: 300px;
  max-height: 38vh;
  height: auto;
}

.label {
  font-size: 32px;
  font-weight: 700;
}

.plan {
  border-collapse: collapse;
  margin: 4px;
}

.plan td {
  width: 24px;
  height: 24px;
  border: 2px solid #000;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  background: #fcea9e;
}

.plan td.empty {
  border-color: #ccc;
  background: transparent;
}
</style>
