<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { AnlautData } from './index'

defineProps<{ data: AnlautData; revealed: boolean; locked: boolean }>()
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
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="letter">{{ option.upper }} {{ option.key }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: clamp(20px, 5vh, 40px);
}

.letter {
  font-size: clamp(36px, 10vw, 52px);
  font-weight: 700;
  white-space: nowrap;
}
</style>
