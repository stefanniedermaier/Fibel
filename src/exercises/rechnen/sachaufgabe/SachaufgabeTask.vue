<script setup lang="ts">
import { computed } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import RechnungWaehlen from '@/components/RechnungWaehlen.vue'
import type { SachaufgabeData } from './index'

const props = defineProps<{ data: SachaufgabeData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

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
    <RechnungWaehlen
      :choices="data.choices"
      :correct-key="data.correctKey"
      :result="data.result"
      :revealed="revealed"
      :locked="locked"
      :size="36"
      @answer="emit('answer', $event)"
    />
  </div>
</template>

<style scoped>
.task {
  gap: 18px;
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
</style>
