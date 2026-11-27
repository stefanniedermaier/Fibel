<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import type { ReihenfolgeData } from './index'

const props = defineProps<{ data: ReihenfolgeData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// The pictures are tapped in order; each gets its number. A wrong one shakes, and the
// ones already right stay.
const placed = ref<number[]>([])
const shaking = ref<number>()
watch(
  () => props.data,
  () => (placed.value = []),
)

const shown = computed(() =>
  props.data.order.map((index) => ({
    index,
    image: props.data.images[index]!,
    number: props.revealed ? index + 1 : placed.value.indexOf(index) + 1 || undefined,
  })),
)

function tap(index: number) {
  if (props.locked || props.revealed || placed.value.includes(index)) return
  if (index === placed.value.length) {
    placed.value = [...placed.value, index]
    if (placed.value.length === props.data.images.length) emit('answer', true)
  } else {
    shaking.value = index
    setTimeout(() => (shaking.value = undefined), 500)
    emit('answer', false)
  }
}
</script>

<template>
  <div class="task">
    <div class="pictures">
      <button
        v-for="(p, i) in shown"
        :key="p.index"
        type="button"
        class="picture"
        :class="{ done: p.number, shake: shaking === p.index }"
        :aria-label="`Bild ${i + 1}`"
        @click="tap(p.index)"
      >
        <EmojiPicture :code="p.image" :size="80" />
        <span v-if="p.number" class="number">{{ p.number }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.task {
  width: 100%;
}

.pictures {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.picture {
  position: relative;
  padding: 10px;
  border: 5px solid var(--accent);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: 0 5px 0 var(--accent-strong);
}

.picture.done {
  border-color: var(--ok);
  box-shadow: 0 5px 0 var(--ok);
}

.number {
  position: absolute;
  top: -14px;
  left: -14px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ok);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.shake {
  animation: shake 0.45s;
}

@keyframes shake {
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}
</style>
