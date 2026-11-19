/**
 * Local storage in IndexedDB. Everything stays on the device.
 * Migrations: bump DB_VERSION and add a block `if (oldVersion < N)` in `upgrade`.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { plain } from '../plain'
import type { ProfileSettings, ProgressRecord, Profile, SessionRecord } from '../types'

export const DB_NAME = 'fibel'
export const DB_VERSION = 1

export interface StoredSettings {
  profileId: string
  settings: Partial<ProfileSettings>
}

interface FibelDB extends DBSchema {
  profiles: { key: string; value: Profile }
  settings: { key: string; value: StoredSettings }
  progress: {
    key: [string, string]
    value: ProgressRecord
    indexes: { byProfile: string }
  }
  sessions: {
    key: string
    value: SessionRecord
    indexes: { byProfile: string }
  }
  meta: { key: string; value: unknown }
}

export type Db = IDBPDatabase<FibelDB>

export function openFibelDB(name: string = DB_NAME): Promise<Db> {
  return openDB<FibelDB>(name, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('profiles', { keyPath: 'id' })
        db.createObjectStore('settings', { keyPath: 'profileId' })
        const progress = db.createObjectStore('progress', { keyPath: ['profileId', 'itemKey'] })
        progress.createIndex('byProfile', 'profileId')
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' })
        sessions.createIndex('byProfile', 'profileId')
        db.createObjectStore('meta')
      }
    },
  })
}

let shared: Promise<Db> | undefined

/** The app-wide database connection. */
export function getDb(): Promise<Db> {
  shared ??= openFibelDB()
  return shared
}

// --- Profiles & settings -----------------------------------------------------

export async function listProfiles(db: Db): Promise<Profile[]> {
  const profiles = await db.getAll('profiles')
  return profiles.sort((a, b) => a.createdAt - b.createdAt)
}

export async function saveProfile(db: Db, profile: Profile): Promise<void> {
  await db.put('profiles', plain(profile))
}

export async function loadSettings(
  db: Db,
  profileId: string,
): Promise<Partial<ProfileSettings> | undefined> {
  return (await db.get('settings', profileId))?.settings
}

export async function saveSettings(
  db: Db,
  profileId: string,
  settings: ProfileSettings,
): Promise<void> {
  await db.put('settings', { profileId, settings: plain(settings) })
}

/** Deletes a profile with its settings, progress and sessions. */
export async function deleteProfile(db: Db, profileId: string): Promise<void> {
  const tx = db.transaction(['profiles', 'settings', 'progress', 'sessions'], 'readwrite')
  await tx.objectStore('profiles').delete(profileId)
  await tx.objectStore('settings').delete(profileId)
  for (const store of ['progress', 'sessions'] as const) {
    let cursor = await tx.objectStore(store).index('byProfile').openCursor(profileId)
    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }
  }
  await tx.done
}

// --- Progress ----------------------------------------------------------------

export async function loadProgress(
  db: Db,
  profileId: string,
): Promise<Map<string, ProgressRecord>> {
  const records = await db.getAllFromIndex('progress', 'byProfile', profileId)
  return new Map(records.map((r) => [r.itemKey, r]))
}

export async function saveProgress(db: Db, record: ProgressRecord): Promise<void> {
  await db.put('progress', record)
}

// --- Sessions ----------------------------------------------------------------

export async function saveSession(db: Db, session: SessionRecord): Promise<void> {
  await db.put('sessions', plain(session))
}

export async function listSessions(db: Db, profileId: string): Promise<SessionRecord[]> {
  return db.getAllFromIndex('sessions', 'byProfile', profileId)
}

// --- Meta --------------------------------------------------------------------

export async function getMeta<T>(db: Db, key: string): Promise<T | undefined> {
  return (await db.get('meta', key)) as T | undefined
}

export async function setMeta(db: Db, key: string, value: unknown): Promise<void> {
  await db.put('meta', value, key)
}
