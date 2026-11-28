<script lang="ts">
/** A picture or word above, pictures and/or words to choose from (Sache, Formen, Englisch). */
export interface BildWahlData {
  /**
   * Shown above the choices: one picture, two pictures with a plus (Schnee + Mann),
   * or a picture and/or a word.
   */
  prompt?: string | string[] | { image?: string; text?: string }
  correctKey: string
  /** Without a picture the label is shown big (numbers). */
  choices: { key: string; image?: string; label?: string }[]
  /** Language of the words, e.g. 'en' for English (pronunciation of screen readers). */
  lang?: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import ChoiceButtons from '@/components/ChoiceButtons.vue'
import EmojiPicture from '@/components/EmojiPicture.vue'

const props = defineProps<{ data: BildWahlData; revealed: boolean; locked: boolean }>()
const emit = defineEmits<{ answer: [correct: boolean] }>()

const prompt = computed(() => {
  const p = props.data.prompt
  if (p === undefined) return undefined
  if (typeof p === 'string') return { images: [p] }
  if (Array.isArray(p)) return { images: p }
  return { images: p.image ? [p.image] : [], text: p.text }
})
// Pictures only: neutral names ("Bild 1"), so a screen reader does not give the answer away.
const labelPrefix = computed(() => (props.data.choices.some((c) => c.label) ? undefined : 'Bild'))
</script>

<template>
  <div class="task">
    <div v-if="prompt" class="prompt card" :class="{ parts: prompt.images.length > 1 }">
      <template v-for="(code, i) in prompt.images" :key="i">
        <span v-if="i > 0" class="plus" aria-hidden="true">+</span>
        <EmojiPicture :code="code" :size="prompt.images.length > 1 ? 96 : 120" />
      </template>
      <span v-if="prompt.text" class="word" :lang="data.lang">{{ prompt.text }}</span>
    </div>
    <ChoiceButtons
      :label-prefix="labelPrefix"
      :options="data.choices"
      :correct-key="data.correctKey"
      :revealed="revealed"
      :locked="locked"
      :min-width="120"
      @answer="emit('answer', $event)"
    >
      <template #default="{ option }">
        <span class="option">
          <EmojiPicture v-if="option.image" :code="option.image" :size="80" />
          <span
            v-if="option.label"
            class="label"
            :class="{ big: !option.image }"
            :lang="data.lang"
            >{{ option.label }}</span
          >
        </span>
      </template>
    </ChoiceButtons>
  </div>
</template>

<style scoped>
.task {
  gap: clamp(24px, 6vh, 48px);
}

.prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
}

.prompt.parts {
  flex-direction: row;
  gap: 12px;
}

.plus {
  font-size: 48px;
  font-weight: 700;
}

.word {
  font-size: 44px;
  font-weight: 700;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
}

.label {
  font-size: 24px;
  font-weight: 700;
}

.label.big {
  font-size: 36px;
}
</style>
