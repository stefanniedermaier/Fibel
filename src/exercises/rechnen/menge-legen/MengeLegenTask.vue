<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TenFrame from '@/components/TenFrame.vue'
import type { MengeLegenData } from './index'

const props = defineProps<{ data: MengeLegenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const pattern = ref<boolean[]>(Array(10).fill(false))
const state = ref<'idle' | 'wrong' | 'right'>('idle')
watch(
  () => props.data,
  () => {
    pattern.value = Array(10).fill(false)
    state.value = 'idle'
  },
)

const laid = computed(() => pattern.value.filter(Boolean).length)
const shown = computed(() =>
  props.revealed ? Array.from({ length: 10 }, (_, i) => i < props.data.count) : pattern.value,
)
const disabled = computed(() => props.locked || props.revealed || state.value === 'right')

function tap(index: number) {
  if (disabled.value) return
  state.value = 'idle'
  const next = [...pattern.value]
  next[index] = !next[index]
  pattern.value = next
}

function check() {
  if (disabled.value) return
  const correct = laid.value === props.data.count
  state.value = correct ? 'right' : 'wrong'
  emit('answer', correct)
}
</script>

<template>
  <div class="task">
    <p class="number">{{ data.count }}</p>
    <TenFrame :pattern="shown" :tappable="!disabled" @tap="tap" />
    <button
      type="button"
      class="check"
      :class="{ wrong: state === 'wrong', right: state === 'right' }"
      :disabled="disabled || laid === 0"
      aria-label="Fertig"
      @click="check"
    >
      ✓
    </button>
  </div>
</template>

<style scoped>
.task {
  gap: clamp(16px, 4vh, 32px);
  width: auto;
}

.number {
  margin: 0;
  font-size: clamp(64px, 18vw, 96px);
  font-weight: 700;
  line-height: 1;
}

.check {
  width: 96px;
  height: 96px;
  border: 5px solid var(--accent);
  border-radius: 50%;
  background: var(--accent);
  font-size: 48px;
  font-weight: 700;
  box-shadow: 0 6px 0 var(--accent-strong);
}

.check:disabled {
  opacity: 0.45;
  box-shadow: none;
}

.check.wrong {
  animation: shake 0.45s;
}

.check.right {
  border-color: var(--ok);
  background: #e6f6ea;
  opacity: 1;
}
</style>
