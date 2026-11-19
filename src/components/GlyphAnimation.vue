<script setup lang="ts">
import { computed } from 'vue'
import { LINES, prepareStrokes, type Glyph, type Point } from '@/core/strokes'

// Plays the stroke order: each stroke is drawn one after the other.
// Restart by changing `run` (e.g. a counter).
const props = defineProps<{ glyph: Glyph; run: number }>()

const MARGIN = 18
const STROKE_SECONDS = 0.9
const strokes = computed(() => prepareStrokes(props.glyph))
const viewBox = computed(() => `${-MARGIN} -30 ${props.glyph.w + 2 * MARGIN} ${LINES.bottom + 45}`)
const toPath = (points: readonly Point[]) =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
</script>

<template>
  <svg :key="run" class="anim" :viewBox="viewBox" role="img" aria-label="Schreibreihenfolge">
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
    <g v-for="(s, i) in strokes" :key="i">
      <circle
        v-if="s.isDot"
        :cx="s.points[0]!.x"
        :cy="s.points[0]!.y"
        r="5"
        class="dot"
        :style="{ animationDelay: `${i * STROKE_SECONDS}s` }"
      />
      <path
        v-else
        :d="toPath(s.points)"
        pathLength="1"
        class="stroke"
        :style="{
          animationDelay: `${i * STROKE_SECONDS}s`,
          animationDuration: `${STROKE_SECONDS}s`,
        }"
      />
      <text :x="s.points[0]!.x - 10" :y="s.points[0]!.y - 6" class="number">{{ i + 1 }}</text>
    </g>
  </svg>
</template>

<style scoped>
.anim {
  width: 100%;
  max-width: 420px;
  max-height: 46vh;
  background: #fff;
  border: 3px solid #eee2d0;
  border-radius: 18px;
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

.stroke {
  fill: none;
  stroke: var(--syllable-a);
  stroke-width: 9;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation-name: draw;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.dot {
  fill: var(--syllable-a);
  opacity: 0;
  animation: appear 0.3s forwards;
}

.number {
  font-size: 12px;
  font-weight: 700;
  fill: var(--accent-strong);
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes appear {
  to {
    opacity: 1;
  }
}
</style>
