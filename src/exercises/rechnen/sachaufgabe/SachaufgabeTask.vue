<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import NumberInput from '@/components/NumberInput.vue'
import type { SachaufgabeData } from './index'

const props = defineProps<{ data: SachaufgabeData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// Step 1: pick the calculation. Step 2: work it out. Only the end counts as "right".
const step = ref<1 | 2>(1)
watch(
  () => props.data,
  () => (step.value = 1),
)

function onChoice(correct: boolean) {
  if (correct) step.value = 2
  else emit('answer', false)
}

// The picture: first group, and the added ones (plus) or the ones going away (minus).
const pictures = computed(() => {
  const d = props.data
  const first = Array.from({ length: d.a }, (_, i) => ({
    key: `a${i}`,
    gone: d.op === '-' && i >= d.a - d.b,
    added: false,
  }))
  const second =
    d.op === '+'
      ? Array.from({ length: d.b }, (_, i) => ({ key: `b${i}`, gone: false, added: true }))
      : []
  return { first, second }
})
const size = computed(() => (props.data.a + props.data.b > 12 ? 34 : 46))
</script>

<template>
  <div class="task">
    <div class="picture card" role="img" aria-label="Bild zur Geschichte">
      <span class="group">
        <span v-for="p in pictures.first" :key="p.key" class="pic" :class="{ gone: p.gone }">
          <EmojiPicture :code="data.image" :size="size" />
        </span>
      </span>
      <span v-if="pictures.second.length" class="group added">
        <span v-for="p in pictures.second" :key="p.key" class="pic">
          <EmojiPicture :code="data.image" :size="size" />
        </span>
      </span>
    </div>
    <ChoiceButtons
      v-if="step === 1 && !revealed"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="onChoice"
    >
      <template #default="{ option }">
        <span class="calc">{{ option.label }}</span>
      </template>
    </ChoiceButtons>
    <template v-else>
      <p class="equation" aria-hidden="true">{{ data.correctKey }} = <span class="gap">?</span></p>
      <NumberInput
        :answer="data.result"
        :revealed="revealed"
        :locked="locked"
        @answer="emit('answer', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.picture {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  padding: 12px 16px;
}

.group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  max-width: 300px;
}

.group.added {
  padding: 4px 8px;
  border: 3px dashed var(--ok);
  border-radius: 12px;
}

.pic.gone {
  opacity: 0.3;
  position: relative;
}

.pic.gone::after {
  content: '';
  position: absolute;
  inset: 45% -2px auto;
  border-top: 4px solid #d33c2c;
  transform: rotate(-30deg);
}

.calc {
  font-size: 36px;
  font-weight: 700;
  white-space: nowrap;
}

.equation {
  margin: 0;
  font-size: clamp(36px, 10vw, 56px);
  font-weight: 700;
}

.gap {
  color: var(--accent-strong);
}
</style>
