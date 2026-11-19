<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import SyllableWord from '@/components/SyllableWord.vue'
import type { SilbenHoerenData } from './index'

defineProps<{ data: SilbenHoerenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div class="ear" aria-hidden="true">👂</div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.target"
      :revealed="revealed"
      :locked="locked"
      :min-width="110"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <SyllableWord :syllables="[option.key]" :coloring="data.coloring" :size="52" />
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(24px, 6vh, 48px);
  width: 100%;
}

.ear {
  font-size: 96px;
  line-height: 1;
}
</style>
