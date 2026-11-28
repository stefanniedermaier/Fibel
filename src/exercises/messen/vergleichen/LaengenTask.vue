<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { LaengenData } from './index'

defineProps<{ data: LaengenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="laengen">
    <ChoiceButtons
      class="pencils"
      label-prefix="Stift"
      :options="data.pencils"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="300"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <svg class="pencil" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0" y="1" :width="option.length - 8" height="10" :fill="option.color" />
          <polygon
            :points="`${option.length - 8},1 ${option.length},6 ${option.length - 8},11`"
            fill="#f3d9a7"
          />
        </svg>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.laengen {
  width: 100%;
}

.pencils {
  flex-direction: column;
  align-items: stretch;
}

.pencil {
  width: min(78vw, 520px);
  height: 34px;
}
</style>
