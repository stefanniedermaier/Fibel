<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import WordPrompt from '@/components/WordPrompt.vue'
import { display, marks, matches, onlyLetters, type TippenData } from './index'

// The word is typed on the device's own keyboard. A transparent <input> lies over our
// big letter display: tapping the display opens the keyboard, and the display (not the
// input) shows the letters, so marks after a mistake and the auto capital still work.
const props = defineProps<{ data: TippenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

/** A few letters more than the word, so a mistake can still be typed. */
const EXTRA_LETTERS = 2

const input = ref<HTMLInputElement>()
const typed = ref('')
const focused = ref(false)
const state = ref<'idle' | 'wrong' | 'right'>('idle')
/** After a mistake: which letters were right (shown until the child types again). */
const marking = ref<boolean[]>()

const disabled = computed(() => props.locked || props.revealed || state.value === 'right')
const targetLetters = computed(() => [...props.data.target])
const maxLength = computed(() =>
  props.data.slots ? targetLetters.value.length : targetLetters.value.length + EXTRA_LETTERS,
)

const shown = computed(() =>
  props.revealed ? props.data.target : display(typed.value, props.data.autoCapitalize),
)
// The revealed solution is shown without the marks of the last try.
const letters = computed(() =>
  [...shown.value].map((ch, i) => ({ ch, mark: props.revealed ? undefined : marking.value?.[i] })),
)
const slots = computed(() =>
  targetLetters.value.map((_, i) => ({
    ch: letters.value[i]?.ch ?? '',
    mark: letters.value[i]?.mark,
    current: focused.value && !disabled.value && i === letters.value.length,
  })),
)

// With the keyboard open there is only half the screen left: smaller picture then.
const viewportHeight = ref(window.visualViewport?.height ?? window.innerHeight)
const onResize = () => (viewportHeight.value = window.visualViewport?.height ?? window.innerHeight)
const promptSize = computed(() => (viewportHeight.value < 560 ? 64 : 96))

function focus() {
  if (!disabled.value) input.value?.focus({ preventScroll: true })
}

onMounted(() => {
  window.visualViewport?.addEventListener('resize', onResize)
  focus()
})
onUnmounted(() => window.visualViewport?.removeEventListener('resize', onResize))

watch(
  () => props.data,
  () => {
    typed.value = ''
    state.value = 'idle'
    marking.value = undefined
    if (input.value) input.value.value = ''
    void nextTick(focus)
  },
)

// Done (right or revealed): close the keyboard so the praise and the solution are visible.
watch(disabled, (off) => {
  if (off) input.value?.blur()
})

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const clean = onlyLetters(el.value).slice(0, maxLength.value)
  // Never rewrite the field while the keyboard is still composing a word (Gboard):
  // that would duplicate letters.
  if (!(e as InputEvent).isComposing && clean !== el.value) el.value = clean
  typed.value = clean
  marking.value = undefined
  state.value = 'idle'
}

function submit() {
  if (disabled.value || !typed.value) return
  if (matches(shown.value, props.data.target, props.data.strictCase)) {
    state.value = 'right'
    emit('answer', true)
  } else {
    state.value = 'wrong'
    marking.value = marks(shown.value, props.data.target)
    emit('answer', false)
  }
}
</script>

<template>
  <form class="task" @submit.prevent="submit">
    <WordPrompt :image="data.image" :spoken="data.spoken" :size="promptSize" />

    <!-- Field and ✓ side by side: with the keyboard open only half the screen is left. -->
    <div class="row">
      <div
        class="field"
        :class="{
          wrong: state === 'wrong',
          right: state === 'right' || revealed,
          focused,
          slotted: data.slots,
        }"
      >
        <span v-if="data.slots" class="slots" aria-hidden="true">
          <span
            v-for="(s, i) in slots"
            :key="i"
            class="slot"
            :class="{ ok: s.mark === true, bad: s.mark === false, current: s.current }"
            >{{ s.ch }}</span
          >
        </span>
        <span v-else class="typed" aria-hidden="true">
          <span
            v-for="(l, i) in letters"
            :key="i"
            :class="{ ok: l.mark === true, bad: l.mark === false }"
            >{{ l.ch }}</span><span v-if="focused && !disabled" class="cursor" /><span
            v-else-if="!shown && !disabled"
            class="keyboard-icon"
            >⌨️</span
          >
        </span>
        <input
          ref="input"
          class="native"
          type="text"
          inputmode="text"
          enterkeyhint="done"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck="false"
          aria-label="Wort schreiben"
          :maxlength="maxLength"
          :disabled="disabled"
          @input="onInput"
          @focus="focused = true"
          @blur="focused = false"
        />
      </div>

      <button type="submit" class="done" aria-label="Fertig" :disabled="disabled || !typed">
        ✓
      </button>
    </div>
  </form>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 2.5vh, 20px);
  width: 100%;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 100%;
}

.field {
  position: relative;
  display: flex;
  justify-content: center;
  min-width: 180px;
  max-width: 100%;
  border: 4px solid var(--accent);
  border-radius: 18px;
  background: var(--surface);
  font-size: clamp(36px, 10vw, 52px);
  font-weight: 700;
}

.field.focused {
  box-shadow: 0 0 0 4px #ffe8b0;
}

.field.slotted {
  min-width: 0;
  padding: 8px;
  border-color: transparent;
  background: none;
  box-shadow: none;
}

.field.wrong {
  animation: shake 0.45s;
}

.field.wrong:not(.slotted) {
  border-color: var(--error);
}

.field.right:not(.slotted) {
  border-color: var(--ok);
  background: #e6f6ea;
}

.typed {
  display: flex;
  align-items: center;
  min-height: 72px;
  padding: 0 16px;
}

.slots {
  display: flex;
  gap: 6px;
}

.slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(40px, 11vw, 56px);
  height: clamp(54px, 14vw, 72px);
  border: 3px solid #d9c7ad;
  border-radius: 12px;
  background: var(--surface);
}

.slot.current {
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 3px #ffe8b0;
}

.field.right .slot {
  border-color: var(--ok);
  background: #e6f6ea;
}

.field.wrong .slot {
  border-color: var(--error);
}

.ok {
  color: var(--ok);
}

.bad {
  color: var(--error);
  text-decoration: underline wavy;
}

.cursor {
  width: 3px;
  height: 0.9em;
  margin-left: 2px;
  background: var(--text);
  animation: blink 1s steps(1) infinite;
}

.keyboard-icon {
  font-size: 0.7em;
  opacity: 0.6;
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

button.done {
  min-width: 80px;
  height: var(--tap);
  border: 3px solid var(--accent);
  border-radius: 16px;
  background: var(--accent);
  color: var(--text);
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 4px 0 var(--accent-strong);
}

button.done:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--accent-strong);
}

button.done:disabled {
  opacity: 0.45;
  box-shadow: none;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
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
