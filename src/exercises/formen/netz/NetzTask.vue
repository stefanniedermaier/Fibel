<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { NetzData } from './index'

const props = defineProps<{ data: NetzData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const S = 56
const width = computed(() => Math.max(...props.data.rows.map((r) => r.length)))
const squares = computed(() =>
  props.data.rows.flatMap((row, r) =>
    [...row].flatMap((c, col) =>
      c === '#' ? [{ key: `${r},${col}`, x: col * S + 4, y: r * S + 4 }] : [],
    ),
  ),
)

// gegenueber: the squares themselves are the buttons.
const wrong = ref(new Set<string>())
const solved = ref(false)
watch(
  () => props.data,
  () => {
    wrong.value = new Set()
    solved.value = false
  },
)

function tap(key: string) {
  if (props.data.mode !== 'gegenueber' || key === props.data.marked) return
  if (props.locked || props.revealed || solved.value || wrong.value.has(key)) return
  if (key === props.data.correctKey) {
    solved.value = true
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, key])
    emit('answer', false)
  }
}

function fill(key: string) {
  if (key === props.data.marked) return '#F1B31C'
  if (
    props.data.mode === 'gegenueber' &&
    key === props.data.correctKey &&
    (solved.value || props.revealed)
  )
    return '#B1CC33'
  if (wrong.value.has(key)) return '#D0CFCE'
  return '#92D3F5'
}
</script>

<template>
  <div class="task">
    <svg
      class="net"
      :viewBox="`0 0 ${width * S + 8} ${data.rows.length * S + 8}`"
      :style="{ maxWidth: `${(width * S + 8) * 1.3}px` }"
      role="img"
      aria-label="Netz aus sechs Quadraten"
    >
      <rect
        v-for="(sq, i) in squares"
        :key="sq.key"
        :x="sq.x"
        :y="sq.y"
        :width="S"
        :height="S"
        :fill="fill(sq.key)"
        stroke="#000"
        stroke-width="3"
        :class="{ tap: data.mode === 'gegenueber' && sq.key !== data.marked }"
        :role="data.mode === 'gegenueber' && sq.key !== data.marked ? 'button' : undefined"
        :aria-label="
          data.mode === 'gegenueber' && sq.key !== data.marked ? `Quadrat ${i + 1}` : undefined
        "
        @click="tap(sq.key)"
      />
    </svg>
    <ChoiceButtons
      v-if="data.mode === 'ist-netz'"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="140"
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
  gap: 32px;
  width: 100%;
}

.net {
  width: 100%;
  height: auto;
  max-height: 45vh;
}

.tap {
  cursor: pointer;
}

.label {
  font-size: 28px;
  font-weight: 700;
}
</style>
