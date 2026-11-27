<script setup lang="ts">
import { computed } from 'vue'

// Zahlenstrahl from `from` to `to` with a tick per number, labels every `labelEvery`,
// and an arrow at `mark` (the number to read off).
const props = withDefaults(
  defineProps<{ from?: number; to: number; mark?: number; labelEvery?: number }>(),
  { from: 0, mark: undefined, labelEvery: 5 },
)

const W = 600
const PAD = 24
const x = (n: number) => PAD + ((n - props.from) / (props.to - props.from)) * (W - 2 * PAD)
const ticks = computed(() =>
  Array.from({ length: props.to - props.from + 1 }, (_, i) => props.from + i),
)
</script>

<template>
  <svg class="line" :viewBox="`0 0 ${W} 118`" role="img" aria-label="Zahlenstrahl">
    <line :x1="PAD - 8" y1="60" :x2="W - PAD + 14" y2="60" class="axis" />
    <polygon :points="`${W - PAD + 22},60 ${W - PAD + 10},53 ${W - PAD + 10},67`" class="head" />
    <g v-for="n in ticks" :key="n">
      <line
        :x1="x(n)"
        :x2="x(n)"
        :y1="n % labelEvery === 0 ? 46 : 52"
        :y2="n % labelEvery === 0 ? 74 : 68"
        class="tick"
        :class="{ strong: n % 10 === 0 }"
      />
      <text v-if="n % labelEvery === 0" :x="x(n)" y="108" class="label">{{ n }}</text>
    </g>
    <g v-if="mark !== undefined">
      <polygon :points="`${x(mark)},44 ${x(mark) - 11},18 ${x(mark) + 11},18`" class="mark" />
    </g>
  </svg>
</template>

<style scoped>
.line {
  width: min(100%, 640px);
  height: auto;
}

.axis,
.tick {
  stroke: var(--text);
  stroke-width: 3;
}

.tick.strong {
  stroke-width: 5;
}

.head {
  fill: var(--text);
}

.label {
  font-size: 34px;
  font-weight: 700;
  text-anchor: middle;
  fill: var(--text);
}

.mark {
  fill: #d33c2c;
}
</style>
