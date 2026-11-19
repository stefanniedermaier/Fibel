import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

/** Service worker state, shared app-wide. */
export const offlineReady = ref(false)
export const needRefresh = ref(false)
let updateServiceWorker: ((reload?: boolean) => Promise<void>) | undefined

export function initPwa(): void {
  if (!('serviceWorker' in navigator)) return
  updateServiceWorker = registerSW({
    onOfflineReady() {
      offlineReady.value = true
    },
    onNeedRefresh() {
      needRefresh.value = true
    },
  })
}

/** Activates a waiting update and reloads the app. */
export async function applyUpdate(): Promise<void> {
  await updateServiceWorker?.(true)
}

export function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

export async function requestPersistentStorage(): Promise<boolean | undefined> {
  if (!navigator.storage?.persist) return undefined
  if (await navigator.storage.persisted()) return true
  return navigator.storage.persist()
}
