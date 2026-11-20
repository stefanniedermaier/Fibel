<script setup lang="ts">
import EmojiPicture from '@/components/EmojiPicture.vue'
import { useAppStore } from '@/stores/app'

// What the child gets as the "question": the picture of the word – or, for words
// without a picture (verbs, names, small words …), a big button to hear it again.
withDefaults(defineProps<{ image?: string; spoken: string; size?: number }>(), {
  image: undefined,
  size: 120,
})
const store = useAppStore()
</script>

<template>
  <EmojiPicture v-if="image" :code="image" :size="size" />
  <button
    v-else
    type="button"
    class="hear"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.45}px` }"
    aria-label="Wort anhören"
    @click="store.say(spoken)"
  >
    🔊
  </button>
</template>

<style scoped>
.hear {
  border: 5px solid var(--accent);
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 6px 0 var(--accent-strong);
}

.hear:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--accent-strong);
}
</style>
