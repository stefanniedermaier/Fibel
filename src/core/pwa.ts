import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

/** Service worker state, shared app-wide. */
export const offlineReady = ref(false)
export const needRefresh = ref(false)
let updateServiceWorker: ((reload?: boolean) => Promise<void>) | undefined

/** Chrome's install event (not yet in the TypeScript DOM types). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Installation state: Chrome offers its own dialog, other browsers need the menu. */
export const installed = ref(isInstalled())
export const canPromptInstall = ref(false)
let installEvent: BeforeInstallPromptEvent | undefined

function listenForInstall(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Keep Chrome's mini bar away; the app shows its own hint with a button.
    e.preventDefault()
    installEvent = e as BeforeInstallPromptEvent
    canPromptInstall.value = true
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    canPromptInstall.value = false
    installEvent = undefined
  })
}

/** Opens Chrome's install dialog. Returns true if the app was installed. */
export async function promptInstall(): Promise<boolean> {
  const event = installEvent
  if (!event) return false
  installEvent = undefined
  canPromptInstall.value = false
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') installed.value = true
  return outcome === 'accepted'
}

export function initPwa(): void {
  listenForInstall()
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
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false
}

export async function requestPersistentStorage(): Promise<boolean | undefined> {
  if (!navigator.storage?.persist) return undefined
  if (await navigator.storage.persisted()) return true
  return navigator.storage.persist()
}
