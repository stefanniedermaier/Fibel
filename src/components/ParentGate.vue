<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import NumberInput from '@/components/NumberInput.vue'
import { createRng, randomInt } from '@/core/random'

// Parent gate: hold for 2 seconds, then solve a multiplication task for adults.
const emit = defineEmits<{ pass: [] }>()
const HOLD_MS = 2000
const rng = createRng()

const stage = ref<'hold' | 'question'>('hold')
const holding = ref(false)
const a = ref(0)
const b = ref(0)
const wrongAnswer = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function newQuestion() {
  a.value = randomInt(rng, 6, 9)
  b.value = randomInt(rng, 6, 9)
}

function startHold() {
  holding.value = true
  timer = setTimeout(() => {
    holding.value = false
    newQuestion()
    stage.value = 'question'
  }, HOLD_MS)
}

function cancelHold() {
  holding.value = false
  clearTimeout(timer)
}

// The answer is typed on the device's number keyboard (NumberInput checks it).
// Wrong: it shakes, then a new task appears.
let nextTimer: ReturnType<typeof setTimeout> | undefined
function answered(correct: boolean) {
  if (correct) {
    emit('pass')
    return
  }
  wrongAnswer.value = true
  nextTimer = setTimeout(newQuestion, 600)
}

onUnmounted(() => {
  clearTimeout(timer)
  clearTimeout(nextTimer)
})
</script>

<template>
  <div class="gate card">
    <template v-if="stage === 'hold'">
      <h2>Für Eltern</h2>
      <p class="muted">Knopf 2 Sekunden gedrückt halten.</p>
      <button
        class="hold"
        :class="{ holding }"
        @pointerdown="startHold"
        @pointerup="cancelHold"
        @pointerleave="cancelHold"
        @pointercancel="cancelHold"
        @contextmenu.prevent
      >
        <span class="fill" />
        <span class="label">Gedrückt halten</span>
      </button>
    </template>

    <template v-else>
      <h2>Wie viel ist {{ a }} × {{ b }}?</h2>
      <p v-if="wrongAnswer" class="error">Leider falsch – hier ist eine neue Aufgabe.</p>
      <NumberInput
        :answer="a * b"
        :revealed="false"
        :locked="false"
        @answer="answered"
        @input="wrongAnswer = false"
      />
    </template>
  </div>
</template>

<style scoped>
.gate {
  max-width: 420px;
  margin: 48px auto 0;
  text-align: center;
}

h2 {
  margin-top: 0;
}

.hold {
  position: relative;
  width: 100%;
  min-height: 80px;
  overflow: hidden;
  border: 3px solid var(--accent);
  border-radius: 16px;
  background: var(--surface);
  font-size: 22px;
  font-weight: 700;
  touch-action: none;
}

.fill {
  position: absolute;
  inset: 0;
  width: 0;
  background: var(--accent);
}

.holding .fill {
  width: 100%;
  transition: width 2s linear;
}

.label {
  position: relative;
}

.error {
  color: var(--error);
}
</style>
