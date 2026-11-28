<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TextstelleData } from './index'

const props = defineProps<{ data: TextstelleData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const wrong = ref(new Set<number>())
const found = ref(false)
watch(
  () => props.data,
  () => {
    wrong.value = new Set()
    found.value = false
  },
)

function tap(i: number) {
  if (props.locked || props.revealed || found.value || wrong.value.has(i)) return
  if (i === props.data.correct) {
    found.value = true
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, i])
    emit('answer', false)
  }
}
</script>

<template>
  <div class="task">
    <p class="question">{{ data.question }}</p>
    <div class="text card">
      <button
        v-for="(s, i) in data.sentences"
        :key="i"
        type="button"
        class="sentence"
        :class="{
          wrong: wrong.has(i),
          right: (found || revealed) && i === data.correct,
        }"
        @click="tap(i)"
      >
        {{ s }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.task {
  gap: 12px;
}

.question {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.text {
  max-width: 640px;
  padding: 10px 14px;
  line-height: 1.5;
}

.sentence {
  display: inline;
  padding: 2px 3px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--text);
  font: inherit;
  font-size: 20px;
  text-align: left;
  cursor: pointer;
}

.sentence:hover {
  background: #fff5a8;
}

.sentence.wrong {
  background: #f6d5d2;
  text-decoration: line-through;
}

.sentence.right {
  background: #e3f0b8;
  outline: 3px solid var(--ok);
}
</style>
