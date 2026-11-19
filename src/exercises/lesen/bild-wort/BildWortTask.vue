<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import SyllableWord from '@/components/SyllableWord.vue'
import type { BildWortData } from './index'

defineProps<{ data: BildWortData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <EmojiPicture :code="data.image" :size="150" />
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="150"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <SyllableWord
          :syllables="option.syllables"
          :coloring="data.coloring"
          :arcs="data.arcs"
          :size="36"
        />
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
</style>
