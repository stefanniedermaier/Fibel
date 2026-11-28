<script setup lang="ts">
import { ref, watch } from 'vue'
import NumberInput from '@/components/NumberInput.vue'
import type { HalbschriftlichData } from './index'

const props = defineProps<{ data: HalbschriftlichData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// The steps are solved one after another; only the last one finishes the task.
const step = ref(0)
watch(
  () => props.data,
  () => (step.value = 0),
)

function onAnswer(correct: boolean) {
  if (!correct) return emit('answer', false)
  if (step.value < props.data.steps.length - 1) step.value++
  else emit('answer', true)
}
</script>

<template>
  <div class="task">
    <p class="task-line">{{ data.task }} = ?</p>
    <ol class="steps card">
      <li
        v-for="(s, i) in data.steps"
        :key="i"
        :class="{ done: i < step || revealed, current: i === step && !revealed }"
      >
        <span class="calc">{{ s.text }} =</span>
        <span v-if="i < step || revealed" class="value">{{ s.answer }}</span>
        <span v-else-if="i > step" class="value muted">…</span>
      </li>
    </ol>
    <NumberInput
      v-if="!revealed"
      :key="step"
      :answer="data.steps[step]!.answer"
      :revealed="revealed"
      :locked="locked"
      @answer="onAnswer"
    />
  </div>
</template>

<style scoped>
.task {
  gap: 14px;
}

.task-line {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
}

.steps {
  margin: 0;
  padding: 10px 24px 10px 44px;
  font-size: 26px;
}

.steps li {
  padding: 2px 0;
}

.current .calc {
  color: var(--accent-strong);
  font-weight: 700;
}

.done .value {
  font-weight: 700;
  color: var(--ok);
}

.value {
  margin-left: 8px;
}
</style>
