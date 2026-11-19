<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { MAX_LETTERS, marks, matches, type AbcTastaturData } from './index'

const props = defineProps<{ data: AbcTastaturData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const typed = ref('')
const shift = ref(false)
const state = ref<'idle' | 'wrong' | 'right'>('idle')
/** After a mistake: which letters were right (shown until the child types again). */
const marking = ref<boolean[]>()

watch(
  () => props.data,
  () => {
    typed.value = ''
    state.value = 'idle'
    marking.value = undefined
  },
)

const disabled = computed(() => props.locked || props.revealed || state.value === 'right')

/** What is shown: with auto capitalisation the first letter appears as a capital. */
const shown = computed(() => {
  if (props.revealed) return props.data.target
  const t = typed.value
  return props.data.autoCapitalize && t ? t.charAt(0).toUpperCase() + t.slice(1) : t
})

const letters = computed(() => [...shown.value].map((ch, i) => ({ ch, mark: marking.value?.[i] })))

function press(key: string) {
  if (disabled.value || typed.value.length + key.length > MAX_LETTERS + 2) return
  marking.value = undefined
  state.value = 'idle'
  typed.value += shift.value ? key.charAt(0).toUpperCase() + key.slice(1) : key
  shift.value = false
}

function erase() {
  if (disabled.value) return
  marking.value = undefined
  typed.value = typed.value.slice(0, -1)
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
  <div class="task">
    <EmojiPicture :code="data.image" :size="96" />

    <p class="typed" :class="{ wrong: state === 'wrong', right: state === 'right' || revealed }">
      <span
        v-for="(l, i) in letters"
        :key="i"
        :class="{ ok: l.mark === true, bad: l.mark === false }"
        >{{ l.ch }}</span><span
        v-if="!revealed && state !== 'right'"
        class="cursor"
        aria-hidden="true"
      />
    </p>

    <div class="keyboard">
      <button
        v-for="key in data.keys"
        :key="key"
        type="button"
        class="key"
        :disabled="disabled"
        @click="press(key)"
      >
        {{ shift ? key.charAt(0).toUpperCase() + key.slice(1) : key }}
      </button>
    </div>
    <div class="controls">
      <button
        v-if="data.strictCase"
        type="button"
        class="key control"
        :class="{ active: shift }"
        aria-label="Großbuchstabe"
        :disabled="disabled"
        @click="shift = !shift"
      >
        ⇧
      </button>
      <button
        type="button"
        class="key control"
        aria-label="Löschen"
        :disabled="disabled"
        @click="erase"
      >
        ⌫
      </button>
      <button
        type="button"
        class="key control ok"
        aria-label="Fertig"
        :disabled="disabled || !typed"
        @click="submit"
      >
        ✓
      </button>
    </div>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 2.5vh, 20px);
  width: 100%;
}

.typed {
  display: flex;
  align-items: center;
  min-width: 200px;
  min-height: 72px;
  margin: 0;
  padding: 0 16px;
  border: 4px solid var(--accent);
  border-radius: 18px;
  background: var(--surface);
  font-size: clamp(36px, 10vw, 52px);
  font-weight: 700;
}

.typed.wrong {
  border-color: var(--error);
  animation: shake 0.45s;
}

.typed.right {
  border-color: var(--ok);
  background: #e6f6ea;
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

/* Centred rows: with only a few letters the keys stay big and together. */
.keyboard {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  width: 100%;
  max-width: 560px;
}

.keyboard .key {
  width: clamp(44px, 12.5vw, 64px);
}

.key {
  height: clamp(50px, 13vw, 64px);
  border: 3px solid var(--accent);
  border-radius: 12px;
  background: var(--surface);
  font-size: clamp(22px, 6vw, 28px);
  font-weight: 700;
  box-shadow: 0 3px 0 var(--accent-strong);
}

.key:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--accent-strong);
}

.key:disabled {
  opacity: 0.45;
  box-shadow: none;
}

.controls {
  display: flex;
  gap: 10px;
}

.control {
  min-width: 80px;
}

.control.active,
.control.ok {
  background: var(--accent);
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
