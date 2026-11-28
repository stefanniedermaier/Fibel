<script setup lang="ts">
import { ref } from 'vue'
import NumberInput from '@/components/NumberInput.vue'
import BaseTenBlocks from '@/components/BaseTenBlocks.vue'
import TenFrame from '@/components/TenFrame.vue'
import { shownOp } from '../shared'
import type { PlusMinusData } from './index'

defineProps<{ data: PlusMinusData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// The ten frame is a help the child can switch on; after a mistake it appears by itself.
const showHelp = ref(false)
function answer(correct: boolean) {
  if (!correct) showHelp.value = true
  emit('answer', correct)
}
</script>

<template>
  <div class="task">
    <p class="equation" aria-hidden="true">
      {{ data.a }} {{ shownOp(data.op) }} {{ data.b }} = <span class="gap">?</span>
    </p>

    <div class="help">
      <div v-if="data.cells === 0 && (showHelp || revealed)" class="blocks">
        <BaseTenBlocks :tens="Math.floor(data.a / 10)" :ones="data.a % 10" :size="12" />
        <span class="sign">{{ shownOp(data.op) }}</span>
        <BaseTenBlocks :tens="Math.floor(data.b / 10)" :ones="data.b % 10" :size="12" />
      </div>
      <TenFrame
        v-else-if="data.cells > 0 && (showHelp || revealed)"
        :cells="data.cells === 10 ? 10 : 20"
        :small="data.cells === 10"
        :count="data.a"
        :extra="data.op === '+' ? data.b : 0"
        :crossed="data.op === '-' ? data.b : 0"
      />
      <button v-else type="button" class="btn help-btn" @click="showHelp = true">
        {{ data.cells === 0 ? '🧱 Zehner und Einer zeigen' : '🔴 Plättchen zeigen' }}
      </button>
    </div>

    <NumberInput :answer="data.result" :revealed="revealed" :locked="locked" @answer="answer" />
  </div>
</template>

<style scoped>
.task {
  gap: clamp(10px, 2.5vh, 20px);
}

.equation {
  margin: 0;
  font-size: clamp(36px, min(12vw, 9dvh), 64px);
  font-weight: 700;
  white-space: nowrap;
}

.gap {
  color: var(--accent-strong);
}

.help {
  display: flex;
  justify-content: center;
  min-height: 64px;
}

.blocks {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.sign {
  font-size: 36px;
  font-weight: 700;
}

.help-btn {
  font-size: 18px;
}
</style>
