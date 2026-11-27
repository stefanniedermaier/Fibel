<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { HUES, type KombinatorikData } from './index'

defineProps<{ data: KombinatorikData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div class="rows card">
      <div class="row">
        <span
          v-for="i in data.a.count"
          :key="i"
          :style="{ filter: `hue-rotate(${HUES[i - 1]}deg)` }"
        >
          <EmojiPicture :code="data.a.image" :size="56" />
        </span>
      </div>
      <div class="row">
        <span v-for="i in data.b.count" :key="i" :style="{ filter: `hue-rotate(${HUES[i]}deg)` }">
          <EmojiPicture :code="data.b.image" :size="56" />
        </span>
      </div>
    </div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
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
  gap: 24px;
  width: 100%;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 20px;
}

.row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.label {
  font-size: 36px;
  font-weight: 700;
}
</style>
