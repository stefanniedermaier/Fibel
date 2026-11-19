<script setup lang="ts">
import { computed } from 'vue'

// Zehnerfeld (10 cells, 2 × 5) or Zwanzigerfeld (20 cells) with filled counters.
const props = withDefaults(defineProps<{ count: number; cells?: 10 | 20 }>(), { cells: 10 })

const rows = computed(() => {
  const perRow = 5
  const rowCount = props.cells / perRow
  return Array.from({ length: rowCount }, (_, r) =>
    Array.from({ length: perRow }, (_, c) => {
      // Fill the first frame (rows 0–1) before the second (rows 2–3), row by row.
      const index = r * perRow + c
      return index < props.count
    }),
  )
})
</script>

<template>
  <div class="frame" role="img" :aria-label="`${count} Punkte`">
    <div v-for="(row, r) in rows" :key="r" class="row" :class="{ gap: r === 2 }">
      <span v-for="(filled, c) in row" :key="c" class="cell">
        <span v-if="filled" class="dot" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.frame {
  display: inline-flex;
  flex-direction: column;
  border: 4px solid var(--text);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.row {
  display: flex;
}

.row + .row {
  border-top: 3px solid var(--text);
}

.row.gap {
  border-top-width: 8px;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(48px, 13vw, 72px);
  aspect-ratio: 1;
}

.cell + .cell {
  border-left: 3px solid var(--text);
}

.dot {
  width: 72%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--syllable-b);
}
</style>
