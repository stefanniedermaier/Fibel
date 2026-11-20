<script setup lang="ts">
import BackButton from '@/components/BackButton.vue'
import { computed, ref } from 'vue'
import GlyphAnimation from '@/components/GlyphAnimation.vue'
import TraceBoard from '@/components/TraceBoard.vue'
import { DEFAULT_LAND } from '@/core/content'
import { SCRIPTS, glyphFor, upperForm } from '@/core/strokes'
import { LETTERS, scriptFor } from '@/core/words'
import { useAppStore } from '@/stores/app'

// Preview of the stroke templates: every letter with stroke order, played as an
// animation; parents can also try tracing it. Replaces the stroke editor from the
// plan – the templates live in src/data/schriften/<script>/strokes.json.
const store = useAppStore()
const scriptId = computed(() =>
  scriptFor(store.active?.land ?? DEFAULT_LAND, store.active?.grade ?? 1),
)
const script = computed(() => SCRIPTS[scriptId.value] ?? SCRIPTS.druckschrift!)

const forms = computed(() =>
  LETTERS.flatMap((l) => [upperForm(l.id), l.id]).filter((t) => glyphFor(script.value, t)),
)
/** Single letters only (multigraphs are composed from them). */
const singles = computed(() => forms.value.filter((t) => t.length === 1))
const selected = ref('A')
const glyph = computed(() => glyphFor(script.value, selected.value)!)
const run = ref(0)
const mode = ref<'animation' | 'try'>('animation')
const traced = ref(false)

function choose(text: string) {
  selected.value = text
  traced.value = false
  run.value++
}
</script>

<template>
  <header class="top">
    <BackButton :to="{ name: 'parent' }" />
    <h1>Schrift-Vorlagen</h1>
  </header>
  <p class="muted">
    {{ script.name }} – so werden die Buchstaben beim Nachspuren geschrieben: Die Zahlen zeigen die
    Reihenfolge der Striche, die Animation die Richtung. Wenn etwas anders ist als in der Schule,
    lässt sich die Vorlage anpassen.
  </p>

  <section class="card stage">
    <div class="modes">
      <button
        class="btn"
        :class="{ 'btn-primary': mode === 'animation' }"
        @click="mode = 'animation'"
      >
        ▶ Vorführen
      </button>
      <button
        class="btn"
        :class="{ 'btn-primary': mode === 'try' }"
        @click="((mode = 'try'), (traced = false), run++)"
      >
        ✍ Selbst probieren
      </button>
    </div>
    <GlyphAnimation v-if="mode === 'animation'" :glyph="glyph" :run="run" />
    <TraceBoard v-else :key="`${selected}-${run}`" :glyph="glyph" numbers @done="traced = true" />
    <p v-if="mode === 'animation'">
      <button class="btn" @click="run++">↻ Nochmal</button>
    </p>
    <p v-else class="muted">
      {{ traced ? 'Geschafft ✓' : 'Mit dem Finger oder der Maus nachfahren.' }}
    </p>
  </section>

  <section class="card">
    <div class="letters">
      <button
        v-for="t in forms"
        :key="t"
        class="letter"
        :class="{ on: t === selected }"
        @click="choose(t)"
      >
        {{ t }}
      </button>
    </div>
  </section>

  <section class="card">
    <details>
      <summary>Alle Buchstaben auf einen Blick</summary>
      <div class="overview">
        <button v-for="t in singles" :key="t" class="mini" @click="choose(t)">
          <TraceBoard :glyph="glyphFor(script, t)!" readonly revealed numbers />
        </button>
      </div>
    </details>
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

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.stage p {
  margin: 0;
}

.modes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.modes .btn {
  font-size: 18px;
}

.letters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 6px;
}

.letter {
  min-height: 48px;
  border: 2px solid #e2d3bd;
  border-radius: 12px;
  background: var(--bg);
  font-size: 20px;
  font-weight: 700;
}

.overview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 6px;
  margin-top: 12px;
}

.mini {
  padding: 0;
  border: 0;
  background: transparent;
}

.mini :deep(svg) {
  width: 100%;
  height: 96px;
  max-height: none;
  border-width: 1px;
  border-radius: 8px;
}

.letter.on {
  border-color: var(--accent-strong);
  background: var(--accent);
}
</style>
