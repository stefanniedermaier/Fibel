import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import {
  backupDue,
  backupFileName,
  exportBackup,
  importBackup,
  lastBackup,
  markBackedUp,
  validateBackup,
} from '@/core/storage/backup'
import {
  getMeta,
  listProfiles,
  listSessions,
  loadProgress,
  loadSettings,
  openFibelDB,
  saveProfile,
  saveProgress,
  saveSession,
  saveSettings,
  setMeta,
} from '@/core/storage/db'
import type { SessionRecord } from '@/core/types'

let counter = 0
const freshDb = () => openFibelDB(`backup-${++counter}`)
const DAY = 24 * 60 * 60 * 1000

async function filledDb() {
  const db = await freshDb()
  await saveProfile(db, {
    id: 'p1',
    name: 'Kind',
    avatar: '1F98A',
    land: 'DE-BY',
    grade: 1,
    createdAt: 1,
  })
  await saveSettings(db, 'p1', resolveDefaults('DE-BY', 1))
  await saveProgress(db, {
    profileId: 'p1',
    itemKey: 'lesen.wort-bild:oma',
    box: 3,
    correct: 3,
    wrong: 1,
    lastSeen: 5,
  })
  const session: SessionRecord = {
    id: 's1',
    profileId: 'p1',
    land: 'DE-BY',
    grade: 1,
    topic: 'lesen',
    startedAt: 1,
    durationMs: 1000,
    total: 8,
    tasks: [],
    stars: 7,
    crown: true,
    completed: true,
  }
  await saveSession(db, session)
  await setMeta(db, 'activeProfileId', 'p1')
  return db
}

describe('Sicherung', () => {
  it('stellt alle Daten auf einem leeren Gerät vollständig wieder her', async () => {
    const source = await filledDb()
    const backup = validateBackup(JSON.parse(JSON.stringify(await exportBackup(source))))

    const target = await freshDb()
    const summary = await importBackup(target, backup)
    expect(summary).toEqual({ profiles: 1, sessions: 1 })
    expect((await listProfiles(target)).map((p) => p.name)).toEqual(['Kind'])
    expect((await loadSettings(target, 'p1'))?.tasksPerUnit).toBe(8)
    expect((await loadProgress(target, 'p1')).get('lesen.wort-bild:oma')?.box).toBe(3)
    expect((await listSessions(target, 'p1'))[0]?.stars).toBe(7)
    expect(await getMeta(target, 'activeProfileId')).toBe('p1')
  })

  it('ersetzt vorhandene Daten statt sie zu mischen', async () => {
    const backup = await exportBackup(await filledDb())
    const target = await freshDb()
    await saveProfile(target, {
      id: 'alt',
      name: 'Alt',
      avatar: '1F43B',
      land: 'DE-BY',
      grade: 2,
      createdAt: 0,
    })
    await importBackup(target, backup)
    expect((await listProfiles(target)).map((p) => p.id)).toEqual(['p1'])
  })

  it('übernimmt das Sicherungsdatum nicht auf das neue Gerät', async () => {
    const source = await filledDb()
    await markBackedUp(source, 123)
    const target = await freshDb()
    await importBackup(target, await exportBackup(source))
    expect(await lastBackup(target)).toBeUndefined()
  })

  it('lehnt fremde, unvollständige und zu neue Dateien ab', () => {
    expect(() => validateBackup({ hello: 'world' })).toThrow(/keine Sicherung/)
    expect(() => validateBackup({ app: 'fibel', format: 99 })).toThrow(/anderen App-Version/)
    expect(() => validateBackup({ app: 'fibel', format: 1, schema: 999, data: {} })).toThrow(
      /neuer als die App/,
    )
    expect(() =>
      validateBackup({ app: 'fibel', format: 1, schema: 1, data: { profiles: [] } }),
    ).toThrow(/unvollständig/)
    expect(() =>
      validateBackup({
        app: 'fibel',
        format: 1,
        schema: 1,
        data: { profiles: [{ nope: 1 }], settings: [], progress: [], sessions: [], meta: [] },
      }),
    ).toThrow(/beschädigt/)
  })

  it('erinnert nur, wenn es etwas zu verlieren gibt und die Sicherung alt ist', () => {
    const now = 100 * DAY
    expect(backupDue(undefined, 0, now)).toBe(false)
    expect(backupDue(undefined, 3, now)).toBe(true)
    expect(backupDue(now - 10 * DAY, 3, now)).toBe(false)
    expect(backupDue(now - 31 * DAY, 3, now)).toBe(true)
  })

  it('benennt die Datei mit dem Datum', () => {
    expect(backupFileName(new Date('2026-11-20T10:00:00Z'))).toBe('fibel-sicherung-2026-11-20.json')
  })
})
