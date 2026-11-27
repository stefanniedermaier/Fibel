<script setup lang="ts">
import { ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import TenFrame from '@/components/TenFrame.vue'
import type { VergleichenData } from './index'

const props = defineProps<{ data: VergleichenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// The chosen sign is shown in the gap between the numbers once it is right.
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
    <div class="compare">
      <div class="side">
        <span class="number">{{ data.a }}</span>
        <TenFrame :count="data.a" :cells="data.a > 10 || data.b > 10 ? 20 : 10" small />
      </div>
      <span class="sign" :class="{ shown: solved || revealed }">
        {{ solved || revealed ? data.correctKey : '?' }}
      </span>
      <div class="side">
        <span class="number">{{ data.b }}</span>
        <TenFrame :count="data.b" :cells="data.a > 10 || data.b > 10 ? 20 : 10" small />
      </div>
    </div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="80"
      @answer="answer"
    >
      <template #default="{ option }">
        <span class="symbol" :aria-label="option.label">{{ option.key }}</span>
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

.compare {
  display: flex;
  align-items: center;
  gap: clamp(8px, 3vw, 24px);
}

.side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.number {
  font-size: clamp(48px, 13vw, 72px);
  font-weight: 700;
  line-height: 1;
}

.sign {
  min-width: 1.2em;
  font-size: clamp(44px, 12vw, 64px);
  font-weight: 700;
  text-align: center;
  color: var(--accent-strong);
}

.sign.shown {
  color: var(--ok);
}

.symbol {
  font-size: clamp(48px, 13vw, 64px);
  font-weight: 700;
  line-height: 1;
}
</style>
