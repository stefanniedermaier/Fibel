<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { cleanNumber } from '@/core/numbers'

// Number answers on the device's own number keyboard. A transparent <input> lies over
// the big display: tapping it opens the keyboard. Checks the input itself: right →
// green, wrong → shakes and clears. When the solution is revealed it is shown.
const props = withDefaults(
  defineProps<{ answer: number; revealed: boolean; locked: boolean; maxDigits?: number }>(),
  { maxDigits: undefined },
)
const emit = defineEmits<{ answer: [correct: boolean] }>()

// At least two digits, more when the answer needs them (100, 1000).
const digits = computed(() => props.maxDigits ?? Math.max(2, String(props.answer).length))

const field = ref<HTMLInputElement>()
const input = ref('')
const focused = ref(false)
const state = ref<'idle' | 'wrong' | 'right'>('idle')

const disabled = () => props.locked || props.revealed || state.value === 'right'

function setInput(value: string) {
  input.value = value
  if (field.value && field.value.value !== value) field.value.value = value
}

function focus() {
  if (!disabled()) field.value?.focus({ preventScroll: true })
}

onMounted(focus)

watch(
  () => props.answer,
  () => {
    setInput('')
    state.value = 'idle'
    void nextTick(focus)
  },
)

// Done (right or revealed): close the keyboard so the praise and the solution are visible.
watch(
  () => props.locked || props.revealed || state.value === 'right',
  (off) => {
    if (off) field.value?.blur()
  },
)

function onInput(e: Event) {
  state.value = 'idle'
  setInput(cleanNumber((e.target as HTMLInputElement).value, digits.value))
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
      if (state.value === 'wrong') setInput('')
    }, 500)
  }
}
</script>

<template>
  <!-- Field and ✓ side by side: with the keyboard open only half the screen is left. -->
  <form class="row" @submit.prevent="submit">
    <div
      class="display"
      :class="{ wrong: state === 'wrong', right: state === 'right' || revealed, focused }"
    >
      <span aria-hidden="true">{{ revealed ? answer : input || '?' }}</span>
      <input
        ref="field"
        class="native"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        enterkeyhint="done"
        autocomplete="off"
        aria-label="Ergebnis"
        :maxlength="digits"
        :disabled="disabled()"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
      />
    </div>
    <button type="submit" class="done" aria-label="Fertig" :disabled="input === '' || disabled()">
      ✓
    </button>
  </form>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.display {
  position: relative;
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

.display.focused {
  box-shadow: 0 0 0 4px #ffe8b0;
}

.display.wrong {
  border-color: var(--error);
  animation: shake 0.45s;
}

.display.right {
  border-color: var(--ok);
  background: #e6f6ea;
}

/* Invisible, but covers the display so a tap opens the keyboard. */
.native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  font-size: 16px; /* no zoom on focus */
  outline: none;
  opacity: 0.01;
}

.native::selection {
  background: transparent;
}

.done {
  min-width: 80px;
  height: var(--tap);
  border: 3px solid var(--accent);
  border-radius: 16px;
  background: var(--accent);
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 4px 0 var(--accent-strong);
}

.done:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--accent-strong);
}

.done:disabled {
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
