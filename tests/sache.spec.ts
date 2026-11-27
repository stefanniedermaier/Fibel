import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { practiceCategories, practiceEntries } from '@/core/practice'
import { createRng } from '@/core/random'
import { itemLabel } from '@/core/stats'
import { topicLabel } from '@/core/types'
import { reihenfolge } from '@/exercises/lesen/reihenfolge'
import { getExercise } from '@/exercises/registry'
import { hoerenBild } from '@/exercises/sache/hoeren-bild'
import { paare } from '@/exercises/sache/paare'
import { getBegriff, THEMEN } from '@/exercises/sache/shared'
import { sortieren } from '@/exercises/sache/sortieren'
import { stimmtDas } from '@/exercises/sache/stimmt-das'

const settings = resolveDefaults('DE-BY', 1)
const ctx = { land: 'DE-BY', grade: 1, settings }

describe('HSU Klasse 1', () => {
  it('heißt in Bayern HSU, sonst Sachunterricht', () => {
    expect(topicLabel('sache', 'DE-BY')).toBe('HSU')
    expect(topicLabel('sache', 'DE-BW')).toBe('Sachunterricht')
  })

  it('zeigt die Themen des ersten Halbjahrs im Jahreslauf, alle wenn freigeschaltet', () => {
    expect(practiceCategories(ctx, 'sache', getExercise).map((c) => c.id)).toEqual([
      'sache.verkehr',
      'sache.obst-gemuese',
      'sache.sinne',
      'sache.sichtbar',
      'sache.jahreszeiten',
      'sache.feste',
      'sache.wetter',
      'sache.gesund',
      'sache.gefuehle',
    ])
    const units = Object.fromEntries(THEMEN.map((t) => [`k1.sache.${t.id}`, true]))
    const all = { ...ctx, settings: { ...settings, units } }
    expect(practiceCategories(all, 'sache', getExercise)).toHaveLength(THEMEN.length)
  })

  it('Hören → Bild: das genannte Bild ist dabei, ohne doppelte Bilder', () => {
    for (const t of THEMEN.filter((t) => t.erkennen.length > 0)) {
      for (const key of hoerenBild.items(ctx, { thema: t.id })) {
        const task = hoerenBild.generate(ctx, { thema: t.id }, key, createRng(3))
        const keys = task.data.choices.map((c) => c.key)
        expect(keys).toContain(task.data.correctKey)
        expect(new Set(task.data.choices.map((c) => c.image)).size).toBe(keys.length)
        expect(task.afterword).toBeTruthy()
      }
    }
    const apfel = hoerenBild.generate(
      ctx,
      { thema: 'obst-gemuese' },
      'sache.hoeren-bild:apfel',
      createRng(1),
    )
    expect(apfel.instruction).toBe('Tippe auf den Apfel.')
  })

  it('Paare: die richtige Antwort ist dabei und der Merksatz folgt', () => {
    for (const t of THEMEN) {
      for (const key of paare.items(ctx, { thema: t.id })) {
        const task = paare.generate(ctx, { thema: t.id }, key, createRng(2))
        expect(task.data.choices.map((c) => c.key)).toContain(task.data.correctKey)
        expect(task.instruction.endsWith('?')).toBe(true)
      }
    }
    const kuh = paare.generate(ctx, { thema: 'tiere' }, 'sache.paare:tiere:0', createRng(1))
    expect(kuh.data.correctKey).toBe('milch')
    expect(kuh.afterword).toBe(getBegriff('kuh').merksatz)
  })

  it('Sortieren: die Gruppe stimmt und die Jahreszeiten werden angesagt', () => {
    const t = sortieren.generate(
      ctx,
      { thema: 'jahreszeiten' },
      'sache.sortieren:jahreszeit:schlitten',
      createRng(1),
    )
    expect(t.data.correctKey).toBe('winter')
    expect(t.instruction).toBe(
      'Der Schlitten. Zu welcher Jahreszeit passt das: im Frühling, im Sommer, im Herbst oder im Winter?',
    )
    for (const th of THEMEN)
      for (const key of sortieren.items(ctx, { thema: th.id })) {
        const d = sortieren.generate(ctx, { thema: th.id }, key, createRng(1)).data
        expect(d.choices.map((c) => c.key)).toContain(d.correctKey)
      }
  })

  it('Nahrungsketten nur im HSU, nicht im Deutsch-Bildergeschichten', () => {
    expect(reihenfolge.items(ctx, {})).not.toContain('lesen.reihenfolge:kette-amsel')
    expect(reihenfolge.items(ctx, { ids: ['kette-amsel'] })).toEqual([
      'lesen.reihenfolge:kette-amsel',
    ])
    const t = reihenfolge.generate(ctx, {}, 'lesen.reihenfolge:kette-amsel', createRng(1))
    expect(t.instruction).toContain('Fang mit dem an')
  })

  it('jedes Thema hat Übungen', () => {
    const units = Object.fromEntries(THEMEN.map((t) => [`k1.sache.${t.id}`, true]))
    const all = { ...ctx, settings: { ...settings, units } }
    for (const t of THEMEN)
      expect(practiceEntries(all, 'sache', getExercise, `sache.${t.id}`).length).toBeGreaterThan(0)
  })
})

describe('HSU in der Statistik', () => {
  it('zeigt lesbare Namen', () => {
    const none = () => undefined
    expect(itemLabel('sache.hoeren-bild:apfel', none)).toBe('der Apfel')
    expect(itemLabel('sache.sortieren:jahreszeit:schlitten', none)).toBe('der Schlitten')
    expect(itemLabel('sache.paare:tiere:0', none)).toBe('Was gibt uns die Kuh?')
  })
})

describe('HSU Stufe 2', () => {
  it('Stimmt das? Daumen hoch oder runter, danach die Regel', () => {
    const rot = stimmtDas.generate(
      ctx,
      { thema: 'verkehr' },
      'sache.stimmt-das:verkehr:1',
      createRng(1),
    )
    expect(rot.instruction).toContain('Stimmt das?')
    expect(rot.data.correctKey).toBe('nein')
    expect(rot.afterword).toContain('stehen')
    expect(rot.data.choices.map((c) => c.key)).toEqual(['ja', 'nein'])
    for (const t of THEMEN)
      for (const key of stimmtDas.items(ctx, { thema: t.id })) {
        const d = stimmtDas.generate(ctx, { thema: t.id }, key, createRng(1)).data
        expect(['ja', 'nein']).toContain(d.correctKey)
      }
  })

  it('Müll trennen: nur die Tonnen, die es zu Hause gibt', () => {
    const alle = sortieren.items(ctx, { thema: 'muell' })
    expect(alle.length).toBe(12)
    const ohneBio = {
      ...ctx,
      settings: { ...settings, muelltonnen: ['papier', 'gelb', 'glas', 'rest'] },
    }
    const items = sortieren.items(ohneBio, { thema: 'muell' })
    expect(items).not.toContain('sache.sortieren:tonne:bananenschale')
    const t = sortieren.generate(
      ohneBio,
      { thema: 'muell' },
      'sache.sortieren:tonne:dose',
      createRng(1),
    )
    expect(t.data.choices.map((c) => c.key)).toEqual(['papier', 'gelb', 'glas', 'rest'])
    expect(t.data.correctKey).toBe('gelb')
    const eine = { ...ctx, settings: { ...settings, muelltonnen: ['rest'] } }
    expect(sortieren.items(eine, { thema: 'muell' })).toEqual([])
  })

  it('jedes Thema hat einen Forscherauftrag', () => {
    for (const t of THEMEN) expect(t.forscherauftrag.length).toBeGreaterThan(20)
  })
})
