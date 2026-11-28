<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { COLS, ROWS, type SymmetrieData } from './index'

const emit = defineEmits<{ answer: [correct: boolean] }>()

const S = 30
const pos = (c: string) => c.split('-').map((v) => Number(v) * S + 4) as [number, number]
const props = defineProps<{ data: SymmetrieData; revealed: boolean; locked: boolean }>()
const optionCells = (key: string) => props.data.options?.find((o) => o.key === key)?.cells ?? []
</script>

<template>
  <div class="task">
    <svg
      class="figure card"
      :viewBox="`0 0 ${COLS * S + 8} ${ROWS * S + 8}`"
      role="img"
      aria-label="Figur aus Kästchen"
    >
      <g stroke="#ddd" stroke-width="1">
        <path v-for="x in COLS + 1" :key="`x${x}`" :d="`M${(x - 1) * S + 4} 4v${ROWS * S}`" />
        <path v-for="y in ROWS + 1" :key="`y${y}`" :d="`M4 ${(y - 1) * S + 4}h${COLS * S}`" />
      </g>
      <rect
        v-for="c in data.cells"
        :key="c"
        :x="pos(c)[0]"
        :y="pos(c)[1]"
        :width="S"
        :height="S"
        :fill="data.color"
        stroke="#000"
        stroke-width="1.5"
      />
      <path
        :d="`M${(COLS / 2) * S + 4} 0v${ROWS * S + 8}`"
        stroke="#000"
        stroke-width="3"
        stroke-dasharray="8 6"
      />
    </svg>
    <ChoiceButtons
      label-prefix="Antwort"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="130"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <svg
          v-if="data.mode === 'ergaenzen'"
          class="half"
          :viewBox="`0 0 ${(COLS / 2) * S + 8} ${ROWS * S + 8}`"
          aria-hidden="true"
        >
          <g stroke="#ddd" stroke-width="1">
            <path
              v-for="x in COLS / 2 + 1"
              :key="`x${x}`"
              :d="`M${(x - 1) * S + 4} 4v${ROWS * S}`"
            />
            <path
              v-for="y in ROWS + 1"
              :key="`y${y}`"
              :d="`M4 ${(y - 1) * S + 4}h${(COLS / 2) * S}`"
            />
          </g>
          <rect
            v-for="c in optionCells(option.key)"
            :key="c"
            :x="pos(c)[0] - (COLS / 2) * S"
            :y="pos(c)[1]"
            :width="S"
            :height="S"
            :fill="data.color"
            stroke="#000"
            stroke-width="1.5"
          />
        </svg>
        <span v-else class="option">
          <EmojiPicture :code="option.image" :size="56" />
          <span class="label">{{ option.label }}</span>
        </span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.figure {
  width: min(100%, 280px);
  height: auto;
  padding: 10px;
}

.half {
  width: 90px;
  height: auto;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.label {
  font-size: 18px;
  font-weight: 700;
}
</style>
