<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { DatenData } from './index'

defineProps<{ data: DatenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

/** Tally marks in bundles of five: four strokes and one across. */
function bundles(count: number): number[] {
  const result: number[] = []
  for (let n = count; n > 0; n -= 5) result.push(Math.min(5, n))
  return result
}
</script>

<template>
  <div class="task">
    <table class="liste card">
      <tbody>
        <tr v-for="r in data.rows" :key="r.key" :class="{ asked: r.key === data.asked }">
          <td><EmojiPicture :code="r.image" :size="48" /></td>
          <td v-if="data.display === 'tabelle'" class="value">
            {{ r.count * (data.faktor ?? 1) }}
          </td>
          <td v-else-if="data.display === 'balken'" class="bar-cell">
            <span class="bar" :style="{ width: `${r.count * 18}px` }" />
            <span class="scale" aria-hidden="true">
              <span v-for="t in 15" :key="t" class="tick" :class="{ five: t % 5 === 0 }">{{
                t % 5 === 0 ? t * (data.faktor ?? 1) : ''
              }}</span>
            </span>
          </td>
          <td v-else class="marks">
            <svg
              v-for="(n, i) in bundles(r.count)"
              :key="i"
              viewBox="0 0 44 40"
              width="44"
              height="40"
              aria-hidden="true"
            >
              <path
                v-for="k in Math.min(n, 4)"
                :key="k"
                :d="`M${k * 8} 4v32`"
                stroke="#000"
                stroke-width="3"
                stroke-linecap="round"
              />
              <path
                v-if="n === 5"
                d="M2 30L40 10"
                stroke="#000"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </td>
        </tr>
      </tbody>
    </table>
    <ChoiceButtons
      label-prefix="Antwort"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <EmojiPicture v-if="option.image" :code="option.image" :size="64" />
        <span v-else class="number">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.liste {
  border-collapse: separate;
  border-spacing: 0 6px;
  padding: 8px 16px;
}

.liste td {
  padding: 4px 8px;
  border-bottom: 2px solid #ddd;
}

.liste tr.asked td {
  background: #fff5a8;
}

.marks {
  min-width: 140px;
}

.value {
  min-width: 80px;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
}

.bar-cell {
  position: relative;
  width: 280px;
}

.bar {
  display: block;
  height: 26px;
  border: 2px solid #000;
  border-radius: 4px;
  background: #61b2e4;
}

.scale {
  display: flex;
  margin-top: 2px;
}

.tick {
  width: 18px;
  height: 6px;
  border-right: 1px solid #999;
  font-size: 12px;
  line-height: 26px;
  text-align: right;
}

.tick.five {
  height: 10px;
  border-right: 2px solid #333;
}

.number {
  font-size: 40px;
  font-weight: 700;
}
</style>
