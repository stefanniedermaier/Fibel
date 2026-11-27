<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import ScenePicture from '@/components/ScenePicture.vue'
import SentenceText from '@/components/SentenceText.vue'
import type { SatzBildData } from './index'

defineProps<{ data: SatzBildData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div class="prompt card">
      <SentenceText :tokens="data.tokens" :coloring="data.coloring" :arcs="data.arcs" />
    </div>
    <template v-if="data.mode === 'stimmt'">
      <div class="shown card"><ScenePicture :scene="data.scene" :size="96" /></div>
      <ChoiceButtons
        :options="data.choices"
        :correct-key="data.correctKey"
        :revealed="revealed"
        :locked="locked"
        @answer="emit('answer', $event)"
      >
        <template #default="{ option }">
          <span class="yesno" :aria-label="option.key === 'ja' ? 'passt' : 'passt nicht'">
            {{ option.key === 'ja' ? '👍' : '👎' }}
          </span>
        </template>
      </ChoiceButtons>
    </template>
    <ChoiceButtons
      v-else
      label-prefix="Bild"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="150"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <ScenePicture :scene="option.scene" :size="64" />
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

.prompt {
  padding: 16px 24px 20px;
  max-width: 100%;
}

.shown {
  padding: 12px 24px;
}

.yesno {
  font-size: 56px;
  line-height: 1;
}
</style>
