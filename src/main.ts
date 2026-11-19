import { createApp } from 'vue'
// Latin subset only (covers ä, ö, ü, ß) – keeps the offline cache small.
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import './styles/base.css'
import App from './App.vue'
import { router } from './router'
import { initPwa } from './core/pwa'

initPwa()
createApp(App).use(router).mount('#app')
