<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'

// Text answers with an optional picture, a helper line ("Hunde →") and a big prompt
// (a word with a gap, a letter). Shared by Schreibung, Ableiten and ABC.
export interface WahlData {
  image?: string
  helper?: string
  prompt?: string
  correctKey: string
  choices: { key: string; label: string }[]
}

defineProps<{ data: WahlData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <EmojiPicture v-if="data.image" :code="data.image" :size="96" />
    <p v-if="data.helper" class="helper card">{{ data.helper }}</p>
    <p v-if="data.prompt" class="prompt" aria-hidden="true">{{ data.prompt }}</p>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="label">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(14px, 3vh, 28px);
  width: 100%;
}

.helper {
  margin: 0;
  padding: 8px 20px;
  font-size: 26px;
}

.prompt {
  margin: 0;
  font-size: clamp(40px, 12vw, 64px);
  font-weight: 700;
  letter-spacing: 2px;
}

.label {
  font-size: 30px;
  font-weight: 700;
}
</style>
