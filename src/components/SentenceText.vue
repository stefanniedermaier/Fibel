<script setup lang="ts">
import SyllableWord from '@/components/SyllableWord.vue'
import type { SentenceToken } from '@/core/saetze'

// A sentence, word by word with the same syllable colours as single words.
withDefaults(
  defineProps<{
    tokens: readonly SentenceToken[]
    coloring?: boolean
    arcs?: boolean
    size?: number
  }>(),
  { coloring: true, arcs: false, size: 44 },
)
</script>

<template>
  <p class="sentence">
    <SyllableWord
      v-for="(t, i) in tokens"
      :key="i"
      :syllables="t.syllables"
      :coloring="coloring"
      :arcs="arcs"
      :size="size"
    />
  </p>
</template>

<style scoped>
.sentence {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0 0.4em;
  margin: 0;
}
</style>
