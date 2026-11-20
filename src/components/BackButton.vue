<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

// Round back button. The arrow is drawn as SVG: the "←" character sits low in the
// Andika font and was not centred in the circle.
defineProps<{ to: RouteLocationRaw }>()
</script>

<template>
  <RouterLink class="icon-btn" :to="to" aria-label="Zurück">
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        d="M19 12H5M11 5l-7 7 7 7"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </RouterLink>
</template>
