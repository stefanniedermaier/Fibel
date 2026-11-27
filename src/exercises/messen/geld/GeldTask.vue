<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import MoneyPiece from '@/components/MoneyPiece.vue'
import type { GeldData } from './index'

const props = defineProps<{ data: GeldData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

// legen: pieces go into the purse; tapping one in the purse takes it out again.
const purse = ref<number[]>([])
const solved = ref(false)
watch(
  () => props.data,
  () => {
    purse.value = []
    solved.value = false
  },
)
const sum = computed(() => purse.value.reduce((s, p) => s + p, 0))
const disabled = computed(() => props.locked || props.revealed || solved.value)

function add(p: number) {
  if (!disabled.value && purse.value.length < 10) purse.value = [...purse.value, p]
}
function remove(i: number) {
  if (!disabled.value) purse.value = purse.value.filter((_, j) => j !== i)
}
function check() {
  if (disabled.value || purse.value.length === 0) return
  if (sum.value === props.data.amount) {
    solved.value = true
    emit('answer', true)
  } else emit('answer', false)
}
</script>

<template>
  <div class="task">
    <template v-if="data.mode === 'erkennen'">
      <div class="money card">
        <MoneyPiece v-for="(p, i) in data.shown" :key="i" :value="p" />
      </div>
      <ChoiceButtons
        :options="data.choices"
        :correct-key="String(data.amount)"
        :revealed="revealed"
        :locked="locked"
        @answer="emit('answer', $event)"
      >
        <template #default="{ option }">
          <span class="amount">{{ option.label }}</span>
        </template>
      </ChoiceButtons>
    </template>
    <template v-else>
      <div class="purse card" :class="{ right: solved }" aria-label="Geldbeutel">
        <span v-if="purse.length === 0" class="muted">👛 leer</span>
        <button
          v-for="(p, i) in purse"
          :key="i"
          type="button"
          class="piece"
          :aria-label="`${p} Euro herausnehmen`"
          @click="remove(i)"
        >
          <MoneyPiece :value="p" :size="0.8" />
        </button>
      </div>
      <p v-if="revealed" class="sum">{{ data.amount }} €</p>
      <div class="pieces">
        <button
          v-for="p in data.pieces"
          :key="p"
          type="button"
          class="piece add"
          :aria-label="`${p} Euro dazulegen`"
          :disabled="disabled"
          @click="add(p)"
        >
          <MoneyPiece :value="p" />
        </button>
      </div>
      <button type="button" class="btn btn-primary" :disabled="disabled" @click="check">
        Fertig ✓
      </button>
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

.money,
.purse {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 80px;
  padding: 12px;
  max-width: 100%;
}

.purse {
  min-width: 260px;
  border: 3px dashed var(--accent);
}

.purse.right {
  border-color: var(--ok);
}

.pieces {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.piece {
  padding: 2px;
  border: 0;
  background: none;
}

.piece.add {
  padding: 4px;
  border: 3px solid var(--accent);
  border-radius: 14px;
  background: var(--surface);
}

.amount {
  font-size: 36px;
  font-weight: 700;
}

.sum {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}
</style>
