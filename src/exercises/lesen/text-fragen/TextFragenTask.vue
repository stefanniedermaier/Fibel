<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import ScenePicture from '@/components/ScenePicture.vue'
import SentenceText from '@/components/SentenceText.vue'
import { useAppStore } from '@/stores/app'
import type { TextFragenData } from './index'

defineProps<{ data: TextFragenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
const store = useAppStore()
</script>

<template>
  <div class="task">
    <div
      v-if="data.kind === 'lesen'"
      class="text card"
      :class="{ long: data.sentences.length > 5 }"
    >
      <SentenceText
        v-for="(s, i) in data.sentences"
        :key="i"
        :tokens="s"
        :coloring="data.coloring"
        :size="data.sentences.length > 5 ? 21 : 34"
      />
    </div>
    <button
      v-else
      type="button"
      class="btn story"
      aria-label="Geschichte nochmal hören"
      @click="store.say(data.story)"
    >
      📖🔊 Geschichte nochmal hören
    </button>
    <ChoiceButtons
      :label-prefix="data.choices[0]?.text ? undefined : 'Bild'"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="110"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span v-if="option.text" class="answer">{{ option.text }}</span>
        <ScenePicture v-else :scene="option.scene ?? []" :size="64" />
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: 20px;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 20px;
  max-width: 100%;
}

.text.long {
  flex-direction: row;
  flex-wrap: wrap;
  /* Long texts read like a page: lines start on the left. */
  justify-content: flex-start;
  gap: 2px 8px;
  max-width: 680px;
}

/* The sentences flow into each other like a page in a book. */
.text.long :deep(.sentence) {
  display: contents;
}

.story {
  font-size: 22px;
}
.answer {
  font-size: 22px;
  font-weight: 700;
}
</style>
