<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { LautpositionData } from './index'

defineProps<{ data: LautpositionData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
const PLACES = ['anfang', 'mitte', 'ende']
</script>

<template>
  <div class="task">
    <div class="prompt">
      <EmojiPicture :code="data.image" :size="130" />
      <span class="letter card">{{ data.upper }}</span>
    </div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="130"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="place" :aria-label="option.label">
          <span class="bar" aria-hidden="true">
            <span v-for="p in PLACES" :key="p" class="cell" :class="{ on: p === option.key }" />
          </span>
          <span class="label">{{ option.label }}</span>
        </span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: 28px;
}

.prompt {
  display: flex;
  align-items: center;
  gap: 24px;
}

.letter {
  padding: 8px 24px;
  font-size: 64px;
  font-weight: 700;
}

.place {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  display: flex;
  gap: 4px;
}

.cell {
  width: 28px;
  height: 22px;
  border: 3px solid var(--accent);
  border-radius: 6px;
}

.cell.on {
  background: var(--accent);
}

.label {
  font-size: 20px;
  font-weight: 700;
}
</style>
