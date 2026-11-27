<script setup lang="ts">
import { ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import NumberInput from '@/components/NumberInput.vue'
import type { SachaufgabenData } from './index'

const props = defineProps<{ data: SachaufgabenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// rechnen: step 1 the calculation, step 2 the result. pruefen: one choice.
const step = ref<1 | 2>(1)
watch(
  () => props.data,
  () => (step.value = 1),
)
function onChoice(correct: boolean) {
  if (props.data.mode === 'pruefen') emit('answer', correct)
  else if (correct) step.value = 2
  else emit('answer', false)
}
</script>

<template>
  <div class="task">
    <div class="story card">
      <EmojiPicture :code="data.image" :size="56" />
      <p>{{ data.text }}</p>
    </div>
    <p v-if="data.claim" class="claim">Antwort: {{ data.claim }}</p>
    <ChoiceButtons
      v-if="step === 1 && !(revealed && data.mode === 'rechnen')"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="onChoice"
    >
      <template #default="{ option }">
        <span class="calc">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
    <template v-else>
      <p class="calc big">{{ data.correctKey }} = ?</p>
      <NumberInput
        :answer="data.result"
        :revealed="revealed"
        :locked="locked"
        @answer="emit('answer', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.story {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  max-width: 560px;
  padding: 12px 18px;
}

.story p {
  margin: 0;
  font-size: 22px;
  line-height: 1.4;
}

.claim {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.calc {
  font-size: 26px;
  font-weight: 700;
}

.calc.big {
  margin: 0;
  font-size: 40px;
}
</style>
