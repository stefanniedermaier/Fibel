<script setup lang="ts">
import { ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import NumberInput from '@/components/NumberInput.vue'

// Word problems in two steps: pick the calculation, then work it out. Only the end
// counts as "right". With `result` left out, picking is the whole task.
const props = withDefaults(
  defineProps<{
    choices: { key: string; label: string }[]
    /** The right calculation, e.g. "3 + 4". */
    correctKey: string
    result?: number
    revealed: boolean
    locked: boolean
    /** Font size of the calculations on the buttons. */
    size?: number
  }>(),
  { result: undefined, size: 30 },
)
const emit = defineEmits<{ answer: [correct: boolean] }>()

const step = ref<1 | 2>(1)
watch(
  () => [props.choices, props.correctKey],
  () => (step.value = 1),
)

function onChoice(correct: boolean) {
  if (props.result === undefined) emit('answer', correct)
  else if (correct) step.value = 2
  else emit('answer', false)
}
</script>

<template>
  <ChoiceButtons
    v-if="step === 1 && !(revealed && result !== undefined)"
    :options="choices"
    :correct-key="correctKey"
    :revealed="revealed"
    :locked="locked"
    :min-width="120"
    @answer="onChoice"
  >
    <template #default="{ option }">
      <span class="calc" :style="{ fontSize: `${size}px` }">{{ option.label }}</span>
    </template>
  </ChoiceButtons>
  <template v-else-if="result !== undefined">
    <p class="equation">{{ correctKey }} = <span class="gap">?</span></p>
    <NumberInput
      :answer="result"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    />
  </template>
</template>

<style scoped>
.calc {
  font-weight: 700;
  white-space: nowrap;
}

.equation {
  margin: 0;
  font-size: clamp(36px, 10vw, 52px);
  font-weight: 700;
}

.gap {
  color: var(--accent-strong);
}
</style>
