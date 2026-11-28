<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GrossKleinData } from './index'

const props = defineProps<{ data: GrossKleinData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// Tapped right: the word turns into its capital form. Tapped wrong: it shakes.
const found = ref(new Set<number>())
const shaking = ref<number>()
watch(
  () => props.data,
  () => (found.value = new Set()),
)

function tap(i: number) {
  if (props.locked || props.revealed || found.value.has(i)) return
  if (props.data.capitals.includes(i)) {
    found.value = new Set([...found.value, i])
    if (found.value.size === props.data.capitals.length) emit('answer', true)
  } else {
    shaking.value = i
    setTimeout(() => (shaking.value = undefined), 500)
    emit('answer', false)
  }
}
</script>

<template>
  <div class="gross-klein">
    <div class="words">
      <button
        v-for="(w, i) in data.words"
        :key="i"
        type="button"
        class="word"
        :class="{
          done: found.has(i) || (revealed && data.capitals.includes(i)),
          shake: shaking === i,
        }"
        @click="tap(i)"
      >
        {{ found.has(i) || (revealed && data.capitals.includes(i)) ? data.original[i] : w }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.words {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.word {
  min-height: var(--tap);
  padding: 6px 16px;
  border: 4px solid var(--accent);
  border-radius: 16px;
  background: var(--surface);
  font-size: clamp(30px, 8vw, 44px);
  font-weight: 700;
  box-shadow: 0 4px 0 var(--accent-strong);
}

.word.done {
  border-color: var(--ok);
  box-shadow: 0 4px 0 var(--ok);
}
</style>
