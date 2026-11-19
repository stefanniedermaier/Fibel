<script setup lang="ts">
import { computed } from 'vue'

// Dice face 1–6. Pip positions on a 3 × 3 grid (0 = top left … 8 = bottom right).
const props = defineProps<{ count: number }>()

const LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

const pips = computed(() => new Set(LAYOUTS[props.count] ?? []))
</script>

<template>
  <div class="die" role="img" :aria-label="`${count} Punkte`">
    <span v-for="i in 9" :key="i" class="slot">
      <span v-if="pips.has(i - 1)" class="pip" />
    </span>
  </div>
</template>

<style scoped>
.die {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6%;
  width: clamp(160px, 42vw, 220px);
  aspect-ratio: 1;
  padding: 12%;
  border: 4px solid var(--text);
  border-radius: 22%;
  background: #fff;
}

.slot {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pip {
  width: 80%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--text);
}
</style>
