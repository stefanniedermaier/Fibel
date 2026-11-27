<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { SacheData } from './shared'

defineProps<{ data: SacheData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div v-if="data.prompt" class="prompt card">
      <EmojiPicture :code="data.prompt" :size="120" />
    </div>
    <ChoiceButtons
      label-prefix="Bild"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="option">
          <EmojiPicture :code="option.image" :size="80" />
          <span v-if="option.label" class="label">{{ option.label }}</span>
        </span>
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
  padding: 16px 32px;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.label {
  font-size: 20px;
  font-weight: 700;
}
</style>
