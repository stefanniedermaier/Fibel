<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import ClockFace from '@/components/ClockFace.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'

// Clocks and digital times: shown clocks or a big digital time on top, answers as
// digital times, durations or clocks. Shared by uhr.digital and uhr.zeitspanne.
export interface UhrWahlData {
  /** Big text on top, e.g. "19:30". */
  prompt?: string
  /** Picture of the time of day (sun, moon). */
  icon?: string
  clocks: { total: number; label?: string }[]
  correctKey: string
  choices: { key: string; label?: string; total?: number }[]
}

defineProps<{ data: UhrWahlData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div v-if="data.prompt || data.icon" class="top">
      <EmojiPicture v-if="data.icon" :code="data.icon" :size="64" />
      <span v-if="data.prompt" class="digital">{{ data.prompt }}</span>
    </div>
    <div v-if="data.clocks.length" class="clocks">
      <figure v-for="(c, i) in data.clocks" :key="i">
        <ClockFace class="clock" :total="c.total" :label="c.label ?? 'Uhr'" />
        <figcaption v-if="c.label">{{ c.label }}</figcaption>
      </figure>
    </div>
    <ChoiceButtons
      :label-prefix="data.choices[0]?.total !== undefined ? 'Uhr' : undefined"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <ClockFace v-if="option.total !== undefined" class="small" :total="option.total" />
        <span v-else class="label">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: clamp(12px, 3vh, 24px);
}

.top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.digital {
  padding: 4px 20px;
  border-radius: 12px;
  background: #1a1a1a;
  color: #b1cc33;
  font-family: ui-monospace, monospace;
  font-size: 52px;
  font-weight: 700;
}

.clocks {
  display: flex;
  gap: 16px;
  justify-content: center;
}

figure {
  margin: 0;
  text-align: center;
}

figcaption {
  font-size: 18px;
  font-weight: 700;
}

.clock {
  width: min(42vw, 180px);
}

.small {
  width: 100px;
}

.label {
  font-size: 28px;
  font-weight: 700;
}
</style>
