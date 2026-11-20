import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import {
  MIN_ANLAUT_GROUP,
  deriveAnlaut,
  groupBy,
  listenEntries,
  resolveListenWords,
} from '@/core/hoeren'
import { createRng } from '@/core/random'
import { checkLauttreu } from '@/core/lauttreue'
import { silbenKlatschen } from '@/exercises/lesen/silben-klatschen'
import type { LearnerContext } from '@/exercises/types'

const pool = resolveListenWords('DE-BY', 1)
const byId = new Map(pool.map((w) => [w.id, w]))

describe('Anlaut nach Gehör', () => {
  it.each([
    ['Hase', 'h'],
    ['Schaf', 'sch'],
    ['Stern', 'sch'],
    ['Spinne', 'sch'],
    ['Vogel', 'f'],
    ['Pferd', 'pf'],
    ['Eis', 'ei'],
    ['Eule', 'eu'],
    ['Auto', 'au'],
    ['Käse', 'k'],
    ['Ärmel', 'e'],
    ['Clown', 'k'],
  ])('%s → %s', (text, sound) => {
    expect(deriveAnlaut(text)).toBe(sound)
  })

  it('nimmt die Korrektur von Hand (Vase klingt wie Wal)', () => {
    expect(byId.get('vase')?.anlaut).toBe('w')
  })
})

describe('Hörwortschatz', () => {
  it('besteht aus Lese-Wörtern mit Bild und der Hörliste', () => {
    expect(pool.every((w) => typeof w.image === 'string')).toBe(true)
    expect(pool.filter((w) => w.source === 'lesen').length).toBeGreaterThanOrEqual(100)
    expect(pool.filter((w) => w.source === 'hoeren').length).toBe(listenEntries(1).length)
    expect(pool.length).toBeGreaterThanOrEqual(180)
  })

  it('enthält bewusst auch nicht lauttreue Wörter (nur zum Hören)', () => {
    const hund = listenEntries(1).find((w) => w.id === 'hund')!
    expect(checkLauttreu(hund.text, hund.syllables).length).toBeGreaterThan(0)
  })

  it('hat Reimgruppen mit mindestens zwei Wörtern', () => {
    const rhymes = groupBy(pool, (w) => w.reim)
    expect(rhymes.size).toBeGreaterThanOrEqual(20)
    for (const [reim, words] of rhymes) expect(words.length, reim).toBeGreaterThanOrEqual(2)
    expect(
      rhymes
        .get('ose')
        ?.map((w) => w.text)
        .sort(),
    ).toEqual(['Dose', 'Hose', 'Rose'])
    expect(
      rhymes
        .get('und')
        ?.map((w) => w.text)
        .sort(),
    ).toEqual(['Hund', 'Mund'])
  })

  it('hat genug Anlautgruppen und ordnet nach Klang', () => {
    const groups = groupBy(pool, (w) => w.anlaut)
    const usable = [...groups.values()].filter((g) => g.length >= MIN_ANLAUT_GROUP)
    expect(usable.length).toBeGreaterThanOrEqual(12)
    const f = groups.get('f')!.map((w) => w.text)
    expect(f).toContain('Vogel')
    expect(f).toContain('Fisch')
    expect(groups.get('sch')!.map((w) => w.text)).toContain('Stern')
  })
})

describe('Silben klatschen mit Hörwörtern', () => {
  const ctx: LearnerContext = { land: 'DE-BY', grade: 1, settings: resolveDefaults('DE-BY', 1) }
  const params = { wordGrade: 1 }

  it('übt auch mit Hörwörtern', () => {
    const items = silbenKlatschen.items(ctx, params)
    expect(items).toContain('lesen.silben-klatschen:giraffe')
    expect(items).toContain('lesen.silben-klatschen:malen')
    const { data } = silbenKlatschen.generate(
      ctx,
      params,
      'lesen.silben-klatschen:giraffe',
      createRng(1),
    )
    expect(data.correctKey).toBe('3')
    expect(data.image).toBe('1F992')
  })

  it('lässt Wörter mit mehr als vier Silben weg', () => {
    for (const key of silbenKlatschen.items(ctx, params)) {
      const { data } = silbenKlatschen.generate(ctx, params, key, createRng(2))
      expect(Number(data.correctKey)).toBeLessThanOrEqual(4)
    }
  })
})
