<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { SIZE, cellKey, type Pfeil, type PfeilwegData } from './index'

const props = defineProps<{ data: PfeilwegData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const ARROWS: Record<Pfeil, string> = { hoch: '↑', runter: '↓', links: '←', rechts: '→' }

const wrong = ref(new Set<string>())
const found = ref(false)
watch(
  () => props.data,
  () => {
    wrong.value = new Set()
    found.value = false
  },
)

const cells = computed(() =>
  Array.from({ length: SIZE * SIZE }, (_, i) => {
    const x = i % SIZE
    const y = Math.floor(i / SIZE)
    return { key: cellKey(x, y), start: x === props.data.start[0] && y === props.data.start[1] }
  }),
)

function tap(key: string) {
  if (props.locked || props.revealed || found.value || wrong.value.has(key)) return
  if (key === props.data.correctKey) {
    found.value = true
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, key])
    emit('answer', false)
  }
}
</script>

<template>
  <div class="task">
    <div class="arrows card" aria-hidden="true">
      <span v-for="(a, i) in data.arrows" :key="i">{{ ARROWS[a] }}</span>
    </div>
    <div class="grid" role="group" aria-label="Feld">
      <button
        v-for="(c, i) in cells"
        :key="c.key"
        type="button"
        class="cell"
        :class="{
          wrong: wrong.has(c.key),
          right: (found || revealed) && c.key === data.correctKey,
        }"
        :aria-label="`Feld ${i + 1}`"
        @click="tap(c.key)"
      >
        <EmojiPicture v-if="c.start" code="1F42D" :size="40" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.task {
  gap: 20px;
}

.arrows {
  display: flex;
  gap: 14px;
  padding: 8px 24px;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  width: min(100%, 360px);
}

.cell {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  padding: 0;
  border: 3px solid var(--accent);
  border-radius: 10px;
  background: var(--surface);
}

.cell.wrong {
  background: #eee;
  border-color: #d22f27;
}

.cell.right {
  background: #e3f0b8;
  border-color: var(--ok);
  border-width: 5px;
}
</style>
