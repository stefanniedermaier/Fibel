<script setup lang="ts">
import { computed } from 'vue'
import DigitPad from '@/components/DigitPad.vue'
import { useDigitSteps } from '@/composables/useDigitSteps'
import type { SchriftlichData } from './index'

const props = defineProps<{ data: SchriftlichData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// Place value table: the child taps the digit of the current column (from the right).
// Carries appear above the next column once a column is solved; when subtracting, the
// unbundled digits are shown crossed out with the new ones above them.
const { done, explanation, shaking, tap } = useDigitSteps(
  () => props.data.columns,
  () => props,
  (correct) => emit('answer', correct),
)

const PLACES = ['E', 'Z', 'H', 'T', 'ZT', 'HT', 'M']
const width = computed(() => props.data.width)

/** Digit of a number in column i (0 = ones), or '' beyond its length. */
const digit = (n: number, i: number) =>
  n >= 10 ** i || i === 0 ? String(Math.floor(n / 10 ** i) % 10) : ''

/** Top row of a subtraction: changed digits after unbundling, as far as solved. */
const topNow = computed(() => {
  let top: number[] | undefined
  for (let i = 0; i < done.value; i++) top = props.data.columns[i]?.top ?? top
  // Unbundling shows as soon as the column that needs it is current.
  const current = props.data.columns[done.value]
  if (current?.top && explanation.value) top = current.top
  return top
})

const carries = computed(() =>
  Array.from({ length: width.value }, (_, i) =>
    i > 0 && i <= done.value ? props.data.columns[i - 1]?.carry || '' : '',
  ),
)

const cols = computed(() => Array.from({ length: width.value }, (_, k) => width.value - 1 - k))
</script>

<template>
  <div class="task">
    <table class="tafel card" :class="{ shake: shaking }" aria-label="Stellenwerttafel">
      <thead>
        <tr>
          <th />
          <th v-for="i in cols" :key="i">{{ PLACES[i] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, k) in data.rows" :key="k">
          <td class="sign">
            {{ k === data.rows.length - 1 ? (data.op === '+' ? '+' : '−') : '' }}
          </td>
          <td v-for="i in cols" :key="i" class="cell">
            <template
              v-if="
                k === 0 && data.op === '-' && topNow && topNow[i] !== Math.floor(r / 10 ** i) % 10
              "
            >
              <span class="new">{{ topNow[i] }}</span><s>{{ digit(r, i) }}</s>
            </template>
            <template v-else>{{ digit(r, i) }}</template>
          </td>
        </tr>
        <tr v-if="data.op === '+'" class="carries">
          <td />
          <td v-for="i in cols" :key="i">{{ carries[i] }}</td>
        </tr>
        <tr class="result">
          <td>=</td>
          <td
            v-for="i in cols"
            :key="i"
            class="cell"
            :class="{ current: i === done && !revealed && i < data.columns.length }"
          >
            {{ i < done ? data.columns[i]?.digit : '' }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="explanation" class="explanation">{{ explanation }}</p>
    <DigitPad @digit="tap" />
  </div>
</template>

<style scoped>
.task {
  gap: 14px;
}

.tafel {
  border-collapse: collapse;
  font-size: 34px;
  font-weight: 700;
  padding: 8px 14px;
}

.tafel th {
  font-size: 16px;
  color: var(--text-muted, #777);
  padding: 0 10px;
}

.tafel td {
  width: min(52px, 10.5vw);
  height: min(52px, 10.5vw);
  text-align: center;
}

.sign {
  width: 30px !important;
}

.carries td {
  height: 22px;
  font-size: 18px;
  color: #d22f27;
  vertical-align: bottom;
}

.result td {
  border-top: 4px solid var(--text);
}

.cell.current {
  background: #fff5a8;
  outline: 3px solid var(--accent);
}

.new {
  display: block;
  font-size: 16px;
  color: #d22f27;
  line-height: 1;
}

s {
  text-decoration-thickness: 3px;
}

.explanation {
  margin: 0;
  max-width: 520px;
  font-size: 18px;
  text-align: center;
}
</style>
