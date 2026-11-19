import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { resolveDefaults } from '@/core/content'
import {
  deleteProfile,
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
import type { Profile, SessionRecord } from '@/core/types'

let counter = 0
const freshDb = () => openFibelDB(`test-${++counter}`)

const profile = (id: string, createdAt: number): Profile => ({
  id,
  name: `Kind ${id}`,
  avatar: '1F98A',
  land: 'DE-BY',
  grade: 1,
  createdAt,
})

const session = (id: string, profileId: string): SessionRecord => ({
  id,
  profileId,
  land: 'DE-BY',
  grade: 1,
  topic: 'rechnen',
  startedAt: 0,
  durationMs: 1000,
  total: 8,
  tasks: [],
  stars: 5,
  crown: false,
  completed: true,
})

describe('IndexedDB-Speicher', () => {
  it('speichert Profile sortiert nach Anlagedatum', async () => {
    const db = await freshDb()
    await saveProfile(db, profile('b', 2))
    await saveProfile(db, profile('a', 1))
    expect((await listProfiles(db)).map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('speichert Einstellungen, Fortschritt, Einheiten und Meta-Werte', async () => {
    const db = await freshDb()
    await saveSettings(db, 'a', resolveDefaults('DE-BY', 1))
    expect((await loadSettings(db, 'a'))?.tasksPerUnit).toBe(8)

    await saveProgress(db, {
      profileId: 'a',
      itemKey: 'x',
      box: 2,
      correct: 2,
      wrong: 0,
      lastSeen: 1,
    })
    expect((await loadProgress(db, 'a')).get('x')?.box).toBe(2)

    await saveSession(db, session('s1', 'a'))
    expect(await listSessions(db, 'a')).toHaveLength(1)

    await setMeta(db, 'activeProfileId', 'a')
    expect(await getMeta(db, 'activeProfileId')).toBe('a')
  })

  it('speichert auch reaktive Vue-Objekte (Formulare, Store-Zustand)', async () => {
    const db = await freshDb()
    const settings = reactive(resolveDefaults('DE-BY', 1))
    settings.unlockedGrades.push(2)
    await saveSettings(db, 'a', settings)
    expect((await loadSettings(db, 'a'))?.unlockedGrades).toEqual([2])
  })

  it('löscht ein Profil mit allen Daten, andere Profile bleiben', async () => {
    const db = await freshDb()
    for (const id of ['a', 'b']) {
      await saveProfile(db, profile(id, 0))
      await saveSettings(db, id, resolveDefaults('DE-BY', 1))
      await saveProgress(db, {
        profileId: id,
        itemKey: 'x',
        box: 1,
        correct: 1,
        wrong: 0,
        lastSeen: 0,
      })
      await saveSession(db, session(`s-${id}`, id))
    }
    await deleteProfile(db, 'a')
    expect((await listProfiles(db)).map((p) => p.id)).toEqual(['b'])
    expect(await loadSettings(db, 'a')).toBeUndefined()
    expect((await loadProgress(db, 'a')).size).toBe(0)
    expect(await listSessions(db, 'a')).toHaveLength(0)
    expect(await listSessions(db, 'b')).toHaveLength(1)
    expect((await loadProgress(db, 'b')).size).toBe(1)
  })
})
