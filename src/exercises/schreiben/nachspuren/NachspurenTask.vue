<script setup lang="ts">
import { ref, watch } from 'vue'
import TraceBoard from '@/components/TraceBoard.vue'
import type { NachspurenData } from './index'

const props = defineProps<{ data: NachspurenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// A slip only resets the current stroke and shows a hint – tracing is motor practice,
// not a test, so it never costs the star.
const hint = ref(false)
watch(
  () => props.data,
  () => (hint.value = false),
)
</script>

<template>
  <div class="task">
    <TraceBoard
      :glyph="data.glyph"
      :tolerance="data.tolerance"
      :revealed="revealed"
      :readonly="locked"
      @slip="hint = true"
      @done="emit('answer', true)"
    />
    <p class="hint" :class="{ visible: hint }" aria-live="polite">
      Fang beim grünen Punkt an und bleib auf der Linie.
    </p>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.hint {
  min-height: 1.4em;
  margin: 0;
  color: var(--accent-strong);
  font-weight: 700;
  text-align: center;
  visibility: hidden;
}

.hint.visible {
  visibility: visible;
}
</style>
