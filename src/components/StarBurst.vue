<script setup lang="ts">
import { ref, watch } from 'vue'

// A big star pops up and flies to the star counter. Increase `trigger` to play it.
const props = defineProps<{ trigger: number }>()
const playing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.trigger,
  () => {
    playing.value = false
    clearTimeout(timer)
    requestAnimationFrame(() => {
      playing.value = true
      timer = setTimeout(() => (playing.value = false), 1100)
    })
  },
)
</script>

<template>
  <div v-if="playing" class="burst" aria-hidden="true">⭐</div>
</template>

<style scoped>
.burst {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  font-size: 160px;
  line-height: 1;
  pointer-events: none;
  animation: fly 1.05s ease-in forwards;
}

@keyframes fly {
  0% {
    transform: translate(-50%, -50%) scale(0.2) rotate(-30deg);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
    opacity: 1;
  }
  55% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(50vw - 80px), calc(-50vh + 10px)) scale(0.2);
    opacity: 0.3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .burst {
    animation-duration: 0.6s;
  }
}
</style>
