<script setup lang="ts">
import { ref, watch } from 'vue'
import TippenTask from '../tippen/TippenTask.vue'
import type { AbschreibenData } from './index'

const props = defineProps<{ data: AbschreibenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// "show": the word is visible; "write": covered, the child types it from memory.
const phase = ref<'show' | 'write'>('show')
watch(
  () => props.data,
  () => (phase.value = 'show'),
)

function onAnswer(correct: boolean) {
  emit('answer', correct)
  // After a mistake the child may look again.
}
</script>

<template>
  <div class="task">
    <template v-if="phase === 'show' && !revealed">
      <div class="word card">
        <span class="text">{{ data.target }}</span>
        <span v-if="data.merkwort" class="badge">⭐ Merkwort</span>
      </div>
      <button type="button" class="btn btn-primary" @click="phase = 'write'">Gemerkt ✓</button>
    </template>
    <template v-else>
      <TippenTask :data="data" :revealed="revealed" :locked="locked" @answer="onAnswer" />
      <button v-if="!revealed && !locked" type="button" class="btn" @click="phase = 'show'">
        👀 Nochmal ansehen
      </button>
    </template>
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

.word {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 40px;
}

.text {
  font-size: 72px;
  font-weight: 700;
}

.badge {
  font-size: 18px;
  color: var(--muted);
}
</style>
