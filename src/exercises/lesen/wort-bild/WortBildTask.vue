<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import SyllableWord from '@/components/SyllableWord.vue'
import type { WortBildData } from './index'

defineProps<{ data: WortBildData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div class="prompt card">
      <SyllableWord
        :syllables="data.syllables"
        :coloring="data.coloring"
        :arcs="data.arcs"
        :size="64"
      />
    </div>
    <ChoiceButtons
      label-prefix="Bild"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <!-- No alt text: the label would give the answer away to screen readers only. -->
        <EmojiPicture :code="option.image" :size="80" />
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(24px, 6vh, 48px);
  width: 100%;
}

.prompt {
  padding: 16px 32px 20px;
  max-width: 100%;
  overflow-x: auto;
}
</style>
