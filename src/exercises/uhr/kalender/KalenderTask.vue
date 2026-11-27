<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import { useAppStore } from '@/stores/app'
import type { KalenderData } from './index'

defineProps<{ data: KalenderData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
const store = useAppStore()
</script>

<template>
  <div class="task">
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="200"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="name">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
    <div class="listen">
      <button
        v-for="c in data.choices"
        :key="c.key"
        type="button"
        class="btn small"
        @click="store.say(c.label)"
      >
        🔊 {{ c.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.name {
  font-size: 30px;
  font-weight: 700;
}

.listen {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.btn.small {
  min-height: 48px;
  font-size: 16px;
}
</style>
