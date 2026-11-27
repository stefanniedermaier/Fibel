<script setup lang="ts">
import { ref, watch } from 'vue'
import { MONATE } from '../../uhr/kalender'
import { JAHRESZEITEN, type JahreskreisData } from './index'

const props = defineProps<{ data: JahreskreisData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// The year as a ring: 12 months outside (January at the top, clockwise), the four
// seasons inside. Only the ring of the question can be tapped; the other is faded.
const C = 150
const COLORS: Record<string, [string, string]> = {
  fruehling: ['#B1CC33', '#DCEAA0'],
  sommer: ['#FCEA2B', '#FFF5A8'],
  herbst: ['#F4AA41', '#FAD7A0'],
  winter: ['#92D3F5', '#D2EEFB'],
}

const wrong = ref(new Set<string>())
const found = ref(false)
watch(
  () => props.data,
  () => {
    wrong.value = new Set()
    found.value = false
  },
)

function point(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}

/** Ring segment from angle a to b (degrees, 0 = top, clockwise). */
function segment(r1: number, r2: number, a: number, b: number): string {
  const [x1, y1] = point(r2, a)
  const [x2, y2] = point(r2, b)
  const [x3, y3] = point(r1, b)
  const [x4, y4] = point(r1, a)
  const large = b - a > 180 ? 1 : 0
  return `M${x1} ${y1}A${r2} ${r2} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 ${large} 0 ${x4} ${y4}Z`
}

const seasonOfMonth = (m: number) =>
  JAHRESZEITEN.find((s) => (s.months as readonly number[]).includes(m))!

const months = MONATE.map((name, m) => {
  const [x, y] = point(118, m * 30 + 15)
  return {
    key: String(m),
    d: segment(92, 145, m * 30, m * 30 + 30),
    fill: COLORS[seasonOfMonth(m).id]![1],
    label: name.slice(0, 3),
    x,
    y,
  }
})

// Winter starts with December (11 × 30°), so the seasons are turned by -30°.
const seasons = JAHRESZEITEN.map((s, i) => {
  const a = 60 + i * 90
  const [x, y] = point(56, a + 45)
  return {
    key: s.id,
    d: segment(18, 88, a, a + 90),
    fill: COLORS[s.id]![0],
    image: `${import.meta.env.BASE_URL}img/openmoji/${s.image}.svg`,
    x,
    y,
  }
})

function tap(ring: JahreskreisData['ring'], key: string) {
  if (ring !== props.data.ring) return
  if (props.locked || props.revealed || found.value || wrong.value.has(key)) return
  if (key === props.data.correctKey) {
    found.value = true
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, key])
    emit('answer', false)
  }
}

function state(ring: JahreskreisData['ring'], key: string): string {
  if (ring !== props.data.ring) return 'off'
  if ((found.value || props.revealed) && key === props.data.correctKey) return 'right'
  return wrong.value.has(key) ? 'wrong' : ''
}
</script>

<template>
  <div class="task">
    <svg viewBox="0 0 300 300" class="ring" role="group" aria-label="Jahreskreis">
      <g
        v-for="m in months"
        :key="m.key"
        class="seg"
        :class="state('monat', m.key)"
        @click="tap('monat', m.key)"
      >
        <path :d="m.d" :fill="m.fill" stroke="#000" stroke-width="1.5" />
        <text :x="m.x" :y="m.y" text-anchor="middle" dominant-baseline="central">
          {{ m.label }}
        </text>
      </g>
      <g
        v-for="s in seasons"
        :key="s.key"
        class="seg"
        :class="state('jahreszeit', s.key)"
        @click="tap('jahreszeit', s.key)"
      >
        <path :d="s.d" :fill="s.fill" stroke="#000" stroke-width="1.5" />
        <image :href="s.image" :x="s.x - 20" :y="s.y - 20" width="40" height="40" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  justify-content: center;
  width: 100%;
}

.ring {
  width: min(100%, 420px);
  height: auto;
  touch-action: manipulation;
}

.seg {
  cursor: pointer;
}

.seg text {
  font-size: 15px;
  font-weight: 700;
  pointer-events: none;
}

.seg.off {
  opacity: 0.45;
  cursor: default;
}

.seg.wrong path {
  fill: #ccc;
  stroke: #d22f27;
  stroke-width: 3;
}

.seg.right path {
  stroke: var(--ok);
  stroke-width: 6;
}
</style>
