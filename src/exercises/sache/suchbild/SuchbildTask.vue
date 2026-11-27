<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SuchStelle } from '../shared'
import type { SuchbildData } from './index'

const props = defineProps<{ data: SuchbildData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// The scene is an SVG of 400 × 270. Every place has an invisible box to tap; a wrong
// place gets a red frame, the right one a green frame.
const W = 400
const H = 270
const wrong = ref(new Set<string>())
const found = ref<string>()
watch(
  () => props.data,
  () => {
    wrong.value = new Set()
    found.value = undefined
  },
)

const src = (code: string) => `${import.meta.env.BASE_URL}img/openmoji/${code}.svg`

function tap(stelle: SuchStelle) {
  if (props.locked || props.revealed || found.value || wrong.value.has(stelle.key)) return
  if (props.data.correct.includes(stelle.key)) {
    found.value = stelle.key
    emit('answer', true)
  } else {
    wrong.value = new Set([...wrong.value, stelle.key])
    emit('answer', false)
  }
}

function state(key: string): string | undefined {
  if (found.value === key || (props.revealed && props.data.correct.includes(key))) return 'right'
  return wrong.value.has(key) ? 'wrong' : undefined
}

const stripes = (box: SuchStelle['box']) =>
  Array.from({ length: Math.floor((box[3] - 8) / 16) }, (_, i) => box[1] + 8 + i * 16)
</script>

<template>
  <div class="task">
    <svg :viewBox="`0 0 ${W} ${H}`" class="scene" role="group" aria-label="Suchbild">
      <!-- Backgrounds -->
      <template v-if="data.scene.hintergrund === 'strasse'">
        <rect width="400" height="270" fill="#B1CC33" />
        <rect y="40" width="400" height="40" fill="#D0CFCE" />
        <rect y="190" width="400" height="40" fill="#D0CFCE" />
        <rect y="80" width="400" height="110" fill="#8D8D8C" />
        <path d="M0 80h400M0 190h400" stroke="#3F3F3F" stroke-width="3" />
        <path d="M0 135h400" stroke="#fff" stroke-width="3" stroke-dasharray="18 14" />
      </template>
      <template v-else-if="data.scene.hintergrund === 'kueche'">
        <rect width="400" height="270" fill="#FFF3D6" />
        <rect y="210" width="400" height="60" fill="#D0CFCE" />
        <rect y="140" width="400" height="70" fill="#A57939" stroke="#000" stroke-width="2" />
        <path d="M0 150h400" stroke="#6A462F" stroke-width="3" />
        <path d="M100 150v60M200 150v60M300 150v60" stroke="#6A462F" stroke-width="2" />
        <rect x="10" y="126" width="80" height="14" fill="#3F3F3F" />
        <rect
          x="320"
          y="70"
          width="70"
          height="8"
          fill="#A57939"
          stroke="#000"
          stroke-width="1.5"
        />
      </template>
      <template v-else-if="data.scene.hintergrund === 'auge'">
        <!-- An eye seen from the front; the places are parts of it ('teil'). -->
        <rect width="400" height="270" fill="#F7D9C4" />
        <path
          d="M92 66C150 30 250 30 308 66"
          stroke="#6A462F"
          stroke-width="16"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M100 150C150 92 250 92 300 150C250 208 150 208 100 150Z"
          fill="#fff"
          stroke="#000"
          stroke-width="3"
        />
        <circle cx="200" cy="150" r="42" fill="#61B2E4" stroke="#1E5F8C" stroke-width="3" />
        <path
          d="M200 150m-42 0a42 42 0 0 1 84 0"
          stroke="#1E5F8C"
          stroke-width="1.5"
          stroke-dasharray="3 5"
          fill="none"
        />
        <circle cx="200" cy="150" r="17" fill="#000" />
        <circle cx="208" cy="141" r="5" fill="#fff" />
        <path
          v-for="x in [128, 148, 168, 188, 208, 228, 248, 268]"
          :key="x"
          :d="`M${x} ${x < 200 ? 114 - (x - 120) / 8 : 104 + (x - 200) / 8}l${(x - 200) / 10} -16`"
          stroke="#000"
          stroke-width="3"
          stroke-linecap="round"
        />
      </template>
      <template v-else>
        <rect width="400" height="270" fill="#FFF8EE" />
        <rect
          x="12"
          y="12"
          width="376"
          height="246"
          fill="#fff"
          stroke="#3F3F3F"
          stroke-width="10"
        />
      </template>

      <!-- Places -->
      <g
        v-for="s in data.scene.stellen"
        :key="s.key"
        class="stelle"
        :class="state(s.key)"
        @click="tap(s)"
      >
        <template v-if="s.form === 'zebra'">
          <rect
            v-for="y in stripes(s.box)"
            :key="y"
            :x="s.box[0] + 6"
            :y="y"
            :width="s.box[2] - 12"
            height="9"
            fill="#fff"
          />
        </template>
        <template v-else-if="s.form === 'furt'">
          <path
            :d="`M${s.box[0] + 8} 82v106M${s.box[0] + s.box[2] - 8} 82v106`"
            stroke="#fff"
            stroke-width="4"
            stroke-dasharray="8 6"
          />
        </template>
        <template v-else-if="s.form === 'steckdose'">
          <rect
            :x="s.box[0] + 4"
            :y="s.box[1] + 4"
            :width="s.box[2] - 8"
            :height="s.box[3] - 8"
            rx="6"
            fill="#fff"
            stroke="#000"
            stroke-width="2"
          />
          <circle
            :cx="s.box[0] + s.box[2] / 2"
            :cy="s.box[1] + s.box[3] / 2"
            :r="s.box[2] / 2 - 10"
            fill="#E8E8E8"
            stroke="#000"
            stroke-width="1.5"
          />
          <circle :cx="s.box[0] + s.box[2] / 2 - 5" :cy="s.box[1] + s.box[3] / 2" r="2.5" />
          <circle :cx="s.box[0] + s.box[2] / 2 + 5" :cy="s.box[1] + s.box[3] / 2" r="2.5" />
        </template>
        <image
          v-for="(b, i) in s.bilder ?? []"
          :key="i"
          :href="src(b.image)"
          :x="b.x"
          :y="b.y"
          :width="b.size"
          :height="b.size"
        />
        <rect
          class="hit"
          :x="s.box[0]"
          :y="s.box[1]"
          :width="s.box[2]"
          :height="s.box[3]"
          rx="10"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  justify-content: center;
  width: 100%;
}

.scene {
  width: 100%;
  max-width: 640px;
  height: auto;
  border-radius: 20px;
  border: 4px solid var(--accent);
  touch-action: manipulation;
}

.stelle {
  cursor: pointer;
}

.hit {
  fill: transparent;
  stroke: transparent;
  stroke-width: 5;
}

.wrong .hit {
  stroke: #d22f27;
  stroke-dasharray: 10 6;
}

.right .hit {
  stroke: var(--ok);
  fill: rgb(177 204 51 / 25%);
}
</style>
