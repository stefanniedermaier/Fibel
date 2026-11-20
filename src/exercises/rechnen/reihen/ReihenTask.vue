<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import TokenView from './TokenView.vue'
import type { ReihenData } from './index'

const props = defineProps<{ data: ReihenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// After the right answer the gap is filled.
const solved = ref(false)
watch(
  () => props.data,
  () => (solved.value = false),
)
function answer(correct: boolean) {
  if (correct) solved.value = true
  emit('answer', correct)
}

const isNumbers = computed(() => props.data.tokens[0]?.kind === 'zahl')
/** Smaller elements for long sequences, so a row fits on a phone. */
const size = computed(() => (props.data.tokens.length > 7 ? 24 : isNumbers.value ? 44 : 34))
</script>

<template>
  <div class="task">
    <ol class="row" :class="{ numbers: isNumbers }">
      <li
        v-for="(token, i) in data.tokens"
        :key="i"
        class="cell"
        :class="{ gap: i === data.gap, filled: i === data.gap && (solved || revealed) }"
      >
        <TokenView v-if="i !== data.gap || solved || revealed" :token="token" :size="size" />
        <span v-else class="question" aria-label="Lücke">?</span>
      </li>
    </ol>

    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="84"
      @answer="answer"
    >
      <template #default="{ option }">
        <TokenView :token="option.token" :size="isNumbers ? 52 : 56" />
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(20px, 5vh, 40px);
  width: 100%;
}

.row {
  display: flex;
  /* A pattern must stay in one line; if it is ever too long, it scrolls inside the card. */
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: center;
  align-items: center;
  gap: 3px;
  max-width: 100%;
  margin: 0;
  padding: 8px;
  list-style: none;
  border-radius: var(--radius);
  background: var(--surface);
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  min-height: 44px;
  padding: 2px;
  border-radius: 10px;
}

/* Commas between numbers – outside the boxes, so the gap stays clean. */
.numbers .cell + .cell {
  position: relative;
  margin-left: 16px;
}

.numbers .cell + .cell::before {
  content: ',';
  position: absolute;
  left: -13px;
  bottom: 6px;
  font-size: 28px;
  color: var(--muted);
}

.gap {
  min-width: 36px;
  border: 3px dashed var(--accent-strong);
  background: #fff3d6;
}

.gap.filled {
  border-style: solid;
  border-color: var(--ok);
  background: #e6f6ea;
}

.question {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-strong);
}
</style>
