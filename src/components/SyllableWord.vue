<script setup lang="ts">
// A word split into syllables: alternately coloured (blue/red, as in many primers)
// and optionally with syllable arcs underneath. Both can be switched off by parents.
withDefaults(
  defineProps<{
    syllables: readonly string[]
    coloring?: boolean
    arcs?: boolean
    size?: number
  }>(),
  { coloring: true, arcs: false, size: 56 },
)
</script>

<template>
  <span class="word" :class="{ arcs }" :style="{ fontSize: `${size}px` }">
    <span
      v-for="(s, i) in syllables"
      :key="i"
      class="syllable"
      :class="coloring ? (i % 2 === 0 ? 'a' : 'b') : undefined"
      >{{ s }}</span
    >
  </span>
</template>

<style scoped>
.word {
  display: inline-flex;
  align-items: baseline;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.syllable {
  position: relative;
}

.a {
  color: var(--syllable-a);
}

.b {
  color: var(--syllable-b);
}

.arcs {
  padding-bottom: 0.28em;
}

.arcs .syllable {
  margin: 0 0.03em;
}

.arcs .syllable::after {
  content: '';
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: -0.24em;
  height: 0.22em;
  border: 0.06em solid currentColor;
  border-top: 0;
  border-radius: 0 0 50% 50% / 0 0 100% 100%;
}
</style>
