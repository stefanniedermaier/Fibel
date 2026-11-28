<script setup lang="ts">
import { capitalize } from '@/core/text'
import { computed, ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import WordPrompt from '@/components/WordPrompt.vue'
import type { LueckeData } from './index'

const props = defineProps<{ data: LueckeData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const solved = ref(false)
watch(
  () => props.data,
  () => (solved.value = false),
)
function answer(correct: boolean) {
  if (correct) solved.value = true
  emit('answer', correct)
}

// If the first letter of a noun is missing, the choices are capitalised (R, not r).
function choiceText(key: string): string {
  return props.data.gap === 0 && props.data.capitalizeFirst ? capitalize(key) : key
}

const parts = computed(() =>
  props.data.graphemes.map((g, i) => {
    const text = i === 0 && props.data.capitalizeFirst ? capitalize(g) : g
    return { text, gap: i === props.data.gap }
  }),
)
</script>

<template>
  <div class="task">
    <WordPrompt :image="data.image" :spoken="data.spoken" :size="120" />
    <p class="word">
      <span
        v-for="(p, i) in parts"
        :key="i"
        :class="{ gap: p.gap, filled: p.gap && (solved || revealed) }"
      >
        {{ p.gap && !(solved || revealed) ? '' : p.text }}
      </span>
    </p>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="answer"
    >
      <template #default="{ option }">
        <span class="letter">{{ choiceText(option.key) }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: clamp(16px, 4vh, 32px);
}

.word {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  margin: 0;
  font-size: clamp(44px, 12vw, 60px);
  font-weight: 700;
  line-height: 1.2;
}

.gap {
  display: inline-block;
  min-width: 0.9em;
  height: 1.2em;
  border-bottom: 5px solid var(--accent-strong);
  background: #fff3d6;
  border-radius: 8px 8px 0 0;
  text-align: center;
}

.gap.filled {
  border-color: var(--ok);
  background: #e6f6ea;
}

.letter {
  font-size: clamp(40px, 11vw, 56px);
  font-weight: 700;
}
</style>
