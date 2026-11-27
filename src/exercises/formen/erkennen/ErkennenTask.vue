<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import ShapeView from '@/components/ShapeView.vue'
import type { ErkennenData } from './index'

defineProps<{ data: ErkennenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <template v-if="data.mode === 'ecken'">
      <ShapeView v-bind="data.shapes[0]!" :size="160" />
      <ChoiceButtons
        :options="data.choices"
        :correct-key="data.correctKey"
        :revealed="revealed"
        :locked="locked"
        @answer="emit('answer', $event)"
      >
        <template #default="{ option }">
          <span class="number">{{ option.label }}</span>
        </template>
      </ChoiceButtons>
    </template>
    <ChoiceButtons
      v-else
      label-prefix="Form"
      :options="data.shapes"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <ShapeView :kind="option.kind" :rotate="option.rotate" :color="option.color" :size="96" />
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

.number {
  font-size: 44px;
  font-weight: 700;
}
</style>
