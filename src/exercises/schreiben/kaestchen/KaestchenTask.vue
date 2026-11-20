<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WordPrompt from '@/components/WordPrompt.vue'
import { glyphTemplate, judge, recognize } from '@/core/recognizer'
import { LINES, prepareStrokes, type Point } from '@/core/strokes'
import type { KaestchenData } from './index'

// One small box per letter shows the progress; the current letter is written on a
// big pad with school lines. Not recognised → the template appears faintly and the
// child writes again; after 3 tries the letter is filled in ("with help").
const props = defineProps<{ data: KaestchenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const MAX_TRIES = 3
type BoxState = 'offen' | 'erkannt' | 'geholfen'

const index = ref(0)
const states = ref<BoxState[]>([])
const tries = ref(0)
const strokes = ref<Point[][]>([])
const showTemplate = ref(false)
const feedback = ref<'idle' | 'ok' | 'retry'>('idle')
let drawing = false

function reset() {
  index.value = 0
  states.value = props.data.chars.map(() => 'offen')
  tries.value = 0
  strokes.value = []
  showTemplate.value = false
  feedback.value = 'idle'
}
watch(() => props.data, reset, { immediate: true })

const done = computed(() => index.value >= props.data.chars.length || props.revealed)
const target = computed(() => props.data.chars[index.value] ?? '')

/** Template clouds per box, computed once per task. */
const clouds = computed(() =>
  props.data.candidates.map(
    (set) => new Map(set.map((c) => [c, glyphTemplate(props.data.glyphs[c]!)])),
  ),
)

// The pad: same coordinates as the templates (top line 0, base line 100).
const PAD_W = 110
const viewBox = `-10 -30 ${PAD_W + 20} ${LINES.bottom + 45}`
const template = computed(() => {
  const glyph = props.data.glyphs[target.value]
  if (!glyph) return []
  const dx = (PAD_W - glyph.w) / 2
  return prepareStrokes(glyph).map((s) => s.points.map((p) => ({ x: p.x + dx, y: p.y })))
})
const toPath = (pts: readonly Point[]) =>
  pts.length === 1
    ? `M${pts[0]!.x} ${pts[0]!.y} l0.1 0`
    : pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

const pad = ref<SVGSVGElement>()
function toSvg(e: PointerEvent): Point | undefined {
  const ctm = pad.value?.getScreenCTM()
  if (!ctm) return undefined
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

function down(e: PointerEvent) {
  if (props.locked || done.value) return
  const p = toSvg(e)
  if (!p) return
  try {
    pad.value?.setPointerCapture(e.pointerId)
  } catch {
    // not essential
  }
  drawing = true
  feedback.value = 'idle'
  strokes.value = [...strokes.value, [p]]
}

function move(e: PointerEvent) {
  if (!drawing) return
  const p = toSvg(e)
  if (!p) return
  const last = strokes.value[strokes.value.length - 1]!
  strokes.value = [...strokes.value.slice(0, -1), [...last, p]]
}

function up() {
  drawing = false
}

function clear() {
  strokes.value = []
  feedback.value = 'idle'
}

function finishLetter(state: BoxState) {
  states.value = states.value.map((s, i) => (i === index.value ? state : s))
  index.value++
  tries.value = 0
  strokes.value = []
  showTemplate.value = false
  if (index.value >= props.data.chars.length) emit('answer', true)
}

function check() {
  if (props.locked || done.value || strokes.value.length === 0) return
  const matches = recognize(strokes.value, clouds.value[index.value]!)
  if (judge(matches, target.value, props.data.tolerance) === 'erkannt') {
    feedback.value = 'ok'
    finishLetter('erkannt')
    return
  }
  tries.value++
  feedback.value = 'retry'
  showTemplate.value = true
  if (tries.value >= MAX_TRIES) {
    // Filled in with help: counts as one mistake (from two helped letters on: no star).
    emit('answer', false)
    finishLetter('geholfen')
  } else {
    setTimeout(() => (strokes.value = []), 700)
  }
}

const shownChar = (i: number) =>
  props.revealed || states.value[i] !== 'offen' ? props.data.chars[i] : ''
</script>

<template>
  <div class="task">
    <WordPrompt :image="data.image" :spoken="data.spoken" :size="88" />

    <ol class="boxes" aria-label="Kästchen">
      <li
        v-for="(c, i) in data.chars"
        :key="i"
        class="box"
        :class="[states[i], { current: i === index && !done }]"
      >
        {{ shownChar(i) }}
      </li>
    </ol>

    <template v-if="!done">
      <svg
        ref="pad"
        class="pad"
        :class="{ ok: feedback === 'ok', retry: feedback === 'retry' }"
        :viewBox="viewBox"
        role="img"
        :aria-label="`Schreibfeld für Buchstabe ${index + 1}`"
        @pointerdown.prevent="down"
        @pointermove.prevent="move"
        @pointerup="up"
        @pointercancel="up"
      >
        <g class="lines">
          <line x1="-10" :x2="PAD_W + 10" :y1="LINES.top" :y2="LINES.top" />
          <line class="mid" x1="-10" :x2="PAD_W + 10" :y1="LINES.middle" :y2="LINES.middle" />
          <line class="base" x1="-10" :x2="PAD_W + 10" :y1="LINES.base" :y2="LINES.base" />
          <line x1="-10" :x2="PAD_W + 10" :y1="LINES.bottom" :y2="LINES.bottom" />
        </g>
        <g v-if="showTemplate" class="template">
          <path v-for="(pts, i) in template" :key="i" :d="toPath(pts)" />
        </g>
        <path v-for="(s, i) in strokes" :key="`s${i}`" :d="toPath(s)" class="ink" />
      </svg>
      <p class="hint" :class="{ visible: feedback === 'retry' }" aria-live="polite">
        Schau dir die Vorlage an und schreib noch einmal.
      </p>
      <div class="controls">
        <button type="button" class="key" aria-label="Löschen" @click="clear">⌫</button>
        <button
          type="button"
          class="key ok"
          aria-label="Buchstabe fertig"
          :disabled="strokes.length === 0 || locked"
          @click="check"
        >
          ✓
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.boxes {
  display: flex;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 54px;
  border: 3px solid #d9c7ad;
  border-radius: 10px;
  background: var(--surface);
  font-size: 32px;
  font-weight: 700;
}

.box.current {
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 3px #ffe8b0;
}

.box.erkannt {
  border-color: var(--ok);
  background: #e6f6ea;
}

.box.geholfen {
  border-color: var(--accent-strong);
  background: #fff3d6;
}

.pad {
  width: 100%;
  max-width: 300px;
  max-height: 40vh;
  touch-action: none;
  background: #fff;
  border: 3px solid var(--accent);
  border-radius: 18px;
}

.pad.ok {
  border-color: var(--ok);
}

.pad.retry {
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

.template path {
  fill: none;
  stroke: #e3dccf;
  stroke-width: 9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ink {
  fill: none;
  stroke: var(--syllable-a);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.hint {
  min-height: 1.3em;
  margin: 0;
  color: var(--accent-strong);
  font-weight: 700;
  text-align: center;
  visibility: hidden;
}

.hint.visible {
  visibility: visible;
}

.controls {
  display: flex;
  gap: 12px;
}

.key {
  width: 88px;
  height: 60px;
  border: 3px solid var(--accent);
  border-radius: 16px;
  background: var(--surface);
  font-size: 28px;
  font-weight: 700;
  box-shadow: 0 4px 0 var(--accent-strong);
}

.key.ok {
  background: var(--accent);
}

.key:disabled {
  opacity: 0.45;
  box-shadow: none;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}
</style>
