<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { ZufallData } from './index'

defineProps<{ data: ZufallData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div class="boxes">
      <figure v-for="(b, i) in data.boxes" :key="i">
        <div class="box" role="img" :aria-label="`Dose mit ${b.length} Kugeln`">
          <span v-for="(c, j) in b" :key="j" class="ball" :style="{ background: data.colors[c] }" />
        </div>
        <figcaption v-if="data.boxes.length > 1">Dose {{ i === 0 ? 'A' : 'B' }}</figcaption>
      </figure>
    </div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
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

.boxes {
  display: flex;
  gap: 24px;
}

figure {
  margin: 0;
  text-align: center;
}

figcaption {
  font-size: 22px;
  font-weight: 700;
}

.box {
  display: grid;
  grid-template-columns: repeat(3, 34px);
  gap: 8px;
  padding: 14px;
  border: 4px solid #6a462f;
  border-top-width: 0;
  border-radius: 0 0 20px 20px;
  background: #fff8ee;
  min-height: 80px;
}

.ball {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #000;
}

.label {
  font-size: 24px;
  font-weight: 700;
}
</style>
