<script setup lang="ts">
import EmojiPicture from '@/components/EmojiPicture.vue'
import TileBoard from '@/components/TileBoard.vue'
import type { BuchstabenLegenData } from './index'

defineProps<{ data: BuchstabenLegenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <EmojiPicture :code="data.image" :size="120" />
    <TileBoard
      :tiles="data.tiles"
      :target="data.target"
      :revealed="revealed"
      :locked="locked"
      :capitalize-first="data.capitalizeFirst"
      :size="data.tiles.length > 7 ? 30 : 36"
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
