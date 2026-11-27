import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppStore } from './stores/app'
import HomeView from './views/HomeView.vue'

// Hash history: deep links work on GitHub Pages without a 404 fallback.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { needsProfile: true } },
    {
      path: '/profile',
      name: 'profiles',
      component: () => import('./views/ProfileSelectView.vue'),
    },
    {
      path: '/einheit/:grade(\\d+)/:topic(lesen|schreiben|rechnen|uhr)/:category?',
      name: 'session',
      component: () => import('./views/SessionView.vue'),
      meta: { needsProfile: true },
    },
    {
      path: '/fach/:grade(\\d+)/:topic(lesen|schreiben|rechnen|uhr)',
      name: 'topic',
      component: () => import('./views/TopicView.vue'),
      meta: { needsProfile: true },
    },
    {
      path: '/klassen',
      name: 'grades',
      component: () => import('./views/GradesView.vue'),
      meta: { needsProfile: true },
    },
    {
      path: '/trophaeen',
      name: 'trophies',
      component: () => import('./views/TrophiesView.vue'),
      meta: { needsProfile: true },
    },
    {
      path: '/eltern',
      component: () => import('./views/parent/ParentLayout.vue'),
      children: [
        { path: '', name: 'parent', component: () => import('./views/parent/ParentHomeView.vue') },
        {
          path: 'profil/neu',
          name: 'profile-new',
          component: () => import('./views/parent/ProfileEditView.vue'),
        },
        {
          path: 'statistik/:id',
          name: 'stats',
          component: () => import('./views/parent/StatsView.vue'),
          props: true,
        },
        {
          path: 'sicherung',
          name: 'backup',
          component: () => import('./views/parent/BackupView.vue'),
        },
        {
          path: 'schrift',
          name: 'script-preview',
          component: () => import('./views/parent/ScriptPreviewView.vue'),
        },
        {
          path: 'sprachtest',
          name: 'speech-check',
          component: () => import('./views/parent/SpeechCheckView.vue'),
        },
        {
          path: 'profil/:id',
          name: 'profile-edit',
          component: () => import('./views/parent/ProfileEditView.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/datenschutz',
      name: 'privacy',
      component: () => import('./views/PrivacyView.vue'),
    },
    {
      path: '/ueber',
      name: 'about',
      component: () => import('./views/AboutView.vue'),
    },
    {
      // Device check (voice, offline, storage); also linked from the parent area.
      path: '/geraetetest',
      name: 'device-check',
      component: () => import('./views/DeviceCheckView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const store = useAppStore()
  await store.init()
  if (to.meta.needsProfile && !store.active) return { name: 'profiles' }
})

router.afterEach((to) => {
  // Leaving the parent area locks it again.
  const keepsParentOpen =
    to.path.startsWith('/eltern') || ['device-check', 'privacy', 'about'].includes(String(to.name))
  if (!keepsParentOpen) useAppStore().lockParent()
})
