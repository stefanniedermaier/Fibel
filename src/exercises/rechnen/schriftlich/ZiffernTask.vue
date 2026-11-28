<script setup lang="ts">
import { computed } from 'vue'
import DigitPad from '@/components/DigitPad.vue'
import { useDigitSteps } from '@/composables/useDigitSteps'
import type { MalGeteiltData } from './malgeteilt'

const props = defineProps<{ data: MalGeteiltData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// Boxes as in the exercise book. The child taps the digit for the highlighted box;
// carries and (when dividing) the working appear as the steps are done.
const { done, explanation, shaking, tap } = useDigitSteps(
  () => props.data.steps,
  () => props,
  (correct) => emit('answer', correct),
)

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
    <DigitPad @digit="tap" />
  </div>
</template>

<style scoped>
.task {
  gap: 14px;
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
</style>
