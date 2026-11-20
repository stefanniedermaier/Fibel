<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Tile } from './tiles'

// Laying out a word from tiles (syllables or letters).
// - Drag a tile onto a slot (a filled slot gives its tile back), or drag a placed tile
//   to another slot (the two swap) or back to the tiles.
// - Tapping still works: a tile goes into the next free slot, a filled slot empties.
// When all slots are filled, the word is checked. Wrong: the slots shake and empty again.

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

/** Tile id per slot (undefined = empty). */
const placed = ref<(string | undefined)[]>([])
const state = ref<'idle' | 'wrong' | 'right'>('idle')

function empty() {
  placed.value = props.target.map(() => undefined)
}
watch(
  () => props.tiles,
  () => {
    empty()
    state.value = 'idle'
  },
  { immediate: true },
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

function afterChange() {
  if (placed.value.every((id) => id !== undefined)) check()
}

/** Puts a tile into a slot; a tile already there goes back (or swaps places). */
function putInto(index: number, id: string) {
  const next = [...placed.value]
  const from = next.indexOf(id)
  const previous = next[index]
  if (from >= 0) next[from] = previous // dragged from another slot: swap
  next[index] = id
  placed.value = next
  afterChange()
}

function place(tile: Tile) {
  if (disabled.value) return
  const index = placed.value.indexOf(undefined)
  if (index >= 0) putInto(index, tile.id)
}

function takeBack(index: number) {
  if (disabled.value) return
  placed.value = placed.value.map((id, i) => (i === index ? undefined : id))
}

function check() {
  const word = placed.value.map((id) => (id ? byId.value.get(id)?.text.toLowerCase() : ''))
  const correct = word.every((text, i) => text === props.target[i]?.toLowerCase())
  if (correct) {
    state.value = 'right'
    emit('answer', true)
    return
  }
  state.value = 'wrong'
  emit('answer', false)
  setTimeout(() => {
    empty()
    state.value = 'idle'
  }, 700)
}

// --- Dragging (pointer events: works with finger and mouse) ---
const DRAG_START = 8 // px of movement before a tap becomes a drag
interface Drag {
  id: string
  /** Slot index the tile was taken from, or -1 for the tile pool. */
  from: number
  text: string
  startX: number
  startY: number
  x: number
  y: number
  moving: boolean
}
const drag = ref<Drag>()
const hoverSlot = ref(-1)

function slotAt(x: number, y: number): number | undefined {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-slot]')
  return el ? Number(el.dataset.slot) : undefined
}

function grab(e: PointerEvent, id: string | undefined, from: number) {
  if (disabled.value || !id || e.button > 0) return
  const tile = byId.value.get(id)
  if (!tile) return
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  drag.value = {
    id,
    from,
    text: from >= 0 ? shown(tile.text, from) : tile.text,
    startX: e.clientX,
    startY: e.clientY,
    x: e.clientX,
    y: e.clientY,
    moving: false,
  }
}

function moveDrag(e: PointerEvent) {
  const d = drag.value
  if (!d) return
  d.x = e.clientX
  d.y = e.clientY
  if (!d.moving && Math.hypot(d.x - d.startX, d.y - d.startY) > DRAG_START) d.moving = true
  if (d.moving) hoverSlot.value = slotAt(d.x, d.y) ?? -1
}

function drop() {
  const d = drag.value
  drag.value = undefined
  hoverSlot.value = -1
  if (!d || disabled.value) return
  if (!d.moving) {
    // A tap: same as before dragging existed.
    if (d.from >= 0) takeBack(d.from)
    else place(byId.value.get(d.id)!)
    return
  }
  const target = slotAt(d.x, d.y)
  if (target !== undefined) putInto(target, d.id)
  else if (d.from >= 0) takeBack(d.from) // dragged out of the slots: back to the tiles
}

function cancelDrag() {
  drag.value = undefined
  hoverSlot.value = -1
}

/** Keyboard (Enter/Space): pointer events do not fire, only click with detail 0. */
function keyTile(e: MouseEvent, tile: Tile) {
  if (e.detail === 0) place(tile)
}
function keySlot(e: MouseEvent, index: number) {
  if (e.detail === 0) takeBack(index)
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
        :class="{
          filled: slot.text !== '',
          hover: hoverSlot === i,
          lifted: drag?.moving && drag.from === i,
        }"
        :data-slot="i"
        :aria-label="slot.text || `Feld ${i + 1}`"
        @pointerdown="grab($event, slot.id, i)"
        @pointermove="moveDrag"
        @pointerup="drop"
        @pointercancel="cancelDrag"
        @click="keySlot($event, i)"
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
        :class="{ lifted: drag?.moving && drag.id === tile.id }"
        :disabled="disabled"
        @pointerdown="grab($event, tile.id, -1)"
        @pointermove="moveDrag"
        @pointerup="drop"
        @pointercancel="cancelDrag"
        @click="keyTile($event, tile)"
      >
        {{ tile.text }}
      </button>
    </div>
    <Teleport to="body">
      <div
        v-if="drag?.moving"
        class="ghost"
        :style="{ '--size': `${size}px`, left: `${drag.x}px`, top: `${drag.y}px` }"
        aria-hidden="true"
      >
        {{ drag.text }}
      </div>
    </Teleport>
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

.slot,
.tile {
  touch-action: none; /* the finger drags the tile, not the page */
  user-select: none;
  -webkit-user-select: none;
}

.slot.hover {
  background: #fff3d6;
  border-bottom-color: var(--accent-strong);
}

.lifted {
  opacity: 0.35;
}

.ghost {
  position: fixed;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: calc(var(--size) * 1.5);
  height: calc(var(--size) * 1.7);
  padding: 0 12px;
  border: 4px solid var(--accent-strong);
  border-radius: 16px;
  background: var(--surface);
  font-size: var(--size);
  font-weight: 700;
  box-shadow: 0 10px 20px rgb(0 0 0 / 0.2);
  pointer-events: none; /* elementFromPoint must see the slot below */
  transform: translate(-50%, -60%) scale(1.1);
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
