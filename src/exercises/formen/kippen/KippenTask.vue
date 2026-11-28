<script setup lang="ts">
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import type { KippenData, Richtung } from './index'

defineProps<{ data: KippenData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const PFEIL: Record<Richtung, string> = { rechts: '➡️', links: '⬅️', vorne: '⬇️', hinten: '⬆️' }
const NAME: Record<Richtung, string> = {
  rechts: 'nach rechts',
  links: 'nach links',
  vorne: 'nach vorne',
  hinten: 'nach hinten',
}
</script>

<template>
  <div class="task">
    <div class="scene">
      <svg class="dice" viewBox="0 0 160 150" role="img" aria-label="Würfel">
        <path
          d="M20 50h80v80H20z"
          fill="#fff"
          stroke="#000"
          stroke-width="3"
          stroke-linejoin="round"
        />
        <path
          d="M20 50l36-34h80l-36 34z"
          fill="#F4F4F4"
          stroke="#000"
          stroke-width="3"
          stroke-linejoin="round"
        />
        <path
          d="M100 50l36-34v80l-36 34z"
          fill="#E3E3E3"
          stroke="#000"
          stroke-width="3"
          stroke-linejoin="round"
        />
        <text x="60" y="104" text-anchor="middle" font-size="40" font-weight="700">
          {{ data.wuerfel.vorne }}
        </text>
        <text
          x="78"
          y="41"
          text-anchor="middle"
          font-size="24"
          font-weight="700"
          transform="skewX(-40) translate(32 0)"
        >
          {{ data.wuerfel.oben }}
        </text>
        <text
          x="118"
          y="82"
          text-anchor="middle"
          font-size="28"
          font-weight="700"
          transform="skewY(-40) translate(0 98)"
        >
          {{ data.wuerfel.rechts }}
        </text>
      </svg>
      <div class="wege">
        <span v-for="(w, i) in data.wege" :key="i" class="weg">
          <span class="pfeil" aria-hidden="true">{{ PFEIL[w] }}</span>{{ NAME[w] }}
        </span>
      </div>
    </div>
    <ChoiceButtons
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="label">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.scene {
  display: flex;
  align-items: center;
  gap: 20px;
}

.dice {
  width: 170px;
  height: auto;
}

.wege {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
}

.pfeil {
  margin-right: 6px;
  font-size: 26px;
}

.label {
  font-size: 32px;
  font-weight: 700;
}
</style>
