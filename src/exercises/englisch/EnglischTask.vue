<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { EnglischData } from './shared'

defineProps<{ data: EnglischData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div v-if="data.prompt" class="prompt card">
      <EmojiPicture v-if="data.prompt.image" :code="data.prompt.image" :size="120" />
      <span v-if="data.prompt.text" class="word" lang="en">{{ data.prompt.text }}</span>
    </div>
    <ChoiceButtons
      :label-prefix="data.choices.some((c) => c.label) ? undefined : 'Bild'"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="option">
          <EmojiPicture v-if="option.image" :code="option.image" :size="80" />
          <span v-if="option.label" class="label" lang="en">{{ option.label }}</span>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
}

.word {
  font-size: 44px;
  font-weight: 700;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
}

.label {
  font-size: 28px;
  font-weight: 700;
}
</style>
