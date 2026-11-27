<script setup lang="ts">
// Stylised euro coins and notes – colour, size and value only, no real motifs
// (plaene/README.md, section 6). Values in euro.
import { computed } from 'vue'
const props = withDefaults(defineProps<{ value: number; size?: number }>(), { size: 1 })
const isNote = computed(() => props.value >= 5)
const NOTE_COLORS: Record<number, string> = { 5: '#a9b8a6', 10: '#e58a7c', 20: '#7fa7d8' }
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
    :width="(value === 2 ? 58 : 52) * size"
    :height="(value === 2 ? 58 : 52) * size"
    viewBox="0 0 58 58"
    role="img"
    :aria-label="`${value}-Euro-Münze`"
  >
    <circle
      cx="29"
      cy="29"
      r="27"
      :fill="value === 2 ? '#d7d7d7' : '#e7b83e'"
      stroke="#5c4a1a"
      stroke-width="2.5"
    />
    <circle cx="29" cy="29" r="18" :fill="value === 2 ? '#e7b83e' : '#d7d7d7'" />
    <text x="29" y="36" text-anchor="middle" font-size="18" font-weight="700" fill="#1d2b3a">
      {{ value }} €
    </text>
  </svg>
</template>
