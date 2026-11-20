/**
 * Backup as a JSON file: everything from IndexedDB (profiles, settings, progress,
 * units). The file stays with the parents – nothing is sent anywhere.
 */
import type { ProgressRecord, Profile, SessionRecord } from '../types'
import { DB_VERSION, getMeta, setMeta, type Db, type StoredSettings } from './db'

export const BACKUP_APP = 'fibel'
export const BACKUP_FORMAT = 1
export const LAST_BACKUP_KEY = 'lastBackup'
/** A reminder appears when the last backup is older than this. */
export const BACKUP_REMINDER_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

export interface Backup {
  app: typeof BACKUP_APP
  format: number
  schema: number
  exportedAt: string
  data: {
    profiles: Profile[]
    settings: StoredSettings[]
    progress: ProgressRecord[]
    sessions: SessionRecord[]
    meta: { key: string; value: unknown }[]
  }
}

export async function exportBackup(db: Db, now: Date = new Date()): Promise<Backup> {
  const metaKeys = (await db.getAllKeys('meta')) as string[]
  const meta = await Promise.all(
    metaKeys.map(async (key) => ({ key, value: await db.get('meta', key) })),
  )
  return {
    app: BACKUP_APP,
    format: BACKUP_FORMAT,
    schema: DB_VERSION,
    exportedAt: now.toISOString(),
    data: {
      profiles: await db.getAll('profiles'),
      settings: await db.getAll('settings'),
      progress: await db.getAll('progress'),
      sessions: await db.getAll('sessions'),
      // The backup date itself is not restored – it belongs to this device.
      meta: meta.filter((m) => m.key !== LAST_BACKUP_KEY),
    },
  }
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value)
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Checks a loaded file. Throws a readable error if it is not a Fibel backup. */
export function validateBackup(value: unknown): Backup {
  if (!isObject(value) || value.app !== BACKUP_APP) {
    throw new Error('Das ist keine Sicherung von Fibel.')
  }
  if (value.format !== BACKUP_FORMAT) {
    throw new Error(
      'Diese Sicherung stammt aus einer anderen App-Version und kann nicht gelesen werden.',
    )
  }
  if (typeof value.schema !== 'number' || value.schema > DB_VERSION) {
    throw new Error('Diese Sicherung ist neuer als die App. Bitte zuerst die App aktualisieren.')
  }
  const data = value.data
  if (!isObject(data)) throw new Error('Die Sicherung ist unvollständig.')
  for (const key of ['profiles', 'settings', 'progress', 'sessions', 'meta'] as const) {
    if (!isArray(data[key])) throw new Error(`Die Sicherung ist unvollständig (${key} fehlt).`)
  }
  const profiles = data.profiles as unknown[]
  if (
    !profiles.every((p) => isObject(p) && typeof p.id === 'string' && typeof p.name === 'string')
  ) {
    throw new Error('Die Profile in der Sicherung sind beschädigt.')
  }
  return value as unknown as Backup
}

export interface ImportSummary {
  profiles: number
  sessions: number
}

/** Replaces ALL data on this device with the backup – in one transaction. */
export async function importBackup(db: Db, backup: Backup): Promise<ImportSummary> {
  const stores = ['profiles', 'settings', 'progress', 'sessions', 'meta'] as const
  const tx = db.transaction([...stores], 'readwrite')
  for (const store of stores) await tx.objectStore(store).clear()
  const { data } = backup
  for (const p of data.profiles) await tx.objectStore('profiles').put(p)
  for (const s of data.settings) await tx.objectStore('settings').put(s)
  for (const p of data.progress) await tx.objectStore('progress').put(p)
  for (const s of data.sessions) await tx.objectStore('sessions').put(s)
  for (const m of data.meta) await tx.objectStore('meta').put(m.value, m.key)
  await tx.done
  return { profiles: data.profiles.length, sessions: data.sessions.length }
}

export function backupFileName(now: Date = new Date()): string {
  return `fibel-sicherung-${now.toISOString().slice(0, 10)}.json`
}

export async function markBackedUp(db: Db, now: number = Date.now()): Promise<void> {
  await setMeta(db, LAST_BACKUP_KEY, now)
}

export async function lastBackup(db: Db): Promise<number | undefined> {
  return getMeta<number>(db, LAST_BACKUP_KEY)
}

/** Remind when there is something to lose and the last backup is old (or missing). */
export function backupDue(
  last: number | undefined,
  unitCount: number,
  now: number = Date.now(),
): boolean {
  if (unitCount === 0) return false
  return last === undefined || now - last > BACKUP_REMINDER_DAYS * DAY_MS
}
