import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { usesOnly } from '@/core/graphemes'
import { createRng } from '@/core/random'
import { planSession, sharesOf, spreadOut } from '@/core/session'
import type { CatalogEntry, ProfileSettings, ProgressRecord } from '@/core/types'
import { resolveWords } from '@/core/words'
import { anlaut } from '@/exercises/lesen/anlaut'
import { bildWort } from '@/exercises/lesen/bild-wort'
import {
  READING_LEVEL_KEY,
  distractorWords,
  readingLevel,
  readingPool,
} from '@/exercises/lesen/shared'
import { silbenHoeren } from '@/exercises/lesen/silben-hoeren'
import { silbenKlatschen } from '@/exercises/lesen/silben-klatschen'
import { wortBild } from '@/exercises/lesen/wort-bild'
import { getExercise } from '@/exercises/registry'
import type { LearnerContext } from '@/exercises/types'

const startSettings = resolveDefaults('DE-BY', 1)
const ctxWith = (
  settings: Partial<ProfileSettings> = {},
  progress = new Map(),
): LearnerContext => ({
  land: 'DE-BY',
  grade: 1,
  settings: { ...startSettings, ...settings },
  progress,
})
const start = ctxWith()
const everything = ctxWith({ letterFilter: false })
const params = { wordGrade: 1 }
const RUNS = 30

describe('Lesepool und Level', () => {
  it('enthält mit den Start-Buchstaben nur lesbare Wörter', () => {
    const pool = readingPool(start, params)
    expect(pool.length).toBeGreaterThanOrEqual(10)
    expect(pool.map((w) => w.text)).toEqual(expect.arrayContaining(['Oma', 'Mama', 'Mila', 'Leo']))
    const unlocked = new Set(startSettings.letters)
    for (const w of pool) expect(usesOnly(w.text, unlocked), w.text).toBe(true)
  })

  it('beginnt ohne Lernstand bei Level 1', () => {
    const pool = readingPool(everything, params)
    expect(pool.every((w) => w.level === 1)).toBe(true)
  })

  it('öffnet Level 2, wenn 80 % von Level 1 sicher sitzen', () => {
    const words = resolveWords('DE-BY', 1)
    const level1 = words.filter((w) => w.level === 1)
    const progress = new Map<string, ProgressRecord>()
    level1.slice(0, Math.ceil(level1.length * 0.8)).forEach((w) =>
      progress.set(`lesen.wort-bild:${w.id}`, {
        profileId: 'p',
        itemKey: `lesen.wort-bild:${w.id}`,
        box: 3,
        correct: 3,
        wrong: 0,
        lastSeen: 0,
      }),
    )
    expect(readingLevel(words, everything.settings, new Map())).toBe(1)
    expect(readingLevel(words, everything.settings, progress)).toBe(2)
  })

  it('nimmt ein von Hand gesetztes Level', () => {
    const words = resolveWords('DE-BY', 1)
    const settings = { ...everything.settings, levels: { [READING_LEVEL_KEY]: 3 } }
    expect(readingLevel(words, settings, new Map())).toBe(3)
  })

  it('wählt ähnlich aussehende Ablenker zuerst und nie dasselbe Bild', () => {
    const words = resolveWords('DE-BY', 1)
    const rose = words.find((w) => w.id === 'rose')!
    const picked = distractorWords(rose, words, 2, createRng(1))
    expect(picked.map((w) => w.id).sort()).toEqual(['dose', 'hose'])
    expect(picked.every((w) => w.image !== rose.image)).toBe(true)
  })
})

describe('L1 Silben hören', () => {
  it('nutzt nur freigeschaltete Silben und bietet ähnliche Ablenker an', () => {
    const items = silbenHoeren.items(start, params)
    expect(items).toHaveLength(10)
    const rng = createRng(2)
    for (const key of items) {
      for (let i = 0; i < RUNS; i++) {
        const { data, instruction } = silbenHoeren.generate(start, params, key, rng)
        expect(data.choices).toHaveLength(3)
        expect(new Set(data.choices.map((c) => c.key)).size).toBe(3)
        expect(data.choices.map((c) => c.key)).toContain(data.target)
        expect(data.choices.every((c) => usesOnly(c.key, new Set(startSettings.letters)))).toBe(
          true,
        )
        expect(instruction).toContain(data.target)
      }
    }
  })

  it('ist ohne genug Silben nicht verfügbar', () => {
    // a + m only give "ma" – one syllable, three are needed.
    expect(silbenHoeren.items(ctxWith({ letters: ['a', 'm'] }), params)).toEqual([])
  })
})

describe('L2 Wort → Bild', () => {
  it('zeigt drei verschiedene Bilder inklusive des richtigen', () => {
    const rng = createRng(3)
    for (const key of wortBild.items(everything, params)) {
      for (let i = 0; i < RUNS; i++) {
        const { data } = wortBild.generate(everything, params, key, rng)
        expect(data.choices).toHaveLength(3)
        expect(new Set(data.choices.map((c) => c.image)).size).toBe(3)
        expect(data.choices.map((c) => c.key)).toContain(data.correctKey)
      }
    }
  })
})

describe('L3 Bild → Wort', () => {
  it('bietet nur lesbare Wörter an', () => {
    const rng = createRng(4)
    const unlocked = new Set(startSettings.letters)
    for (const key of bildWort.items(start, params)) {
      for (let i = 0; i < RUNS; i++) {
        const { data } = bildWort.generate(start, params, key, rng)
        expect(data.choices).toHaveLength(3)
        expect(data.choices.map((c) => c.key)).toContain(data.correctKey)
        for (const c of data.choices) expect(usesOnly(c.syllables.join(''), unlocked)).toBe(true)
      }
    }
  })

  it('braucht mindestens drei lesbare Wörter', () => {
    // o + m only give Momo – one readable word, three are needed.
    expect(bildWort.items(ctxWith({ letters: ['o', 'm'] }), params)).toEqual([])
  })
})

describe('L4 Anlaut', () => {
  it('fragt nur Wörter ab, deren Anfangsbuchstabe bekannt ist, mit bekannten Ablenkern', () => {
    const items = anlaut.items(start, params)
    expect(items.length).toBeGreaterThan(10)
    const unlocked = new Set(startSettings.letters)
    const rng = createRng(5)
    for (const key of items) {
      const { data } = anlaut.generate(start, params, key, rng)
      expect(unlocked.has(data.correctKey)).toBe(true)
      expect(data.choices).toHaveLength(3)
      expect(data.choices.every((c) => unlocked.has(c.key))).toBe(true)
      expect(new Set(data.choices.map((c) => c.key)).size).toBe(3)
    }
  })

  it('stellt keinen Ablenker daneben, der wie die Lösung beginnt (Ei ↔ E)', () => {
    const rng = createRng(6)
    for (let i = 0; i < RUNS; i++) {
      const { data } = anlaut.generate(everything, params, 'lesen.anlaut:eis', rng)
      expect(data.correctKey).toBe('ei')
      expect(data.choices.filter((c) => c.key !== 'ei').some((c) => c.key.startsWith('e'))).toBe(
        false,
      )
    }
  })
})

describe('L5 Silben klatschen', () => {
  it('hat die Silbenzahl als richtige Antwort', () => {
    const rng = createRng(7)
    expect(
      silbenKlatschen.generate(start, params, 'lesen.silben-klatschen:tomate', rng).data.correctKey,
    ).toBe('3')
    expect(
      silbenKlatschen.generate(start, params, 'lesen.silben-klatschen:wal', rng).data.correctKey,
    ).toBe('1')
    // A listening task: independent of the unlocked letters.
    expect(silbenKlatschen.items(start, params).length).toBeGreaterThan(
      resolveWords('DE-BY', 1).length,
    )
  })
})

describe('Mischung in einer Einheit', () => {
  const lesen: CatalogEntry[] = [
    'silben-hoeren',
    'wort-bild',
    'bild-wort',
    'anlaut',
    'silben-klatschen',
  ].map((id) => ({
    id: `k1.lesen.${id}`,
    grade: 1,
    topic: 'lesen',
    exercise: `lesen.${id}`,
    params,
    title: id,
  }))

  it('verteilt Aufgaben gleichmäßig auf die Übungen', () => {
    expect(sharesOf(8, 5, createRng(1)).sort()).toEqual([1, 1, 2, 2, 2])
    expect(sharesOf(8, 1, createRng(1))).toEqual([8])
    const tasks = planSession(lesen, start, new Map(), 10, createRng(8), getExercise)
    const perEntry = new Map<string, number>()
    for (const t of tasks) perEntry.set(t.entry.id, (perEntry.get(t.entry.id) ?? 0) + 1)
    expect([...perEntry.values()]).toEqual([2, 2, 2, 2, 2])
  })

  it('stellt dieselbe Übung möglichst nicht zweimal hintereinander', () => {
    expect(spreadOut(['a', 'a', 'a', 'b', 'b', 'c'], (x) => x).join('')).toBe('ababac')
    // The frequent exercise must not pile up at the end.
    expect(spreadOut(['b', 'c', 'a', 'a', 'a'], (x) => x).join('')).toBe('abaca')
    for (let seed = 1; seed <= 30; seed++) {
      const tasks = planSession(lesen, start, new Map(), 6, createRng(seed), getExercise)
      for (let i = 1; i < tasks.length; i++) {
        expect(tasks[i]?.entry.id, `seed ${seed}`).not.toBe(tasks[i - 1]?.entry.id)
      }
    }
    const tasks = planSession(lesen, start, new Map(), 10, createRng(9), getExercise)
    for (let i = 1; i < tasks.length; i++) {
      expect(tasks[i]?.entry.id).not.toBe(tasks[i - 1]?.entry.id)
    }
  })
})
