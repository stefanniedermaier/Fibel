<script setup lang="ts">
import { computed } from 'vue'

// Zehnerfeld (10 cells, 2 × 5) or Zwanzigerfeld (20 cells).
// - count: red counters, filled row by row
// - extra: blue counters after them (the second addend)
// - crossed: the last `crossed` red counters are crossed out (subtraction)
// - pattern + tappable: free filling by tapping cells ("Menge legen")
const props = withDefaults(
  defineProps<{
    count?: number
    extra?: number
    crossed?: number
    cells?: 10 | 20
    small?: boolean
    pattern?: readonly boolean[]
    tappable?: boolean
  }>(),
  { count: 0, extra: 0, crossed: 0, cells: 10, small: false, pattern: undefined, tappable: false },
)
const emit = defineEmits<{ tap: [index: number] }>()

type Cell = 'empty' | 'red' | 'blue' | 'crossed'
// Zehnerfeld: 2 × 5. Zwanzigerfeld: 2 × 10 (first ten on top, gap after five),
// as in the usual school material.
const perRow = computed(() => (props.cells === 20 ? 10 : 5))

const rows = computed(() =>
  Array.from({ length: 2 }, (_, r) =>
    Array.from({ length: perRow.value }, (_, c): { index: number; kind: Cell } => {
      const index = r * perRow.value + c
      if (props.pattern) return { index, kind: props.pattern[index] ? 'red' : 'empty' }
      if (index < props.count - props.crossed) return { index, kind: 'red' }
      if (index < props.count) return { index, kind: 'crossed' }
      if (index < props.count + props.extra) return { index, kind: 'blue' }
      return { index, kind: 'empty' }
    }),
  ),
)

const label = computed(() => {
  if (props.pattern) return `${props.pattern.filter(Boolean).length} Plättchen`
  return `${props.count + props.extra} Punkte`
})
</script>

<template>
  <div
    class="frame"
    :class="{ small, twenty: cells === 20 }"
    :role="tappable ? 'group' : 'img'"
    :aria-label="label"
  >
    <div v-for="(row, r) in rows" :key="r" class="row">
      <component
        :is="tappable ? 'button' : 'span'"
        v-for="(cell, c) in row"
        :key="cell.index"
        class="cell"
        :class="{ five: perRow === 10 && c === 5 }"
        :type="tappable ? 'button' : undefined"
        :aria-pressed="tappable ? cell.kind === 'red' : undefined"
        @click="tappable && emit('tap', cell.index)"
      >
        <span v-if="cell.kind !== 'empty'" class="dot" :class="cell.kind" />
      </component>
    </div>
  </div>
</template>

<style scoped>
.frame {
  --cell: clamp(48px, 13vw, 72px);
  display: inline-flex;
  flex-direction: column;
  border: 4px solid var(--text);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

/* Zwanzigerfeld: ten cells per row must fit a 360 px phone. */
.frame.twenty {
  --cell: clamp(24px, 7.6vw, 44px);
}

.frame.small {
  --cell: clamp(22px, 6vw, 32px);
  border-width: 3px;
  border-radius: 8px;
}

.row {
  display: flex;
}

.row + .row {
  border-top: 3px solid var(--text);
}

.small .row + .row {
  border-top-width: 2px;
}

/* Gap after five in the Zwanzigerfeld. */
.cell.five {
  border-left-width: 6px !important;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--cell);
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  background: transparent;
}

.cell + .cell {
  border-left: 3px solid var(--text);
}

.small .cell + .cell {
  border-left-width: 2px;
}

button.cell:active {
  background: #fff3d6;
}

.dot {
  position: relative;
  width: 72%;
  aspect-ratio: 1;
  border-radius: 50%;
}

.dot.red,
.dot.crossed {
  background: var(--syllable-b);
}

.dot.blue {
  background: var(--syllable-a);
}

.dot.crossed {
  opacity: 0.35;
}

.dot.crossed::before,
.dot.crossed::after {
  content: '';
  position: absolute;
  top: 45%;
  left: -10%;
  width: 120%;
  height: 12%;
  border-radius: 4px;
  background: var(--text);
  transform: rotate(45deg);
}

.dot.crossed::after {
  transform: rotate(-45deg);
}
</style>
