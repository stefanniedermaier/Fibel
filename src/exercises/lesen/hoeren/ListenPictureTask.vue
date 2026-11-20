<script setup lang="ts">
import { ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { useAppStore } from '@/stores/app'
import type { ListenPictureData } from './shared'

// Listening exercise with pictures: a target picture (optional) and picture choices.
// After answering, the names appear under the pictures – a small bonus for reading.
const props = defineProps<{ data: ListenPictureData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
const store = useAppStore()

const solved = ref(false)
watch(
  () => props.data,
  () => (solved.value = false),
)
function answer(correct: boolean) {
  if (correct) solved.value = true
  emit('answer', correct)
}
</script>

<template>
  <div class="task">
    <button
      v-if="data.target"
      type="button"
      class="target"
      aria-label="Wort anhören"
      @click="store.say(data.target.spoken)"
    >
      <EmojiPicture :code="data.target.image" :size="120" />
    </button>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="data.choices.length > 3 ? 120 : 84"
      @answer="answer"
    >
      <template #default="{ option }">
        <span class="pic">
          <EmojiPicture :code="option.image" :size="data.choices.length > 3 ? 72 : 60" />
          <span class="label" :class="{ shown: solved || revealed }">{{ option.label }}</span>
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
  gap: clamp(16px, 4vh, 32px);
  width: 100%;
}

.target {
  padding: 8px;
  border: 0;
  border-radius: 24px;
  background: var(--surface);
}

.pic {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.label {
  min-height: 1.3em;
  font-size: 18px;
  font-weight: 700;
  visibility: hidden;
}

.label.shown {
  visibility: visible;
}
</style>
