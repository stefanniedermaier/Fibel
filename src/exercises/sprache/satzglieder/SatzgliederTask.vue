<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { SatzgliederData } from './index'

defineProps<{ data: SatzgliederData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <p v-if="data.mode === 'umstellen'" class="sentence card">
      <span v-for="(g, i) in data.glieder" :key="i" class="glied">{{ g }}</span>.
    </p>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="data.mode === 'umstellen' ? 280 : 90"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="label" :class="{ block: data.mode !== 'umstellen' }">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
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

.sentence {
  margin: 0;
  padding: 10px 16px;
  font-size: 22px;
}

.glied {
  display: inline-block;
  margin: 2px;
  padding: 2px 8px;
  border: 2px dashed var(--accent);
  border-radius: 8px;
}

.label {
  font-size: 20px;
  font-weight: 700;
}

.label.block {
  font-size: 24px;
}
</style>
