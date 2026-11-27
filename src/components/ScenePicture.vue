<script setup lang="ts">
import { computed } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'

// The picture of a sentence: a few OpenMoji pictures side by side (Oma + palette, three ducks).
const props = withDefaults(defineProps<{ scene: readonly string[]; size?: number }>(), {
  size: 72,
})
// Many equal pictures (counting) get smaller, so they fit on a button.
const each = computed(() => (props.scene.length > 3 ? Math.round(props.size * 0.6) : props.size))
</script>

<template>
  <span class="scene">
    <EmojiPicture v-for="(code, i) in scene" :key="i" :code="code" :size="each" />
  </span>
</template>

<style scoped>
.scene {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  max-width: 260px;
}
</style>
