<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  BASE_TOLERANCE,
  LINES,
  StrokeTracer,
  prepareStrokes,
  type Glyph,
  type Point,
} from '@/core/strokes'

// Tracing surface: school lines, the template in grey, the current stroke with a
// green start dot and direction arrow. A slip resets only the current stroke – it
// never counts as a mistake. Emits `done` when all strokes are traced.
const props = withDefaults(
  defineProps<{
    glyph: Glyph
    /** Multiplier for the tolerance (parents' setting). */
    tolerance?: number
    /** Show the whole letter as finished (solution / preview). */
    revealed?: boolean
    /** Only show, no input (preview in the parent area). */
    readonly?: boolean
    /** Show numbers at the stroke starts (preview). */
    numbers?: boolean
  }>(),
  { tolerance: 1, revealed: false, readonly: false, numbers: false },
)
const emit = defineEmits<{ done: []; slip: [] }>()

const MARGIN = 18
const strokes = computed(() => prepareStrokes(props.glyph))
/** Words in connected handwriting are wider than a letter: the board grows with them. */
const maxWidth = computed(() => Math.min(960, Math.max(420, (props.glyph.w + 2 * MARGIN) * 3.2)))
const viewBox = computed(() => `${-MARGIN} -30 ${props.glyph.w + 2 * MARGIN} ${LINES.bottom + 45}`)

const current = ref(0)
const trail = ref<Point[]>([])
const slipped = ref(false)
let tracer: StrokeTracer | undefined
const svg = ref<SVGSVGElement>()

watch(
  () => props.glyph,
  () => {
    current.value = 0
    trail.value = []
    slipped.value = false
  },
)

const finished = computed(() => props.revealed || current.value >= strokes.value.length)
const toPath = (points: readonly Point[]) =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

/** Arrow at the start of the current stroke, pointing in writing direction. */
const arrow = computed(() => {
  const s = strokes.value[current.value]
  if (!s || s.isDot || s.points.length < 2) return undefined
  const a = s.points[0]!
  const b = s.points[Math.min(6, s.points.length - 1)]!
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  return { x: a.x, y: a.y, angle }
})

function toSvg(e: PointerEvent): Point | undefined {
  const el = svg.value
  const ctm = el?.getScreenCTM()
  if (!el || !ctm) return undefined
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

function down(e: PointerEvent) {
  if (props.readonly || finished.value) return
  const stroke = strokes.value[current.value]
  const p = toSvg(e)
  if (!stroke || !p) return
  const t = new StrokeTracer(stroke, BASE_TOLERANCE * props.tolerance)
  if (!t.start(p)) {
    slip()
    return
  }
  // Keep receiving moves when the finger leaves the board; not essential if it fails.
  try {
    svg.value?.setPointerCapture(e.pointerId)
  } catch {
    // ignore
  }
  tracer = t
  slipped.value = false
  trail.value = [p]
  if (stroke.isDot) complete()
}

function move(e: PointerEvent) {
  if (!tracer) return
  const p = toSvg(e)
  if (!p) return
  trail.value = [...trail.value, p]
  const result = tracer.move(p)
  if (result === 'off-path') slip()
  else if (result === 'done') complete()
}

function up() {
  if (!tracer) return
  if (tracer.end()) complete()
  else slip()
}

function complete() {
  tracer = undefined
  trail.value = []
  current.value++
  if (current.value >= strokes.value.length) emit('done')
}

function slip() {
  tracer = undefined
  trail.value = []
  slipped.value = true
  emit('slip')
}
</script>

<template>
  <svg
    ref="svg"
    class="board"
    :class="{ slipped, readonly }"
    :viewBox="viewBox"
    :style="{ maxWidth: `${maxWidth}px` }"
    role="img"
    aria-label="Buchstabe zum Nachspuren"
    @pointerdown.prevent="down"
    @pointermove.prevent="move"
    @pointerup="up"
    @pointercancel="up"
  >
    <!-- School lines: top and bottom thin, middle dashed, base line strong -->
    <g class="lines">
      <line :x1="-MARGIN" :x2="glyph.w + MARGIN" :y1="LINES.top" :y2="LINES.top" />
      <line
        class="mid"
        :x1="-MARGIN"
        :x2="glyph.w + MARGIN"
        :y1="LINES.middle"
        :y2="LINES.middle"
      />
      <line class="base" :x1="-MARGIN" :x2="glyph.w + MARGIN" :y1="LINES.base" :y2="LINES.base" />
      <line :x1="-MARGIN" :x2="glyph.w + MARGIN" :y1="LINES.bottom" :y2="LINES.bottom" />
    </g>

    <!-- Template -->
    <g v-for="(s, i) in strokes" :key="i">
      <circle
        v-if="s.isDot"
        :cx="s.points[0]!.x"
        :cy="s.points[0]!.y"
        r="5"
        class="guide dot"
        :class="{ done: finished || i < current, active: !finished && i === current }"
      />
      <path
        v-else
        :d="toPath(s.points)"
        class="guide"
        :class="{ done: finished || i < current, active: !finished && i === current }"
      />
    </g>

    <!-- Start dot and direction of the current stroke -->
    <template v-if="!finished && strokes[current]">
      <circle
        :cx="strokes[current]!.points[0]!.x"
        :cy="strokes[current]!.points[0]!.y"
        r="7"
        class="start"
      />
      <g
        v-if="arrow"
        :transform="`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`"
        class="arrow"
      >
        <path d="M 12 0 L 24 0 M 18 -6 L 25 0 L 18 6" />
      </g>
    </template>

    <!-- Stroke numbers (preview) -->
    <template v-if="numbers">
      <text
        v-for="(s, i) in strokes"
        :key="`n${i}`"
        :x="s.points[0]!.x - 10"
        :y="s.points[0]!.y - 6"
        class="number"
      >
        {{ i + 1 }}
      </text>
    </template>

    <!-- The finger's trail -->
    <path v-if="trail.length > 1" :d="toPath(trail)" class="trail" />
  </svg>
</template>

<style scoped>
.board {
  width: 100%;
  max-width: 420px;
  max-height: 48vh;
  touch-action: none;
  user-select: none;
  background: #fff;
  border: 3px solid #eee2d0;
  border-radius: 18px;
}

.board.slipped {
  animation: shake 0.4s;
}

.lines line {
  stroke: #c8d6e5;
  stroke-width: 1;
}

.lines .mid {
  stroke-dasharray: 4 4;
}

.lines .base {
  stroke: #7f9cb8;
  stroke-width: 2;
}

.guide {
  fill: none;
  stroke: #e3dccf;
  stroke-width: 9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.guide.dot {
  fill: #e3dccf;
  stroke: none;
}

.guide.active {
  stroke: #ffd77a;
}

.guide.dot.active {
  fill: #ffd77a;
}

.guide.done {
  stroke: var(--syllable-a);
}

.guide.dot.done {
  fill: var(--syllable-a);
}

.start {
  fill: var(--ok);
}

.arrow path {
  fill: none;
  stroke: var(--ok);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.number {
  font-size: 12px;
  font-weight: 700;
  fill: var(--accent-strong);
}

.trail {
  fill: none;
  stroke: var(--syllable-b);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.85;
}
</style>
