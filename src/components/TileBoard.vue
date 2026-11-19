<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Tile } from './tiles'

// Laying out a word from tiles (syllables or letters): tap a tile → it goes into the
// next free slot; tap a filled slot → the tile goes back. When all slots are filled,
// the word is checked. Wrong: the slots shake and empty again.

const props = withDefaults(
  defineProps<{
    tiles: readonly Tile[]
    /** The correct texts in order (e.g. ['Ro', 'se'] or ['r', 'o', 's', 'e']). */
    target: readonly string[]
    revealed: boolean
    locked: boolean
    /** Show the first slot capitalised (nouns). */
    capitalizeFirst?: boolean
    /** Size of the tile text in px. */
    size?: number
  }>(),
  { capitalizeFirst: false, size: 40 },
)
const emit = defineEmits<{ answer: [correct: boolean] }>()

const placed = ref<string[]>([])
const state = ref<'idle' | 'wrong' | 'right'>('idle')

watch(
  () => props.tiles,
  () => {
    placed.value = []
    state.value = 'idle'
  },
)

const byId = computed(() => new Map(props.tiles.map((t) => [t.id, t])))
const free = computed(() => props.tiles.filter((t) => !placed.value.includes(t.id)))
const disabled = computed(() => props.locked || props.revealed || state.value !== 'idle')

function shown(text: string, index: number): string {
  if (!props.capitalizeFirst || index !== 0) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const slots = computed(() =>
  props.target.map((correct, i) => {
    if (props.revealed) return { text: shown(correct, i), id: undefined }
    const id = placed.value[i]
    const tile = id ? byId.value.get(id) : undefined
    return { text: tile ? shown(tile.text, i) : '', id }
  }),
)

function place(tile: Tile) {
  if (disabled.value) return
  placed.value = [...placed.value, tile.id]
  if (placed.value.length === props.target.length) check()
}

function takeBack(index: number) {
  if (disabled.value) return
  placed.value = placed.value.filter((_, i) => i !== index)
}

function check() {
  const word = placed.value.map((id) => byId.value.get(id)?.text.toLowerCase() ?? '')
  const correct = word.every((text, i) => text === props.target[i]?.toLowerCase())
  if (correct) {
    state.value = 'right'
    emit('answer', true)
    return
  }
  state.value = 'wrong'
  emit('answer', false)
  setTimeout(() => {
    placed.value = []
    state.value = 'idle'
  }, 700)
}
</script>

<template>
  <div class="board" :style="{ '--size': `${size}px` }">
    <div class="slots" :class="{ wrong: state === 'wrong', right: state === 'right' || revealed }">
      <button
        v-for="(slot, i) in slots"
        :key="i"
        type="button"
        class="slot"
        :class="{ filled: slot.text !== '' }"
        :aria-label="slot.text || `Feld ${i + 1}`"
        @click="takeBack(i)"
      >
        {{ slot.text }}
      </button>
    </div>
    <div class="tiles">
      <button
        v-for="tile in free"
        :key="tile.id"
        type="button"
        class="tile"
        :disabled="disabled"
        @click="place(tile)"
      >
        {{ tile.text }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(20px, 5vh, 36px);
  width: 100%;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.slot {
  min-width: calc(var(--size) * 1.3);
  height: calc(var(--size) * 1.6);
  padding: 0 6px;
  border: 0;
  border-bottom: 5px solid var(--text);
  background: transparent;
  font-size: var(--size);
  font-weight: 700;
}

.slot.filled {
  border-radius: 12px 12px 0 0;
  background: var(--surface);
}

.slots.wrong {
  animation: shake 0.45s;
}

.slots.wrong .slot {
  border-color: var(--error);
}

.slots.right .slot {
  border-color: var(--ok);
  background: #e6f6ea;
}

.tiles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  min-height: calc(var(--size) * 1.8);
}

.tile {
  min-width: calc(var(--size) * 1.5);
  height: calc(var(--size) * 1.7);
  padding: 0 12px;
  border: 4px solid var(--accent);
  border-radius: 16px;
  background: var(--surface);
  font-size: var(--size);
  font-weight: 700;
  box-shadow: 0 5px 0 var(--accent-strong);
}

.tile:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 2px 0 var(--accent-strong);
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}
</style>
