<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { Figur, MassstabData } from './index'

defineProps<{ data: MassstabData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

/** Squares of a figure, drawn on squared paper with a margin of one square. */
const cells = (f: Figur) =>
  f.flatMap((row, r) => [...row].flatMap((c, col) => (c === '#' ? [{ r, col }] : [])))
const size = (f: Figur) => ({ w: Math.max(...f.map((r) => r.length)) + 2, h: f.length + 2 })
</script>

<template>
  <div class="task">
    <svg
      v-if="data.figur"
      class="paper big"
      :viewBox="`0 0 ${size(data.figur).w * 10} ${size(data.figur).h * 10}`"
      role="img"
      aria-label="Figur im Gitter"
      :style="{ width: `${Math.min(size(data.figur).w * 26, 240)}px` }"
    >
      <defs>
        <pattern id="kaestchen" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="#9cc3e4" stroke-width="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kaestchen)" />
      <rect
        v-for="(c, i) in cells(data.figur)"
        :key="i"
        :x="(c.col + 1) * 10"
        :y="(c.r + 1) * 10"
        width="10"
        height="10"
        fill="#F4AA41"
        stroke="#000"
        stroke-width="0.6"
      />
    </svg>
    <p v-else-if="data.prompt" class="massstab card">Maßstab {{ data.prompt }}</p>
    <ChoiceButtons
      :label-prefix="data.mode === 'plan' ? undefined : 'Figur'"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="data.mode === 'plan' ? 110 : 90"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <svg
          v-if="option.figur"
          class="paper"
          :viewBox="`0 0 ${size(option.figur).w * 10} ${size(option.figur).h * 10}`"
          :style="{ width: `${Math.min(size(option.figur).w * 15, 150)}px` }"
          aria-hidden="true"
        >
          <rect width="100%" height="100%" fill="url(#kaestchen)" />
          <rect
            v-for="(c, i) in cells(option.figur)"
            :key="i"
            :x="(c.col + 1) * 10"
            :y="(c.r + 1) * 10"
            width="10"
            height="10"
            fill="#92D3F5"
            stroke="#000"
            stroke-width="0.6"
          />
        </svg>
        <span v-else class="label">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.paper {
  max-width: 100%;
  height: auto;
  background: #fff;
}

.massstab {
  margin: 0;
  padding: 10px 24px;
  font-size: 26px;
  font-weight: 700;
}

.label {
  font-size: 26px;
  font-weight: 700;
}
</style>
