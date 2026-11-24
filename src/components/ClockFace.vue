<script setup lang="ts">
import { computed, ref } from 'vue'
import { digital, fromTotal } from '@/exercises/rechnen/uhr/time'

// Analogue clock like the learning clocks used at school: short blue hour hand, long red
// minute hand. With `settable` both hands can be dragged (or moved with the arrow keys);
// as on a real clock, the hour hand moves along with the minute hand.
const props = withDefaults(
  defineProps<{
    /** Minutes since 12:00 (0–719). */
    total: number
    settable?: boolean
    /** Minute steps the minute hand snaps to when dragged. */
    snap?: number
    /** Small minute numbers (5, 10 … 55) around the face. */
    minuteLabels?: boolean
    /** Accessible name of the whole clock. */
    label?: string
  }>(),
  { settable: false, snap: 5, minuteLabels: false, label: 'Uhr' },
)
const emit = defineEmits<{ 'update:total': [total: number] }>()

const R = 92
const minute = computed(() => ((props.total % 60) + 60) % 60)
const minuteAngle = computed(() => minute.value * 6)
const hourAngle = computed(() => ((((props.total % 720) + 720) % 720) / 720) * 360)

const hourNumbers = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  const a = (n * 30 * Math.PI) / 180
  return { n, x: Math.sin(a) * 72, y: -Math.cos(a) * 72 }
})
const minuteNumbers = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180
  return { n: i * 5, x: Math.sin(a) * 104, y: -Math.cos(a) * 104 }
})
const ticks = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 6 * Math.PI) / 180
  const inner = i % 5 === 0 ? 80 : 86
  return {
    big: i % 5 === 0,
    x1: Math.sin(a) * inner,
    y1: -Math.cos(a) * inner,
    x2: Math.sin(a) * R,
    y2: -Math.cos(a) * R,
  }
})

const viewBox = computed(() => (props.minuteLabels ? '-116 -116 232 232' : '-100 -100 200 200'))

// --- Setting the clock --------------------------------------------------------------

const svg = ref<SVGSVGElement>()
const dragging = ref<'hour' | 'minute'>()

function pointerAngle(e: PointerEvent): { angle: number; radius: number } {
  const box = svg.value!.getBoundingClientRect()
  const dx = e.clientX - (box.left + box.width / 2)
  const dy = e.clientY - (box.top + box.height / 2)
  const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
  const scale = (props.minuteLabels ? 232 : 200) / box.width
  return { angle, radius: Math.hypot(dx, dy) * scale }
}

const angleGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return Math.min(d, 360 - d)
}

function setMinute(angle: number) {
  const snapped = Math.round(angle / 6 / props.snap) * props.snap
  let delta = (snapped % 60) - minute.value
  if (delta > 30) delta -= 60
  if (delta < -30) delta += 60
  if (delta !== 0) emit('update:total', (((props.total + delta) % 720) + 720) % 720)
}

function setHour(angle: number) {
  const hour = (((Math.round((angle - minute.value / 2) / 30) % 12) + 12) % 12) as number
  const total = hour * 60 + minute.value
  if (total !== props.total) emit('update:total', total)
}

function move(hand: 'hour' | 'minute', angle: number) {
  if (hand === 'minute') setMinute(angle)
  else setHour(angle)
}

function down(e: PointerEvent) {
  if (!props.settable) return
  const { angle, radius } = pointerAngle(e)
  if (radius < 14) return
  // Take the hand the finger is nearest to; if both are close, the inner one is the hour hand.
  const toHour = angleGap(angle, hourAngle.value)
  const toMinute = angleGap(angle, minuteAngle.value)
  const hand =
    toHour + 8 < toMinute || (Math.abs(toHour - toMinute) <= 8 && radius < 56) ? 'hour' : 'minute'
  dragging.value = hand
  svg.value?.setPointerCapture?.(e.pointerId)
  move(hand, angle)
}

function drag(e: PointerEvent) {
  if (dragging.value) move(dragging.value, pointerAngle(e).angle)
}

function up(e: PointerEvent) {
  dragging.value = undefined
  if (svg.value?.hasPointerCapture?.(e.pointerId)) svg.value.releasePointerCapture(e.pointerId)
}

function key(hand: 'hour' | 'minute', e: KeyboardEvent) {
  if (!props.settable) return
  const step = hand === 'hour' ? 60 : props.snap
  const dir = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]
  if (!dir) return
  e.preventDefault()
  emit('update:total', (((props.total + dir * step) % 720) + 720) % 720)
}

const valueText = computed(() => digital(fromTotal(props.total)))
</script>

<template>
  <svg
    ref="svg"
    class="clock"
    :class="{ settable, dragging: !!dragging }"
    :viewBox="viewBox"
    :role="settable ? 'group' : 'img'"
    :aria-label="label"
    @pointerdown="down"
    @pointermove="drag"
    @pointerup="up"
    @pointercancel="up"
  >
    <circle class="face" :r="R" />
    <line
      v-for="(t, i) in ticks"
      :key="i"
      :class="t.big ? 'tick big' : 'tick'"
      :x1="t.x1"
      :y1="t.y1"
      :x2="t.x2"
      :y2="t.y2"
    />
    <text
      v-for="n in hourNumbers"
      :key="n.n"
      class="hour-number"
      :x="n.x"
      :y="n.y"
      text-anchor="middle"
      dominant-baseline="central"
    >
      {{ n.n }}
    </text>
    <template v-if="minuteLabels">
      <text
        v-for="n in minuteNumbers"
        :key="`m${n.n}`"
        class="minute-number"
        :x="n.x"
        :y="n.y"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {{ n.n }}
      </text>
    </template>

    <g
      class="hand hour"
      :style="{ transform: `rotate(${hourAngle}deg)` }"
      :tabindex="settable ? 0 : undefined"
      :role="settable ? 'slider' : undefined"
      :aria-label="settable ? 'Stundenzeiger' : undefined"
      :aria-valuemin="settable ? 0 : undefined"
      :aria-valuemax="settable ? 719 : undefined"
      :aria-valuenow="settable ? total : undefined"
      :aria-valuetext="settable ? valueText : undefined"
      @keydown="key('hour', $event)"
    >
      <line x1="0" y1="10" x2="0" y2="-42" />
    </g>
    <g
      class="hand minute"
      :style="{ transform: `rotate(${minuteAngle}deg)` }"
      :tabindex="settable ? 0 : undefined"
      :role="settable ? 'slider' : undefined"
      :aria-label="settable ? 'Minutenzeiger' : undefined"
      :aria-valuemin="settable ? 0 : undefined"
      :aria-valuemax="settable ? 719 : undefined"
      :aria-valuenow="settable ? total : undefined"
      :aria-valuetext="settable ? valueText : undefined"
      @keydown="key('minute', $event)"
    >
      <line x1="0" y1="14" x2="0" y2="-62" />
    </g>
    <circle class="hub" r="6" />
  </svg>
</template>

<style scoped>
.clock {
  display: block;
  width: min(72vw, 38vh, 320px);
  height: auto;
  overflow: visible;
}

.clock.settable {
  width: min(80vw, 44vh, 360px);
  touch-action: none;
  cursor: grab;
}

.clock.dragging {
  cursor: grabbing;
}

.face {
  fill: var(--surface);
  stroke: var(--accent-strong);
  stroke-width: 5;
}

.tick {
  stroke: var(--muted);
  stroke-width: 1.2;
}

.tick.big {
  stroke: var(--text);
  stroke-width: 3;
}

.hour-number {
  font-size: 17px;
  font-weight: 700;
  fill: var(--text);
}

.minute-number {
  font-size: 10px;
  fill: var(--muted);
}

.hand {
  transform-box: view-box;
  transform-origin: 0 0;
  stroke-linecap: round;
  outline: none;
  transition: transform 0.5s ease-in-out;
}

.dragging .hand {
  transition: none;
}

.hand.hour line {
  stroke: var(--syllable-a);
  stroke-width: 9;
}

.hand.minute line {
  stroke: var(--syllable-b);
  stroke-width: 5;
}

.hand:focus-visible line {
  filter: drop-shadow(0 0 4px var(--accent-strong));
}

.hub {
  fill: var(--text);
}
</style>
