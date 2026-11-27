<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type { MalGeteiltData } from './malgeteilt'

const props = defineProps<{ data: MalGeteiltData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
const store = useAppStore()

// Boxes as in the exercise book. The child taps the digit for the highlighted box;
// carries and (when dividing) the working appear as the steps are done.
const solved = ref(0)
const explanation = ref('')
const shaking = ref(false)
watch(
  () => props.data,
  () => {
    solved.value = 0
    explanation.value = ''
  },
)
const done = computed(() => (props.revealed ? props.data.steps.length : solved.value))

const key = (r: number, c: number) => `${r}:${c}`
const cells = computed(() => {
  const m = new Map<string, { text: string; kind: 'fixed' | 'answer' | 'work' }>()
  for (const f of props.data.fixed) m.set(key(f.row, f.col), { text: f.text, kind: 'fixed' })
  props.data.steps.slice(0, done.value).forEach((s) => {
    m.set(key(s.row, s.col), { text: String(s.digit), kind: 'answer' })
    for (const f of s.show ?? []) m.set(key(f.row, f.col), { text: f.text, kind: 'work' })
  })
  return m
})
const carries = computed(() => {
  const m = new Map<string, number>()
  props.data.steps.slice(0, done.value).forEach((s) => {
    if (s.carry) m.set(key(s.carry.row, s.carry.col), s.carry.value)
  })
  return m
})
const current = computed(() => (props.revealed ? undefined : props.data.steps[done.value]))
const filledRows = computed(
  () => new Set([...cells.value.keys()].map((k) => Number(k.split(':')[0]))),
)
/** A line appears together with the row above it (dividing: with the product). */
const lineUnder = (r: number, c: number) =>
  filledRows.value.has(r) && props.data.lines.some((l) => l.row === r && c >= l.from && c <= l.to)

function tap(d: number) {
  if (props.locked || props.revealed || solved.value >= props.data.steps.length) return
  const step = props.data.steps[solved.value]!
  if (d === step.digit) {
    solved.value++
    explanation.value = ''
    if (solved.value === props.data.steps.length) emit('answer', true)
  } else {
    explanation.value = step.explanation
    void store.say(step.explanation)
    shaking.value = true
    setTimeout(() => (shaking.value = false), 450)
    emit('answer', false)
  }
}
</script>

<template>
  <div class="task">
    <div
      class="heft card"
      :class="{ shake: shaking }"
      :style="{
        gridTemplateColumns: `repeat(${data.cols}, var(--box))`,
        '--box': `min(42px, calc((100vw - 64px) / ${data.cols}))`,
      }"
      role="group"
      :aria-label="`Rechnung ${data.task}`"
    >
      <template v-for="r in data.rows" :key="r">
        <div
          v-for="c in data.cols"
          :key="c"
          class="box"
          :class="{
            current: current && current.row === r - 1 && current.col === c - 1,
            line: lineUnder(r - 1, c - 1),
            answer: cells.get(key(r - 1, c - 1))?.kind === 'answer',
            work: cells.get(key(r - 1, c - 1))?.kind === 'work',
          }"
        >
          <span v-if="carries.has(key(r - 1, c - 1))" class="carry">{{
            carries.get(key(r - 1, c - 1))
          }}</span>
          {{ cells.get(key(r - 1, c - 1))?.text ?? '' }}
        </div>
      </template>
    </div>
    <p v-if="explanation" class="explanation">{{ explanation }}</p>
    <div class="pad" role="group" aria-label="Ziffern">
      <button v-for="d in 10" :key="d" type="button" class="key" @click="tap(d - 1)">
        {{ d - 1 }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.heft {
  display: grid;
  padding: 10px;
  background-color: #fff;
  background-image:
    linear-gradient(#cfe3f3 1px, transparent 1px),
    linear-gradient(90deg, #cfe3f3 1px, transparent 1px);
  background-size: var(--box) var(--box);
  background-position: 10px 10px;
  max-width: 100%;
  overflow-x: auto;
}

.box {
  position: relative;
  width: var(--box);
  height: var(--box);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--box) * 0.7);
  font-weight: 700;
}

.box.line {
  border-bottom: 3px solid #000;
}

.box.current {
  background: #fcea9e;
  border-radius: 6px;
  outline: 3px solid var(--accent);
}

.box.answer {
  color: #186648;
}

.box.work {
  color: #3f3f3f;
  font-weight: 600;
}

.carry {
  position: absolute;
  top: 0;
  right: 2px;
  font-size: calc(var(--box) * 0.35);
  color: #d22f27;
}

.explanation {
  max-width: 520px;
  margin: 0;
  font-size: 18px;
  text-align: center;
}

.pad {
  display: grid;
  grid-template-columns: repeat(5, 60px);
  gap: 8px;
}

.key {
  height: 56px;
  font-size: 28px;
  font-weight: 700;
  border-radius: 14px;
  border: 3px solid var(--accent);
  background: #fff;
}

.shake {
  animation: shake 0.4s;
}

@keyframes shake {
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}
</style>
