<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { createRng, randomInt } from '@/core/random'

// Parent gate: hold for 2 seconds, then solve a multiplication task for adults.
const emit = defineEmits<{ pass: [] }>()
const HOLD_MS = 2000
const rng = createRng()

const stage = ref<'hold' | 'question'>('hold')
const holding = ref(false)
const a = ref(0)
const b = ref(0)
const input = ref('')
const wrongAnswer = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function newQuestion() {
  a.value = randomInt(rng, 6, 9)
  b.value = randomInt(rng, 6, 9)
  input.value = ''
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

function press(key: string) {
  wrongAnswer.value = false
  if (key === '⌫') input.value = input.value.slice(0, -1)
  else if (input.value.length < 3) input.value += key
}

function submit() {
  if (Number(input.value) === a.value * b.value) {
    emit('pass')
  } else {
    wrongAnswer.value = true
    newQuestion()
  }
}

onUnmounted(() => clearTimeout(timer))

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0']
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
      <p class="answer" :class="{ error: wrongAnswer }">
        {{ input || '?' }}
      </p>
      <p v-if="wrongAnswer" class="error">Leider falsch – hier ist eine neue Aufgabe.</p>
      <div class="pad">
        <button v-for="k in keys" :key="k" class="key" @click="press(k)">{{ k }}</button>
        <button class="key ok" :disabled="!input" @click="submit">OK</button>
      </div>
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

.answer {
  min-height: 56px;
  margin: 0 0 12px;
  font-size: 44px;
  font-weight: 700;
}

.error {
  color: var(--error);
}

.pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.key {
  min-height: var(--tap);
  border: 3px solid var(--accent);
  border-radius: 14px;
  background: var(--surface);
  font-size: 28px;
  font-weight: 700;
}

.key.ok {
  background: var(--accent);
}
</style>
