<script setup lang="ts">
import NumberInput from '@/components/NumberInput.vue'
import type { ZahlenhausData } from './index'

defineProps<{ data: ZahlenhausData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()
</script>

<template>
  <div class="task">
    <div class="house" role="img" :aria-label="`Zahlenhaus ${data.total}`">
      <div class="roof">
        <span>{{ data.total }}</span>
      </div>
      <div class="floor">
        <span class="room" :class="{ gap: data.side === 'left' }">
          {{ data.side === 'left' ? (revealed ? data.missing : '?') : data.known }}
        </span>
        <span class="room" :class="{ gap: data.side === 'right' }">
          {{ data.side === 'right' ? (revealed ? data.missing : '?') : data.known }}
        </span>
      </div>
    </div>
    <NumberInput
      :answer="data.missing"
      :revealed="revealed"
      :locked="locked"
      @answer="emit('answer', $event)"
    />
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 3vh, 24px);
}

.house {
  /* Smaller when the screen is short, e.g. with the keyboard open (dvh shrinks then). */
  --w: clamp(130px, min(52vw, 30dvh), 240px);
  width: var(--w);
}

.roof {
  position: relative;
  height: calc(var(--w) * 0.42);
  background: var(--syllable-b);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.roof span {
  position: absolute;
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
  color: #fff;
  font-size: clamp(36px, 10vw, 48px);
  font-weight: 700;
}

.floor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 4px solid var(--text);
  border-top: 0;
  background: var(--surface);
}

.room {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(48px, min(18vw, 10dvh), 84px);
  font-size: clamp(36px, 10vw, 48px);
  font-weight: 700;
}

.room + .room {
  border-left: 4px solid var(--text);
}

.room.gap {
  color: var(--accent-strong);
  background: #fff3d6;
}
</style>
