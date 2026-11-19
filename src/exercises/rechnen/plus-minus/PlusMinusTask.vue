<script setup lang="ts">
import { ref } from 'vue'
import NumberPad from '@/components/NumberPad.vue'
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
      <TenFrame
        v-if="showHelp || revealed"
        :cells="data.cells"
        :small="data.cells === 10"
        :count="data.a"
        :extra="data.op === '+' ? data.b : 0"
        :crossed="data.op === '-' ? data.b : 0"
      />
      <button v-else type="button" class="btn help-btn" @click="showHelp = true">
        🔴 Plättchen zeigen
      </button>
    </div>

    <NumberPad :answer="data.result" :revealed="revealed" :locked="locked" @answer="answer" />
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

.equation {
  margin: 0;
  font-size: clamp(44px, 12vw, 64px);
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

.help-btn {
  font-size: 18px;
}
</style>
