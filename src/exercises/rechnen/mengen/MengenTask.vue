<script setup lang="ts">
import { ref, watch } from 'vue'
import DiceFace from '@/components/DiceFace.vue'
import TenFrame from '@/components/TenFrame.vue'
import type { MengenData } from './index'

const props = defineProps<{ data: MengenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const wrong = ref(new Set<number>())
const shaking = ref<number>()
const solved = ref(false)

watch(
  () => props.data,
  () => {
    wrong.value = new Set()
    solved.value = false
  },
)

function choose(n: number) {
  if (props.locked || props.revealed || solved.value || wrong.value.has(n)) return
  if (n === props.data.count) {
    solved.value = true
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, n])
    shaking.value = n
    setTimeout(() => (shaking.value = undefined), 500)
    emit('answer', false)
  }
}
</script>

<template>
  <div class="task">
    <div class="picture">
      <DiceFace v-if="data.layout === 'wuerfel'" :count="data.count" />
      <TenFrame v-else :count="data.count" :cells="data.count > 10 ? 20 : 10" />
    </div>

    <div class="choices">
      <button
        v-for="n in data.choices"
        :key="n"
        class="choice"
        :class="{
          wrong: wrong.has(n),
          correct: (solved || revealed) && n === data.count,
          shake: shaking === n,
        }"
        :disabled="wrong.has(n)"
        @click="choose(n)"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(24px, 6vh, 48px);
}

.picture {
  display: flex;
  justify-content: center;
  min-height: 160px;
  align-items: center;
}

.choices {
  display: flex;
  gap: clamp(12px, 4vw, 32px);
}

.choice {
  width: clamp(84px, 24vw, 128px);
  aspect-ratio: 1;
  border: 5px solid var(--accent);
  border-radius: 24px;
  background: var(--surface);
  font-size: clamp(44px, 12vw, 64px);
  font-weight: 700;
  box-shadow: 0 6px 0 var(--accent-strong);
  transition: transform 0.1s;
}

.choice:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--accent-strong);
}

.choice.wrong {
  opacity: 0.35;
  box-shadow: none;
}

.choice.correct {
  border-color: var(--ok);
  background: #e6f6ea;
  box-shadow: 0 6px 0 var(--ok);
  animation: pulse 0.9s ease-in-out infinite alternate;
}

.choice.shake {
  animation: shake 0.45s;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

@keyframes pulse {
  to {
    transform: scale(1.08);
  }
}
</style>
