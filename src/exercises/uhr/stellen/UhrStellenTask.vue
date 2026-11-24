<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ClockFace from '@/components/ClockFace.vue'
import { startTotal, type UhrStellenData } from './index'

const props = defineProps<{ data: UhrStellenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const total = ref(startTotal(props.data.target))
const moved = ref(false)
const state = ref<'idle' | 'wrong' | 'right'>('idle')
watch(
  () => props.data,
  (data) => {
    total.value = startTotal(data.target)
    moved.value = false
    state.value = 'idle'
  },
)
watch(
  () => props.revealed,
  (revealed) => {
    if (revealed) total.value = props.data.target
  },
)

const disabled = computed(() => props.locked || props.revealed || state.value === 'right')

function set(value: number) {
  if (disabled.value) return
  total.value = value
  moved.value = true
  state.value = 'idle'
}

function check() {
  if (disabled.value) return
  const correct = total.value === props.data.target
  state.value = correct ? 'right' : 'wrong'
  emit('answer', correct)
}
</script>

<template>
  <div class="task">
    <p class="target">
      <span class="spoken">{{ data.spoken }}</span>
      <span class="digital">{{ data.digital }} Uhr</span>
    </p>
    <ClockFace
      :total="total"
      :settable="!disabled"
      :snap="data.snap"
      label="Uhr zum Stellen"
      @update:total="set"
    />
    <button
      type="button"
      class="check"
      :class="{ wrong: state === 'wrong', right: state === 'right' || revealed }"
      :disabled="disabled || !moved"
      aria-label="Fertig"
      @click="check"
    >
      ✓
    </button>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 2.5vh, 24px);
  width: 100%;
  height: 100%;
}

.target {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  line-height: 1.15;
}

.spoken {
  font-size: clamp(28px, 8vw, 40px);
  font-weight: 700;
}

.digital {
  font-size: clamp(18px, 5vw, 24px);
  color: var(--muted);
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

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}
</style>
