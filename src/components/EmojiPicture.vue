<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Shows an OpenMoji picture by its code point(s), e.g. '1F98A' or '1F426-200D-2B1B'.
// The SVGs are bundled (npm run data:openmoji); if one is missing, the system emoji is shown.
const props = withDefaults(defineProps<{ code: string; size?: number; label?: string }>(), {
  size: 48,
  label: undefined,
})

const failed = ref(false)
watch(
  () => props.code,
  () => (failed.value = false),
)

const src = computed(() => `${import.meta.env.BASE_URL}img/openmoji/${props.code}.svg`)
const char = computed(() =>
  String.fromCodePoint(...props.code.split('-').map((part) => parseInt(part, 16))),
)
</script>

<template>
  <img
    v-if="!failed"
    class="emoji"
    :src="src"
    :width="size"
    :height="size"
    :alt="label ?? ''"
    :aria-hidden="label ? undefined : 'true'"
    draggable="false"
    @error="failed = true"
  />
  <span
    v-else
    class="emoji fallback"
    :style="{ fontSize: `${size * 0.85}px` }"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    >{{ char }}</span
  >
</template>

<style scoped>
.emoji {
  display: inline-block;
  flex: none;
  line-height: 1;
  -webkit-user-drag: none;
}

.fallback {
  text-align: center;
}
</style>
