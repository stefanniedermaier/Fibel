<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VokaleData } from './index'

const props = defineProps<{ data: VokaleData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const found = ref(new Set<number>())
const shaking = ref<number>()
watch(
  () => props.data,
  () => (found.value = new Set()),
)

function tap(i: number) {
  if (props.locked || props.revealed || found.value.has(i)) return
  if (props.data.vowels.includes(i)) {
    found.value = new Set([...found.value, i])
    if (found.value.size === props.data.vowels.length) emit('answer', true)
  } else {
    shaking.value = i
    setTimeout(() => (shaking.value = undefined), 500)
    emit('answer', false)
  }
}
</script>

<template>
  <div class="letters">
    <button
      v-for="(l, i) in data.letters"
      :key="i"
      type="button"
      class="letter"
      :class="{
        vowel: found.has(i) || (revealed && data.vowels.includes(i)),
        shake: shaking === i,
      }"
      @click="tap(i)"
    >
      {{ l }}
    </button>
  </div>
</template>

<style scoped>
.letters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.letter {
  min-width: 64px;
  min-height: 80px;
  border: 4px solid var(--accent);
  border-radius: 16px;
  background: var(--surface);
  font-size: 52px;
  font-weight: 700;
  box-shadow: 0 4px 0 var(--accent-strong);
}

.letter.vowel {
  border-color: #d33c2c;
  background: #fde3df;
  color: #b3261e;
  box-shadow: 0 4px 0 #b3261e;
}
</style>
