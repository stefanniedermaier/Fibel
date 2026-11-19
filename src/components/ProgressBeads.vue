<script setup lang="ts">
// Progress as a string of beads: one bead per task, no timer.
defineProps<{ total: number; results: readonly { star: boolean }[]; current: number }>()
</script>

<template>
  <ol class="beads" :aria-label="`Aufgabe ${current + 1} von ${total}`">
    <li
      v-for="i in total"
      :key="i"
      class="bead"
      :class="{
        star: results[i - 1]?.star,
        done: results[i - 1] && !results[i - 1]?.star,
        current: i - 1 === current && !results[i - 1],
      }"
    >
      <span v-if="results[i - 1]?.star" aria-hidden="true">⭐</span>
    </li>
  </ol>
</template>

<style scoped>
.beads {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(3px, 1vw, 6px);
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bead {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Up to 10 beads must fit between the two buttons on a 360 px phone. */
  width: clamp(14px, 4.2vw, 34px);
  aspect-ratio: 1;
  border: clamp(2px, 0.6vw, 3px) solid var(--accent);
  border-radius: 50%;
  background: var(--surface);
  font-size: clamp(14px, 4vw, 20px);
  line-height: 1;
}

.bead.current {
  border-color: var(--accent-strong);
  transform: scale(1.2);
}

.bead.star {
  border-color: transparent;
  background: transparent;
}

.bead.done {
  background: #eee2d0;
  border-color: #d9c7ad;
}
</style>
