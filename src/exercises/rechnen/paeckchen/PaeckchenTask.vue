<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import NumberInput from '@/components/NumberInput.vue'
import type { PaeckchenData } from './index'

defineProps<{ data: PaeckchenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
const YES_NO = [
  { key: 'ja', label: 'stimmt' },
  { key: 'nein', label: 'stimmt nicht' },
]
</script>

<template>
  <div class="task">
    <div class="card paeckchen">
      <p v-if="data.helper" class="helper">{{ data.helper }}</p>
      <p class="main">
        {{ data.task
        }}<template v-if="data.mode === 'strategie'"> = <span class="gap">?</span></template>
      </p>
    </div>
    <ChoiceButtons
      v-if="data.mode === 'pruefen'"
      :options="YES_NO"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="yesno" :aria-label="option.label">{{
          option.key === 'ja' ? '👍' : '👎'
        }}</span>
      </template>
    </ChoiceButtons>
    <NumberInput
      v-else
      :answer="data.answer"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    />
    <p v-if="revealed && data.mode === 'pruefen'" class="result">= {{ data.answer }}</p>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.paeckchen {
  padding: 12px 32px;
  text-align: center;
}

.helper {
  margin: 0;
  font-size: clamp(28px, 8vw, 44px);
  color: var(--muted);
}

.main {
  margin: 0;
  font-size: clamp(36px, 11vw, 60px);
  font-weight: 700;
  white-space: nowrap;
}

.gap {
  color: var(--accent-strong);
}

.yesno {
  font-size: 56px;
  line-height: 1;
}

.result {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}
</style>
