import { describe, expect, it } from 'vitest'
import { MAX_BOX, nextBox, pickItems, updateProgress } from '@/core/leitner'
import { createRng } from '@/core/random'
import type { ProgressRecord } from '@/core/types'

const rec = (itemKey: string, box: number, lastSeen = 0): ProgressRecord => ({
  profileId: 'p',
  itemKey,
  box,
  correct: 0,
  wrong: 0,
  lastSeen,
})

describe('nextBox', () => {
  it('steigt bei richtig im ersten Versuch, bis maximal Box 5', () => {
    expect(nextBox(0, 'first-try')).toBe(1)
    expect(nextBox(3, 'first-try')).toBe(4)
    expect(nextBox(MAX_BOX, 'first-try')).toBe(MAX_BOX)
  })

  it('bleibt bei richtig im zweiten Versuch und fällt bei gezeigter Lösung auf Box 1', () => {
    expect(nextBox(3, 'second-try')).toBe(3)
    expect(nextBox(0, 'second-try')).toBe(1)
    expect(nextBox(4, 'revealed')).toBe(1)
  })
})

describe('updateProgress', () => {
  it('legt neue Einträge an und zählt richtig/falsch', () => {
    const r1 = updateProgress(undefined, 'p', 'x', 'first-try', 100)
    expect(r1).toEqual({
      profileId: 'p',
      itemKey: 'x',
      box: 1,
      correct: 1,
      wrong: 0,
      lastSeen: 100,
    })
    const r2 = updateProgress(r1, 'p', 'x', 'revealed', 200)
    expect(r2).toMatchObject({ box: 1, correct: 1, wrong: 1, lastSeen: 200 })
  })
})

describe('pickItems', () => {
  const keys = Array.from({ length: 20 }, (_, i) => `k${i}`)
  const id = (k: string) => k

  it('liefert die gewünschte Anzahl ohne Doppelte, wenn genug da sind', () => {
    const picked = pickItems(keys, id, new Map(), 8, createRng(1))
    expect(picked).toHaveLength(8)
    expect(new Set(picked).size).toBe(8)
  })

  it('mischt etwa 70 % sichere und 30 % neue oder schwierige Items', () => {
    const progress = new Map(keys.slice(0, 10).map((k) => [k, rec(k, 3)]))
    const picked = pickItems(keys, id, progress, 10, createRng(2))
    const safe = picked.filter((k) => progress.has(k)).length
    expect(safe).toBe(7)
  })

  it('nimmt schwierige Items, die am längsten her sind, zuerst', () => {
    const progress = new Map([
      ['k0', rec('k0', 3)],
      ['k1', rec('k1', 3)],
      ['k2', rec('k2', 3)],
      ['k3', rec('k3', 1, 500)],
      ['k4', rec('k4', 1, 100)],
    ])
    const candidates = ['k0', 'k1', 'k2', 'k3', 'k4']
    // 3 items: 2 safe, 1 learn → the hard item seen longest ago.
    const picked = pickItems(candidates, id, progress, 3, createRng(3))
    expect(picked).toContain('k4')
    expect(picked).not.toContain('k3')
  })

  it('füllt aus dem anderen Topf auf', () => {
    const picked = pickItems(['a', 'b', 'c'], id, new Map(), 3, createRng(4))
    expect([...picked].sort()).toEqual(['a', 'b', 'c'])
  })

  it('wiederholt bei zu wenigen Kandidaten, aber nie direkt hintereinander', () => {
    const picked = pickItems(['a', 'b'], id, new Map(), 7, createRng(5))
    expect(picked).toHaveLength(7)
    for (let i = 1; i < picked.length; i++) expect(picked[i]).not.toBe(picked[i - 1])
  })

  it('kommt mit leeren Listen zurecht', () => {
    expect(pickItems([], id, new Map(), 5, createRng(6))).toEqual([])
  })
})
