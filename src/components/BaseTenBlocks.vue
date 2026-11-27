<script setup lang="ts">
import { computed } from 'vue'

// Dienes material: tens as rods of ten cubes, ones as single cubes (Zehnerstange, Einerwürfel).
const props = withDefaults(
  defineProps<{ tens: number; ones: number; hundreds?: number; size?: number }>(),
  { size: 18, hundreds: 0 },
)
const label = computed(
  () =>
    `${props.hundreds ? `${props.hundreds} Hunderter, ` : ''}${props.tens} Zehner, ${props.ones} Einer`,
)
</script>

<template>
  <div class="blocks" role="img" :aria-label="label" :style="{ '--s': `${size}px` }">
    <span v-for="h in hundreds" :key="`h${h}`" class="plate">
      <span v-for="c in 100" :key="c" class="cell" />
    </span>
    <span v-for="t in tens" :key="`t${t}`" class="rod">
      <span v-for="c in 10" :key="c" class="cube" />
    </span>
    <span class="ones">
      <span v-for="o in ones" :key="`o${o}`" class="cube single" />
    </span>
  </div>
</template>

<style scoped>
.blocks {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
  align-items: flex-end;
  gap: calc(var(--s) * 0.6);
  padding: 8px;
}

.rod {
  display: flex;
  flex-direction: column-reverse;
  border: 3px solid #1f5fa8;
  border-radius: 4px;
}

.cube {
  width: var(--s);
  height: var(--s);
  background: #5b9be0;
  border-top: 1px solid #1f5fa8;
}

.ones {
  display: grid;
  grid-template-columns: repeat(2, var(--s));
  gap: 4px;
  align-content: end;
}

.plate {
  display: grid;
  grid-template-columns: repeat(10, calc(var(--s) * 0.55));
  border: 3px solid #3d7a1f;
  border-radius: 4px;
}

.cell {
  width: calc(var(--s) * 0.55);
  height: calc(var(--s) * 0.55);
  background: #8cc265;
  outline: 1px solid #3d7a1f;
}

.cube.single {
  border: 3px solid #b3471d;
  border-radius: 4px;
  background: #f08a5d;
}
</style>
