<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type { SchriftlichData } from './index'

const props = defineProps<{ data: SchriftlichData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
const store = useAppStore()

// Place value table: the child taps the digit of the current column (from the right).
// Carries appear above the next column once a column is solved; when subtracting, the
// unbundled digits are shown crossed out with the new ones above them.
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

const PLACES = ['E', 'Z', 'H', 'T']
const width = computed(() => props.data.width)
const done = computed(() => (props.revealed ? props.data.columns.length : solved.value))

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

function tap(d: number) {
  if (props.locked || props.revealed || solved.value >= props.data.columns.length) return
  const col = props.data.columns[solved.value]!
  if (d === col.digit) {
    solved.value++
    explanation.value = ''
    if (solved.value === props.data.columns.length) emit('answer', true)
  } else {
    explanation.value = col.explanation
    void store.say(col.explanation)
    shaking.value = true
    setTimeout(() => (shaking.value = false), 450)
    emit('answer', false)
  }
}

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
  width: 52px;
  height: 52px;
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

.pad {
  display: grid;
  grid-template-columns: repeat(5, 60px);
  gap: 8px;
}

.key {
  height: 56px;
  border: 3px solid var(--accent);
  border-radius: 12px;
  background: var(--surface);
  font-size: 28px;
  font-weight: 700;
}

.shake {
  animation: shake 0.4s;
}

@keyframes shake {
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}
</style>
