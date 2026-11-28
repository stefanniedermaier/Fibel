<script setup lang="ts">
import EmojiPicture from '@/components/EmojiPicture.vue'
import RechnungWaehlen from '@/components/RechnungWaehlen.vue'
import type { SachaufgabenData } from './index'

defineProps<{ data: SachaufgabenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div class="story card">
      <EmojiPicture :code="data.image" :size="56" />
      <p>{{ data.text }}</p>
    </div>
    <p v-if="data.claim" class="claim">Antwort: {{ data.claim }}</p>
    <!-- rechnen: the calculation, then the result. pruefen: one choice. -->
    <RechnungWaehlen
      :choices="data.choices"
      :correct-key="data.correctKey"
      :result="data.mode === 'rechnen' ? data.result : undefined"
      :revealed="revealed"
      :locked="locked"
      :size="26"
      @answer="emit('answer', $event)"
    />
  </div>
</template>

<style scoped>
.task {
  gap: 18px;
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
</style>
