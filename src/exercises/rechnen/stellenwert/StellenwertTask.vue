<script setup lang="ts">
import BaseTenBlocks from '@/components/BaseTenBlocks.vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import NumberInput from '@/components/NumberInput.vue'
import TenFrame from '@/components/TenFrame.vue'
import type { StellenwertData } from './index'

defineProps<{ data: StellenwertData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <template v-if="data.mode === 'bild'">
      <BaseTenBlocks :tens="data.tens" :ones="data.ones" />
      <ChoiceButtons
        :options="data.choices"
        :correct-key="data.correctKey"
        :revealed="revealed"
        :locked="locked"
        @answer="emit('answer', $event)"
      >
        <template #default="{ option }">
          <span class="number">{{ option.label }}</span>
        </template>
      </ChoiceButtons>
    </template>
    <template v-else>
      <p class="equation" aria-hidden="true">
        {{ data.n }} = {{ data.tens * 10 }} + <span class="gap">?</span>
      </p>
      <TenFrame v-if="data.n <= 20" :count="data.n" :cells="20" />
      <BaseTenBlocks v-else :tens="data.tens" :ones="data.ones" />
      <NumberInput
        :answer="data.ones"
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
  gap: 20px;
  width: 100%;
}

.number {
  font-size: 44px;
  font-weight: 700;
}

.equation {
  margin: 0;
  font-size: clamp(36px, 10vw, 60px);
  font-weight: 700;
}

.gap {
  color: var(--accent-strong);
}
</style>
