<script setup lang="ts">
import { ref, watch } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { LageData } from './index'

const props = defineProps<{ data: LageData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const wrong = ref(new Set<string>())
const solved = ref(false)
watch(
  () => props.data,
  () => {
    wrong.value = new Set()
    solved.value = false
  },
)

function choose(key: string) {
  if (props.locked || props.revealed || solved.value || wrong.value.has(key)) return
  if (key === props.data.correctKey) {
    solved.value = true
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, key])
    emit('answer', false)
  }
}
</script>

<template>
  <div class="task" :class="[data.mode, { many: data.places.length > 4 }]">
    <span v-if="data.start" class="flag" aria-hidden="true">🏁</span>
    <template v-if="data.mode === 'kreuz'">
      <span class="centre" aria-hidden="true"
        ><EmojiPicture :code="data.centre!" :size="110"
      /></span>
    </template>
    <button
      v-for="(p, i) in data.places"
      :key="p.key"
      type="button"
      class="animal"
      :class="[
        `at-${p.place}`,
        {
          wrong: wrong.has(p.key),
          correct: (solved || revealed) && p.key === data.correctKey,
        },
      ]"
      :aria-label="`Tier ${i + 1}`"
      :disabled="wrong.has(p.key)"
      @click="choose(p.key)"
    >
      <EmojiPicture :code="p.image" :size="72" />
    </button>
  </div>
</template>

<style scoped>
.task.kreuz {
  display: grid;
  grid-template: repeat(3, auto) / repeat(3, auto);
  place-items: center;
  gap: 8px;
}

.task.reihe {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 8px;
}

.centre {
  grid-area: 2 / 2;
}

.at-links {
  grid-area: 2 / 1;
}

.at-rechts {
  grid-area: 2 / 3;
}

.at-ueber {
  grid-area: 1 / 2;
}

.at-unter {
  grid-area: 3 / 2;
}

.animal {
  padding: 6px;
  border: 5px solid var(--accent);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: 0 5px 0 var(--accent-strong);
}

.reihe .animal :deep(img) {
  width: clamp(48px, 17vw, 72px);
  height: auto;
}

.reihe.many {
  gap: 4px;
}

.reihe.many .animal {
  padding: 3px;
  border-width: 4px;
}

.reihe.many .animal :deep(img) {
  width: clamp(36px, 11vw, 64px);
}

.flag {
  align-self: center;
  font-size: clamp(28px, 8vw, 44px);
}

.animal.wrong {
  opacity: 0.35;
  box-shadow: none;
}

.animal.correct {
  border-color: var(--ok);
  background: #e6f6ea;
  box-shadow: 0 5px 0 var(--ok);
}
</style>
