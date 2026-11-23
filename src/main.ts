import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Latin subset only (covers ä, ö, ü, ß) – keeps the offline cache small.
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import './styles/base.css'
import App from './App.vue'
import { router } from './router'
import { initPwa } from './core/pwa'
import { audioUnlocked, unlockAudio } from './core/sounds'
import { primeSpeech } from './core/tts'

initPwa()
// Browsers allow audio and speech only after a user gesture. On touch screens a
// `pointerdown` is not one yet (only the lifted finger is), so listen to the events that
// count and keep trying until the audio context runs. The speech engine is woken on the
// first gesture so the first task of a unit is not silent.
const GESTURES = ['pointerup', 'touchend', 'click', 'keydown'] as const
let speechPrimed = false
function onGesture() {
  if (!speechPrimed) {
    speechPrimed = true
    primeSpeech()
  }
  unlockAudio()
  if (audioUnlocked()) GESTURES.forEach((g) => document.removeEventListener(g, onGesture, true))
}
GESTURES.forEach((g) => document.addEventListener(g, onGesture, true))

createApp(App).use(createPinia()).use(router).mount('#app')
