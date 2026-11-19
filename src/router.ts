import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

// Hash history: deep links work on GitHub Pages without a 404 fallback.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      // Device check (voice, offline, storage). Reachable in production on purpose,
      // so it can be tested on the tablet; later it moves into the parent area.
      path: '/geraetetest',
      name: 'device-check',
      component: () => import('./views/DeviceCheckView.vue'),
    },
  ],
})
