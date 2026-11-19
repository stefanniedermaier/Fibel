<script setup lang="ts">
import { computed } from 'vue'

// Shows a picture by its Unicode code point(s), e.g. '1F98A' or '1F3F4-200D-2620'.
// Phase 2 switches this to the bundled OpenMoji SVGs; callers stay the same.
const props = withDefaults(defineProps<{ code: string; size?: number; label?: string }>(), {
  size: 48,
  label: undefined,
})

const char = computed(() =>
  String.fromCodePoint(...props.code.split('-').map((part) => parseInt(part, 16))),
)
</script>

<template>
  <span
    class="emoji"
    :style="{ fontSize: `${size}px` }"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    >{{ char }}</span
  >
</template>

<style scoped>
.emoji {
  display: inline-block;
  line-height: 1;
}
</style>
