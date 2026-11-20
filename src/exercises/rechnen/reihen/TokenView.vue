<script setup lang="ts">
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { Token } from './index'

// One element of a sequence: a coloured shape, a picture or a number.
withDefaults(defineProps<{ token: Token; size?: number }>(), { size: 48 })

const STAR = '20,3 25,15 38,15 28,23 32,36 20,28 8,36 12,23 2,15 15,15'
</script>

<template>
  <svg
    v-if="token.kind === 'form'"
    :width="size"
    :height="size"
    viewBox="0 0 40 40"
    role="img"
    :aria-label="token.name"
  >
    <circle v-if="token.shape === 'kreis'" cx="20" cy="20" r="16" :fill="token.color" />
    <rect
      v-else-if="token.shape === 'quadrat'"
      x="5"
      y="5"
      width="30"
      height="30"
      rx="3"
      :fill="token.color"
    />
    <polygon v-else-if="token.shape === 'dreieck'" points="20,4 37,35 3,35" :fill="token.color" />
    <polygon v-else-if="token.shape === 'stern'" :points="STAR" :fill="token.color" />
    <polygon v-else points="20,3 37,20 20,37 3,20" :fill="token.color" />
  </svg>
  <EmojiPicture
    v-else-if="token.kind === 'bild'"
    :code="token.image"
    :size="size"
    :label="token.name"
  />
  <span v-else class="number" :style="{ fontSize: `${size * 0.75}px` }">{{ token.value }}</span>
</template>

<style scoped>
.number {
  display: inline-block;
  min-width: 1.2em;
  font-weight: 700;
  line-height: 1;
  text-align: center;
}
</style>
