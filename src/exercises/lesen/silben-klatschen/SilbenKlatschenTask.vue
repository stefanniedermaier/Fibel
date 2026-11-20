<script setup lang="ts">
import { ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import WordPrompt from '@/components/WordPrompt.vue'
import SyllableWord from '@/components/SyllableWord.vue'
import type { SilbenKlatschenData } from './index'

const props = defineProps<{ data: SilbenKlatschenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// After solving, the word is shown split into syllables as confirmation.
const solved = ref(false)
watch(
  () => props.data,
  () => (solved.value = false),
)
function answer(correct: boolean) {
  if (correct) solved.value = true
  emit('answer', correct)
}
</script>

<template>
  <div class="task">
    <WordPrompt :image="data.image" :spoken="data.spoken" :size="140" />
    <div class="word" :class="{ visible: solved || revealed }" aria-live="polite">
      <SyllableWord
        v-if="solved || revealed"
        :syllables="data.syllables"
        :coloring="data.coloring"
        :arcs="true"
        :size="40"
      />
    </div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="64"
      @answer="answer"
    >
      <template #default="{ option }">
        <span class="claps">
          <span class="count">{{ option.count }}</span>
          <span class="hands" aria-hidden="true">{{ '👏'.repeat(option.count) }}</span>
        </span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(14px, 3vh, 28px);
  width: 100%;
}

.word {
  min-height: 64px;
}

.claps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.count {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}

.hands {
  font-size: 16px;
  letter-spacing: -2px;
}
</style>
