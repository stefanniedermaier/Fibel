<script setup lang="ts">
// Stylised euro coins and notes – colour, size and value only, no real motifs
// (plaene/README.md, section 6). Values in euro, or in cent with `cent`.
import { computed } from 'vue'
const props = withDefaults(defineProps<{ value: number; size?: number; cent?: boolean }>(), {
  size: 1,
  cent: false,
})
const isNote = computed(() => !props.cent && props.value >= 5)
const NOTE_COLORS: Record<number, string> = {
  5: '#a9b8a6',
  10: '#e58a7c',
  20: '#7fa7d8',
  50: '#e9a65b',
  100: '#8fc08a',
}
// Cent coins: 1, 2, 5 copper; 10, 20, 50 gold. Euro coins: 1 € and 2 € bicoloured.
const coin = computed(() => {
  if (props.cent) {
    const copper = props.value < 10
    return {
      d: 40 + props.value / 3,
      outer: copper ? '#c77b3b' : '#e7b83e',
      inner: copper ? '#d9945a' : '#f0c95a',
      unit: 'ct',
    }
  }
  const two = props.value === 2
  return {
    d: two ? 58 : 52,
    outer: two ? '#d7d7d7' : '#e7b83e',
    inner: two ? '#e7b83e' : '#d7d7d7',
    unit: '€',
  }
})
</script>

<template>
  <svg
    v-if="isNote"
    :width="96 * size"
    :height="52 * size"
    viewBox="0 0 96 52"
    role="img"
    :aria-label="`${value}-Euro-Schein`"
  >
    <rect
      x="2"
      y="2"
      width="92"
      height="48"
      rx="6"
      :fill="NOTE_COLORS[value]"
      stroke="#33413f"
      stroke-width="3"
    />
    <rect x="10" y="10" width="30" height="32" rx="4" fill="#fff" opacity="0.5" />
    <text x="66" y="35" text-anchor="middle" font-size="24" font-weight="700" fill="#1d2b3a">
      {{ value }} €
    </text>
  </svg>
  <svg
    v-else
    :width="coin.d * size"
    :height="coin.d * size"
    viewBox="0 0 58 58"
    role="img"
    :aria-label="cent ? `${value}-Cent-Münze` : `${value}-Euro-Münze`"
  >
    <circle cx="29" cy="29" r="27" :fill="coin.outer" stroke="#5c4a1a" stroke-width="2.5" />
    <circle cx="29" cy="29" r="18" :fill="coin.inner" />
    <text x="29" y="36" text-anchor="middle" font-size="17" font-weight="700" fill="#1d2b3a">
      {{ value }} {{ coin.unit }}
    </text>
  </svg>
</template>
