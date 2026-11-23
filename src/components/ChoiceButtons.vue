<script setup lang="ts" generic="T extends { key: string }">
import { ref, watch } from 'vue'

// Answer buttons shared by the exercises: a wrong choice shakes and gets greyed out,
// the right one turns green; when the solution is revealed it pulses.
const props = withDefaults(
  defineProps<{
    options: readonly T[]
    correctKey: string
    revealed: boolean
    locked: boolean
    /** Minimum button width in px. */
    minWidth?: number
    /**
     * For buttons without text (pictures, shapes): accessible names "Bild 1", "Bild 2" …
     * A neutral name, so a screen reader does not give the answer away.
     */
    labelPrefix?: string
  }>(),
  { minWidth: 96, labelPrefix: undefined },
)
const emit = defineEmits<{ answer: [correct: boolean] }>()
defineSlots<{ default(props: { option: T }): unknown }>()

const wrong = ref(new Set<string>())
const shaking = ref<string>()
const solved = ref(false)

watch(
  () => props.options,
  () => {
    wrong.value = new Set()
    solved.value = false
  },
)

function choose(option: T) {
  if (props.locked || props.revealed || solved.value || wrong.value.has(option.key)) return
  if (option.key === props.correctKey) {
    solved.value = true
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, option.key])
    shaking.value = option.key
    setTimeout(() => (shaking.value = undefined), 500)
    emit('answer', false)
  }
}
</script>

<template>
  <div class="choices" :style="{ '--min': `${minWidth}px` }">
    <button
      v-for="(option, i) in options"
      :key="option.key"
      class="choice"
      :aria-label="labelPrefix ? `${labelPrefix} ${i + 1}` : undefined"
      :class="{
        wrong: wrong.has(option.key),
        correct: (solved || revealed) && option.key === correctKey,
        shake: shaking === option.key,
      }"
      :disabled="wrong.has(option.key)"
      @click="choose(option)"
    >
      <slot :option="option" />
    </button>
  </div>
</template>

<style scoped>
.choices {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(10px, 3vw, 24px);
  width: 100%;
}

.choice {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: min(var(--min), 40vw);
  min-height: clamp(84px, 22vw, 120px);
  padding: 10px 14px;
  border: 5px solid var(--accent);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: 0 6px 0 var(--accent-strong);
  transition: transform 0.1s;
}

.choice:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--accent-strong);
}

.choice.wrong {
  opacity: 0.35;
  box-shadow: none;
}

.choice.correct {
  border-color: var(--ok);
  background: #e6f6ea;
  box-shadow: 0 6px 0 var(--ok);
  animation: pulse 0.9s ease-in-out infinite alternate;
}

.choice.shake {
  animation: shake 0.45s;
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

@keyframes pulse {
  to {
    transform: scale(1.06);
  }
}
</style>
