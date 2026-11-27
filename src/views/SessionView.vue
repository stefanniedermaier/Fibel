<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ProgressBeads from '@/components/ProgressBeads.vue'
import StarBurst from '@/components/StarBurst.vue'
import { getCategory } from '@/core/content'
import { updateProgress } from '@/core/leitner'
import { numberWord } from '@/core/numbers'
import { activeFocus, planFocused, planStumbles, practiceEntries } from '@/core/practice'
import { createId, createRng } from '@/core/random'
import {
  MAX_WRONG,
  countStars,
  earnsCrown,
  earnsStar,
  outcomeOf,
  type PlannedTask,
} from '@/core/session'
import { playCrown, playError, playSuccess } from '@/core/sounds'
import { phrase, stopSpeaking } from '@/core/speech'
import { getDb, loadProgress, saveProgress, saveSession } from '@/core/storage/db'
import type { ProgressRecord, SessionRecord, TaskResult, Topic } from '@/core/types'
import { TOPIC_INFO } from '@/core/types'
import { getExercise } from '@/exercises/registry'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const store = useAppStore()
const grade = Number(route.params.grade)
const topic = route.params.topic as Topic
/** Chosen category; empty = everything mixed; 'stolpersteine' = what often went wrong. */
const STUMBLES = 'stolpersteine'
const category = (route.params.category as string | undefined) || undefined
const stumbleUnit = category === STUMBLES
const categoryInfo = stumbleUnit
  ? { icon: '💪', title: 'Stolpersteine' }
  : category
    ? getCategory(category)
    : undefined
const rng = createRng()

type Phase = 'loading' | 'empty' | 'running' | 'done'
const phase = ref<Phase>('loading')
const tasks = ref<PlannedTask[]>([])
const index = ref(0)
const wrong = ref(0)
const revealed = ref(false)
const locked = ref(false)
const results = ref<TaskResult[]>([])
const starTrigger = ref(0)
const crown = ref(false)

const current = computed(() => tasks.value[index.value])
const stars = computed(() => countStars(results.value))

let progress = new Map<string, ProgressRecord>()
let record: SessionRecord | undefined

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const soundOn = () => store.settings?.sound !== false

async function start() {
  const profile = store.active
  const settings = store.settings
  if (!profile || !settings) return
  const ctx = { land: profile.land, grade, settings }
  const revision = grade < profile.grade
  const chosen = stumbleUnit ? undefined : category
  const entries = practiceEntries(ctx, topic, getExercise, chosen, { revision })
  // The parents' focus of the week only shapes "Alles gemischt" of the own grade.
  const focus = !category && !revision ? activeFocus(settings, topic) : undefined
  if (entries.length === 0) {
    phase.value = 'empty'
    return
  }
  progress = await loadProgress(await getDb(), profile.id)
  tasks.value = stumbleUnit
    ? planStumbles(entries, ctx, progress, settings.tasksPerUnit, rng, getExercise)
    : planFocused(entries, focus, ctx, progress, settings.tasksPerUnit, rng, getExercise)
  record = {
    id: createId(),
    profileId: profile.id,
    land: profile.land,
    grade,
    topic,
    ...(category ? { category } : {}),
    startedAt: Date.now(),
    durationMs: 0,
    total: tasks.value.length,
    tasks: [],
    stars: 0,
    crown: false,
    completed: false,
  }
  index.value = 0
  results.value = []
  crown.value = false
  resetTask()
  phase.value = 'running'
  void speakInstruction()
}

function resetTask() {
  wrong.value = 0
  revealed.value = false
  locked.value = false
}

function speakInstruction() {
  return current.value ? store.say(current.value.task.instruction) : Promise.resolve()
}

/** Saves the result of the current task (progress per item and the session so far). */
async function finishTask(star: boolean) {
  const task = current.value
  const profile = store.active
  if (!task || !profile || !record) return
  const result: TaskResult = {
    entryId: task.entry.id,
    itemKey: task.itemKey,
    wrongAttempts: wrong.value,
    revealed: revealed.value,
    star,
  }
  results.value = [...results.value, result]
  const updated = updateProgress(
    progress.get(task.itemKey),
    profile.id,
    task.itemKey,
    outcomeOf(wrong.value, revealed.value),
  )
  progress.set(task.itemKey, updated)
  record = {
    ...record,
    tasks: results.value,
    stars: countStars(results.value),
    durationMs: Date.now() - record.startedAt,
  }
  const db = await getDb()
  await Promise.all([saveProgress(db, updated), saveSession(db, record)])
}

async function onAnswer(correct: boolean) {
  const task = current.value
  if (!task || locked.value || revealed.value) return
  if (correct) {
    locked.value = true
    const star = earnsStar(wrong.value, false)
    if (soundOn()) playSuccess()
    if (star) starTrigger.value++
    await finishTask(star)
    await Promise.all([store.say(phrase('praise', rng), 3000), wait(1100)])
    await next()
    return
  }
  wrong.value++
  if (soundOn()) playError()
  if (wrong.value >= MAX_WRONG) {
    revealed.value = true
    await finishTask(false)
    void store.say(`${phrase('reveal', rng)} ${task.task.solution}`)
  } else {
    void store.say(task.task.hint ?? phrase('retry', rng))
  }
}

async function next() {
  if (index.value < tasks.value.length - 1) {
    index.value++
    resetTask()
    void speakInstruction()
  } else {
    await finish()
  }
}

async function finish() {
  if (!record || !store.settings) return
  crown.value = earnsCrown(stars.value, record.total, store.settings.crownRatio)
  record = {
    ...record,
    crown: crown.value,
    completed: true,
    durationMs: Date.now() - record.startedAt,
  }
  await saveSession(await getDb(), record)
  await store.refreshSessions()
  phase.value = 'done'
  if (crown.value) {
    if (soundOn()) playCrown()
    void store.say(phrase('crown', rng))
  } else {
    const n = stars.value
    const text = n === 0 ? 'keine Sterne' : n === 1 ? 'einen Stern' : `${numberWord(n)} Sterne`
    void store.say(phrase('noCrown', rng, { stars: text }))
  }
}

// Keep the screen on during a unit.
let wakeLock: WakeLockSentinel | undefined
onMounted(async () => {
  try {
    wakeLock = await navigator.wakeLock?.request('screen')
  } catch {
    // Not supported or denied – not important.
  }
  await start()
})
onUnmounted(() => {
  stopSpeaking()
  void wakeLock?.release()
})
</script>

<template>
  <main class="session" :class="{ fit: phase === 'running' && current?.module.layout === 'fit' }">
    <header class="bar">
      <RouterLink class="icon-btn" :to="{ name: 'home' }" aria-label="Aufhören">🏠</RouterLink>
      <ProgressBeads
        v-if="phase === 'running' || phase === 'done'"
        :total="tasks.length"
        :results="results"
        :current="index"
      />
      <!-- Keeps the beads centred. -->
      <span class="bar-spacer" aria-hidden="true" />
    </header>

    <div v-if="phase === 'running' && current" class="instruction">
      <p>{{ current.task.caption ?? current.task.instruction }}</p>
      <button class="icon-btn speak" aria-label="Nochmal vorlesen" @click="speakInstruction">
        🔊
      </button>
    </div>

    <section v-if="phase === 'running' && current" class="stage">
      <component
        :is="current.module.component"
        :key="current.id"
        :data="current.task.data"
        :revealed="revealed"
        :locked="locked"
        @answer="onAnswer"
      />
      <button v-if="revealed" class="btn btn-primary next" @click="next">Weiter ➜</button>
    </section>

    <section v-else-if="phase === 'empty'" class="stage end">
      <p class="big">🙈</p>
      <p>Hier gibt es noch keine Übungen.</p>
      <RouterLink class="btn btn-primary" :to="{ name: 'home' }">Zurück</RouterLink>
    </section>

    <section v-else-if="phase === 'done'" class="stage end">
      <p class="big" :class="{ crown }">{{ crown ? '👑' : '⭐' }}</p>
      <h1>{{ crown ? 'Eine Krone für dich!' : 'Gut geübt!' }}</h1>
      <p class="score">⭐ {{ stars }} von {{ tasks.length }}</p>
      <div class="actions">
        <button class="btn btn-primary" @click="start">Nochmal</button>
        <RouterLink class="btn" :to="{ name: 'home' }">Fertig</RouterLink>
      </div>
      <p class="muted">
        {{ TOPIC_INFO[topic].icon }} {{ TOPIC_INFO[topic].label }}
        <template v-if="categoryInfo"> · {{ categoryInfo.icon }} {{ categoryInfo.title }}</template>
        · Klasse {{ grade }}
      </p>
    </section>

    <StarBurst :trigger="starTrigger" />
  </main>
</template>

<style scoped>
.session {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 12px 16px 24px;
}

/* Drawing tasks: everything on one screen in portrait – scrolling would get in the way. */
@media (orientation: portrait) {
  .session.fit {
    height: 100vh;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
  }
}

.session.fit {
  padding-bottom: 12px;
}

.session.fit .stage {
  min-height: 0;
  justify-content: flex-start;
  gap: 12px;
  padding-top: 8px;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bar .icon-btn,
.bar-spacer {
  flex: none;
  width: var(--tap);
}

.instruction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 8px 8px 16px;
  border-radius: var(--radius);
  background: var(--surface);
}

.instruction p {
  margin: 0;
  font-size: clamp(20px, 5.5vw, 26px);
  font-weight: 700;
  line-height: 1.25;
}

.instruction .speak {
  flex: none;
}

.stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding-top: 16px;
}

.next {
  min-width: 200px;
}

.end {
  text-align: center;
}

.end h1,
.end p {
  margin: 0;
}

.big {
  font-size: 120px;
  line-height: 1;
}

.big.crown {
  animation: bounce 0.9s ease-out;
}

.score {
  font-size: 32px;
  font-weight: 700;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

@keyframes bounce {
  0% {
    transform: scale(0.2);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
