<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import EmojiPicture from '@/components/EmojiPicture.vue'
import { DEFAULT_LAND, getLand } from '@/core/content'
import { stopSpeaking } from '@/core/speech'
import { getDb, getMeta, setMeta } from '@/core/storage/db'
import { baseSyllables, resolveWords } from '@/core/words'
import { useAppStore } from '@/stores/app'

// Plays every word and syllable of the exercises, so parents can hear on the real
// device whether the voice reads them correctly (e.g. "mo" not as "Montag").
const store = useAppStore()
const FLAGS_KEY = 'speechFlags'
const GRADE = 1

const land = computed(() => store.active?.land ?? DEFAULT_LAND)
const words = computed(() => resolveWords(land.value, GRADE))
const syllables = baseSyllables(GRADE)

interface Item {
  key: string
  label: string
  speak: string
  image?: string
}

const groups = computed<{ title: string; items: Item[] }[]>(() => [
  ...([1, 2, 3, 4] as const).map((level) => ({
    title: `Wörter Level ${level}`,
    items: words.value
      .filter((w) => w.level === level)
      .map((w) => ({ key: `wort:${w.id}`, label: w.text, speak: w.say ?? w.text, image: w.image })),
  })),
  {
    title: 'Silben',
    items: syllables.map((s) => ({
      key: `silbe:${s.text}`,
      label: s.text,
      speak: s.say ?? s.text,
    })),
  },
])

const flags = ref(new Set<string>())
const playing = ref<string>()
let stopRequested = false

onMounted(async () => {
  flags.value = new Set((await getMeta<string[]>(await getDb(), FLAGS_KEY)) ?? [])
})
onUnmounted(() => {
  stopRequested = true
  stopSpeaking()
})

async function play(item: Item) {
  playing.value = item.key
  await store.say(item.speak, 4000)
  if (playing.value === item.key) playing.value = undefined
}

async function playAll(items: Item[]) {
  stopRequested = false
  for (const item of items) {
    if (stopRequested) break
    await play(item)
    await new Promise((r) => setTimeout(r, 350))
  }
  playing.value = undefined
}

function stop() {
  stopRequested = true
  stopSpeaking()
  playing.value = undefined
}

async function toggleFlag(key: string) {
  const next = new Set(flags.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  flags.value = next
  await setMeta(await getDb(), FLAGS_KEY, [...next])
}

const flagged = computed(() =>
  groups.value.flatMap((g) => g.items).filter((i) => flags.value.has(i.key)),
)
const copied = ref(false)
async function copyList() {
  const text = flagged.value.map(
    (i) => `${i.key.startsWith('wort') ? 'Wort' : 'Silbe'}: ${i.label}`,
  )
  await navigator.clipboard?.writeText(text.join('\n'))
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <header class="top">
    <RouterLink class="icon-btn" :to="{ name: 'parent' }" aria-label="Zurück">←</RouterLink>
    <h1>Sprachtest</h1>
  </header>
  <p class="muted">
    Klasse 1, {{ getLand(land)?.name }}: {{ words.length }} Wörter und {{ syllables.length }}
    Silben. Tippe auf ein Wort zum Anhören. Mit ⚠ markierst du, was falsch klingt; die Markierungen
    bleiben auf diesem Gerät gespeichert.
  </p>

  <section v-if="flagged.length > 0" class="card flagged">
    <h2>Klingt falsch ({{ flagged.length }})</h2>
    <p>{{ flagged.map((i) => i.label).join(', ') }}</p>
    <button class="btn" @click="copyList">{{ copied ? 'Kopiert ✓' : 'Liste kopieren' }}</button>
  </section>

  <section v-for="g in groups" :key="g.title" class="card">
    <div class="group-head">
      <h2>
        {{ g.title }} <small class="muted">({{ g.items.length }})</small>
      </h2>
      <button v-if="playing" class="btn" @click="stop">■ Stopp</button>
      <button v-else class="btn" :disabled="g.items.length === 0" @click="playAll(g.items)">
        ▶ Alle
      </button>
    </div>
    <ul class="items">
      <li v-for="item in g.items" :key="item.key" :class="{ playing: playing === item.key }">
        <button class="say" @click="play(item)">
          <EmojiPicture v-if="item.image" :code="item.image" :size="32" />
          <span>{{ item.label }}</span>
        </button>
        <button
          class="flag"
          :class="{ on: flags.has(item.key) }"
          :aria-pressed="flags.has(item.key)"
          :aria-label="`${item.label} klingt falsch`"
          @click="toggleFlag(item.key)"
        >
          ⚠
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card {
  margin-top: 16px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  font-size: 20px;
}

@media (max-width: 420px) {
  .card {
    padding: 14px 12px;
  }
}

.flagged {
  border: 3px solid var(--error);
}

.flagged h2 {
  color: var(--error);
}

.items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  border: 2px solid #eee2d0;
  border-radius: 12px;
  overflow: hidden;
}

li.playing {
  border-color: var(--accent-strong);
  background: #ffe8b0;
}

.say {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  min-height: 52px;
  padding: 4px;
  border: 0;
  background: transparent;
  font-size: clamp(15px, 4.2vw, 18px);
  text-align: left;
}

.say :deep(img) {
  width: 28px;
  height: 28px;
}

.say span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-head .btn {
  flex: none;
  white-space: nowrap;
}

.flag {
  flex: none;
  width: 32px;
  border: 0;
  border-left: 2px solid #eee2d0;
  background: transparent;
  font-size: 18px;
  opacity: 0.35;
}

.flag.on {
  background: #fde2df;
  opacity: 1;
}
</style>
