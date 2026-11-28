<script setup lang="ts">
// The digits 0–9 for written calculations.
const emit = defineEmits<{ digit: [d: number] }>()
</script>

<template>
  <div class="pad" role="group" aria-label="Ziffern">
    <button v-for="d in 10" :key="d" type="button" class="key" @click="emit('digit', d - 1)">
      {{ d - 1 }}
    </button>
  </div>
</template>

<style scoped>
.pad {
  display: grid;
  grid-template-columns: repeat(5, 60px);
  gap: 8px;
}

.key {
  height: 56px;
  border: 3px solid var(--accent);
  border-radius: 12px;
  background: var(--surface);
  font-size: 28px;
  font-weight: 700;
}
</style>
