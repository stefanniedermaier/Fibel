import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { completeSettings, resolveDefaults } from '@/core/content'
import { requestPersistentStorage } from '@/core/pwa'
import { createId } from '@/core/random'
import { rewardTotals } from '@/core/session'
import { say as sayWith } from '@/core/speech'
import {
  deleteProfile as dbDeleteProfile,
  getDb,
  getMeta,
  listProfiles,
  currentSessions,
  loadSettings,
  saveProfile,
  saveSettings,
  setMeta,
} from '@/core/storage/db'
import type { Profile, ProfileSettings, SessionRecord, SettingsPatch } from '@/core/types'
import type { LearnerContext } from '@/exercises/types'

const ACTIVE_PROFILE_KEY = 'activeProfileId'
/** The parent area stays unlocked this long without leaving it. */
const PARENT_UNLOCK_MS = 10 * 60 * 1000

export type NewProfile = Omit<Profile, 'id' | 'createdAt'>

export const useAppStore = defineStore('app', () => {
  const loaded = ref(false)
  const profiles = ref<Profile[]>([])
  const settingsById = ref<Record<string, ProfileSettings>>({})
  const activeId = ref<string>()
  const sessions = ref<SessionRecord[]>([])
  const parentUnlockedUntil = ref(0)

  const active = computed(() => profiles.value.find((p) => p.id === activeId.value))
  const settings = computed(() => (activeId.value ? settingsById.value[activeId.value] : undefined))
  const totals = computed(() => rewardTotals(sessions.value))
  const context = computed<LearnerContext | undefined>(() =>
    active.value && settings.value
      ? { land: active.value.land, grade: active.value.grade, settings: settings.value }
      : undefined,
  )

  let initPromise: Promise<void> | undefined
  function init(): Promise<void> {
    initPromise ??= (async () => {
      const db = await getDb()
      profiles.value = await listProfiles(db)
      for (const p of profiles.value) {
        settingsById.value[p.id] = completeSettings(p, await loadSettings(db, p.id))
      }
      const stored = await getMeta<string>(db, ACTIVE_PROFILE_KEY)
      if (stored && profiles.value.some((p) => p.id === stored)) await selectProfile(stored)
      loaded.value = true
    })()
    return initPromise
  }

  async function selectProfile(id: string): Promise<void> {
    const db = await getDb()
    activeId.value = id
    await setMeta(db, ACTIVE_PROFILE_KEY, id)
    sessions.value = await currentSessions(db, id, rewardDaysOf(id))
  }

  function rewardDaysOf(id: string): number {
    return settingsById.value[id]?.rewardDays ?? 14
  }

  async function createProfile(data: NewProfile): Promise<Profile> {
    const db = await getDb()
    const profile: Profile = { ...data, id: createId(), createdAt: Date.now() }
    const defaults = resolveDefaults(profile.land, profile.grade)
    await saveProfile(db, profile)
    await saveSettings(db, profile.id, defaults)
    profiles.value = [...profiles.value, profile]
    settingsById.value[profile.id] = defaults
    // Ask Chrome to keep our data (granted automatically for installed PWAs).
    void requestPersistentStorage()
    if (!activeId.value) await selectProfile(profile.id)
    return profile
  }

  /** Saves profile data; with `applyDefaults` the settings are reset to the start values. */
  async function updateProfile(profile: Profile, applyDefaults: boolean): Promise<void> {
    const db = await getDb()
    await saveProfile(db, profile)
    profiles.value = profiles.value.map((p) => (p.id === profile.id ? { ...profile } : p))
    if (applyDefaults) {
      const current = settingsById.value[profile.id]
      // Voice and tempo are device-related, not school-related – keep them.
      const next: ProfileSettings = {
        ...resolveDefaults(profile.land, profile.grade),
        voiceURI: current?.voiceURI ?? null,
        speechRate: current?.speechRate ?? resolveDefaults(profile.land, profile.grade).speechRate,
      }
      await saveSettings(db, profile.id, next)
      settingsById.value[profile.id] = next
    }
  }

  async function updateSettings(profileId: string, patch: SettingsPatch): Promise<void> {
    const current = settingsById.value[profileId]
    if (!current) return
    const next = { ...current, ...patch }
    await saveSettings(await getDb(), profileId, next)
    settingsById.value[profileId] = next
    if (patch.rewardDays !== undefined && profileId === activeId.value) await refreshSessions()
  }

  async function removeProfile(id: string): Promise<void> {
    const db = await getDb()
    await dbDeleteProfile(db, id)
    profiles.value = profiles.value.filter((p) => p.id !== id)
    delete settingsById.value[id]
    if (activeId.value === id) {
      activeId.value = undefined
      sessions.value = []
      await setMeta(db, ACTIVE_PROFILE_KEY, null)
    }
  }

  async function refreshSessions(): Promise<void> {
    // Also deletes units that expired since the last look.
    const id = activeId.value
    if (id) sessions.value = await currentSessions(await getDb(), id, rewardDaysOf(id))
  }

  /** Speaks with the active profile's voice settings. */
  function say(text: string, maxMs?: number): Promise<void> {
    const s = settings.value
    return sayWith(
      text,
      {
        voiceURI: s?.voiceURI ?? null,
        voiceURIEn: s?.voiceURIEn ?? null,
        speechRate: s?.speechRate ?? 0.85,
      },
      maxMs,
    )
  }

  // A function, not a computed: the result depends on the current time.
  function isParentUnlocked(): boolean {
    return parentUnlockedUntil.value > Date.now()
  }
  function unlockParent() {
    parentUnlockedUntil.value = Date.now() + PARENT_UNLOCK_MS
  }
  function lockParent() {
    parentUnlockedUntil.value = 0
  }

  return {
    loaded,
    profiles,
    settingsById,
    activeId,
    active,
    settings,
    sessions,
    totals,
    context,
    init,
    selectProfile,
    createProfile,
    updateProfile,
    updateSettings,
    removeProfile,
    refreshSessions,
    say,
    isParentUnlocked,
    unlockParent,
    lockParent,
  }
})
