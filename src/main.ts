import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Latin subset only (covers ä, ö, ü, ß) – keeps the offline cache small.
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import './styles/base.css'
import App from './App.vue'
import { router } from './router'
import { initPwa } from './core/pwa'
import { unlockAudio } from './core/sounds'

initPwa()
// Browsers allow audio only after the first tap.
document.addEventListener('pointerdown', unlockAudio, { once: true })

createApp(App).use(createPinia()).use(router).mount('#app')
