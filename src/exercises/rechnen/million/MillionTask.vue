<script setup lang="ts">
import { computed } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { MillionData } from './index'

const props = defineProps<{ data: MillionData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const HEADS = ['HT', 'ZT', 'T', 'H', 'Z', 'E']

// Number line: 600 wide, a tick per step, labels at both ends and every second tick.
const W = 600
const ticks = computed(() => {
  const s = props.data.strahl
  if (!s) return []
  const n = Math.round((s.to - s.from) / s.step)
  return Array.from({ length: n + 1 }, (_, i) => ({
    x: 20 + (i * (W - 40)) / n,
    v: s.from + i * s.step,
  }))
})
const markX = computed(() => {
  const s = props.data.strahl!
  return 20 + ((s.value - s.from) / (s.to - s.from)) * (W - 40)
})
const short = (v: number) =>
  v >= 1000000 ? '1 Mio.' : v % 1000 === 0 ? `${v / 1000} T` : String(v)
</script>

<template>
  <div class="task">
    <table v-if="data.digits" class="tafel card">
      <thead>
        <tr>
          <th v-for="h in HEADS" :key="h" :class="{ group: h === 'H' }">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-for="(d, i) in data.digits" :key="i" :class="{ group: i === 3 }">{{ d }}</td>
        </tr>
      </tbody>
    </table>
    <svg
      v-else-if="data.strahl"
      class="strahl"
      :viewBox="`0 0 ${W} 90`"
      role="img"
      aria-label="Zahlenstrahl"
    >
      <path :d="`M10 50H${W - 6}`" stroke="#000" stroke-width="3" />
      <path :d="`M${W - 14} 44l10 6l-10 6`" fill="none" stroke="#000" stroke-width="3" />
      <g v-for="(t, i) in ticks" :key="i">
        <path
          :d="`M${t.x} ${i % 5 === 0 ? 38 : 42}V${i % 5 === 0 ? 62 : 58}`"
          stroke="#000"
          stroke-width="2"
        />
        <text
          v-if="i === 0 || i === ticks.length - 1 || (data.strahl.step === 100000 && i % 5 === 0)"
          :x="t.x"
          y="82"
          text-anchor="middle"
          font-size="15"
          font-weight="700"
        >
          {{ short(t.v) }}
        </text>
      </g>
      <path :d="`M${markX} 8V34`" stroke="#D22F27" stroke-width="4" />
      <path :d="`M${markX - 8} 26l8 10l8 -10`" fill="#D22F27" />
    </svg>
    <p v-else-if="data.prompt" class="prompt">{{ data.prompt }}</p>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="data.choices[0]!.label.length > 2 ? 150 : 90"
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
  gap: 28px;
  width: 100%;
}

.tafel {
  border-collapse: collapse;
  font-size: 30px;
  font-weight: 700;
}

.tafel th,
.tafel td {
  width: 48px;
  padding: 6px 4px;
  text-align: center;
  border: 2px solid #3f3f3f;
}

.tafel th {
  font-size: 16px;
  background: #fcea9e;
}

.tafel .group {
  border-left-width: 5px;
}

.strahl {
  width: 100%;
  max-width: 640px;
  height: auto;
}

.prompt {
  margin: 0;
  font-size: 48px;
  font-weight: 700;
}

.label {
  font-size: 26px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
