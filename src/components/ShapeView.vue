<script setup lang="ts">
import { computed } from 'vue'
import type { ShapeKind } from './shapes'

// A flat shape as SVG: circle, triangle, square, rectangle, pentagon, hexagon, or an
// irregular quadrilateral ("viereck"). Rotation and colour vary so the child learns the
// shape, not one picture of it.

const props = withDefaults(
  defineProps<{ kind: ShapeKind; rotate?: number; color?: string; size?: number }>(),
  { rotate: 0, color: '#5b9be0', size: 110 },
)

function regular(n: number, r = 42): string {
  return Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`
  }).join(' ')
}

const points = computed(() => {
  switch (props.kind) {
    case 'dreieck':
      return '50,8 92,84 8,84'
    case 'quadrat':
      return '16,16 84,16 84,84 16,84'
    case 'rechteck':
      return '4,28 96,28 96,72 4,72'
    case 'viereck':
      return '22,18 88,28 76,82 10,70'
    case 'fuenfeck':
      return regular(5)
    case 'sechseck':
      return regular(6)
    default:
      return ''
  }
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" aria-hidden="true">
    <g :transform="`rotate(${rotate} 50 50)`">
      <circle v-if="kind === 'kreis'" cx="50" cy="50" r="42" :fill="color" class="edge" />
      <polygon v-else :points="points" :fill="color" class="edge" />
    </g>
  </svg>
</template>

<style scoped>
.edge {
  stroke: #1d2b3a;
  stroke-width: 3;
  stroke-linejoin: round;
}
</style>
