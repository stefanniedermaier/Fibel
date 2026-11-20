<script setup lang="ts">
import WordPrompt from '@/components/WordPrompt.vue'
import TileBoard from '@/components/TileBoard.vue'
import type { SilbenLegenData } from './index'

defineProps<{ data: SilbenLegenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <WordPrompt :image="data.image" :spoken="data.spoken" :size="120" />
    <TileBoard
      :tiles="data.tiles"
      :target="data.target"
      :revealed="revealed"
      :locked="locked"
      :capitalize-first="data.capitalizeFirst"
      :size="38"
      @answer="emit('answer', $event)"
    />
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
</style>
