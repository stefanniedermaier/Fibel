<script setup lang="ts">
import { ref, watch } from 'vue'

// Large number keys for answers. Checks the input itself: right → green,
// wrong → shakes and clears. When the solution is revealed it is shown in the field.
const props = withDefaults(
  defineProps<{ answer: number; revealed: boolean; locked: boolean; maxDigits?: number }>(),
  { maxDigits: 2 },
)
const emit = defineEmits<{ answer: [correct: boolean] }>()

const input = ref('')
const state = ref<'idle' | 'wrong' | 'right'>('idle')

watch(
  () => props.answer,
  () => {
    input.value = ''
    state.value = 'idle'
  },
)

const disabled = () => props.locked || props.revealed || state.value === 'right'

function press(digit: string) {
  if (disabled() || input.value.length >= props.maxDigits) return
  state.value = 'idle'
  // No leading zeros ("07").
  input.value = input.value === '0' ? digit : input.value + digit
}

function erase() {
  if (disabled()) return
  state.value = 'idle'
  input.value = input.value.slice(0, -1)
}

function submit() {
  if (disabled() || input.value === '') return
  if (Number(input.value) === props.answer) {
    state.value = 'right'
    emit('answer', true)
  } else {
    state.value = 'wrong'
    emit('answer', false)
    setTimeout(() => {
      if (state.value === 'wrong') input.value = ''
    }, 500)
  }
}

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
</script>

<template>
  <div class="pad-wrap">
    <output
      class="display"
      :class="{ wrong: state === 'wrong', right: state === 'right' || revealed }"
      aria-live="polite"
      >{{ revealed ? answer : input || '?' }}</output
    >
    <div class="pad">
      <button v-for="d in digits" :key="d" type="button" class="key" @click="press(d)">
        {{ d }}
      </button>
      <button type="button" class="key small" aria-label="Löschen" @click="erase">⌫</button>
      <button type="button" class="key" @click="press('0')">0</button>
      <button
        type="button"
        class="key ok"
        aria-label="Fertig"
        :disabled="input === '' || revealed"
        @click="submit"
      >
        ✓
      </button>
    </div>
  </div>
</template>

<style scoped>
.pad-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.display {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  min-height: 72px;
  padding: 0 16px;
  border: 4px solid var(--accent);
  border-radius: 18px;
  background: var(--surface);
  font-size: 48px;
  font-weight: 700;
}

.display.wrong {
  border-color: var(--error);
  animation: shake 0.45s;
}

.display.right {
  border-color: var(--ok);
  background: #e6f6ea;
}

.pad {
  display: grid;
  grid-template-columns: repeat(3, clamp(64px, 20vw, 84px));
  gap: 8px;
}

.key {
  height: clamp(54px, 13vw, 68px);
  border: 3px solid var(--accent);
  border-radius: 16px;
  background: var(--surface);
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 4px 0 var(--accent-strong);
}

.key:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--accent-strong);
}

.key.small {
  font-size: 26px;
}

.key.ok {
  background: var(--accent);
}

.key:disabled {
  opacity: 0.45;
  box-shadow: none;
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
