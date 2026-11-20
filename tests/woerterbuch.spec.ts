import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { createRng } from '@/core/random'
import { WORTARTEN } from '@/core/types'
import { resolveWords } from '@/core/words'
import { anlaut } from '@/exercises/lesen/anlaut'
import { bildWort } from '@/exercises/lesen/bild-wort'
import { itemId } from '@/exercises/lesen/shared'
import { silbenKlatschen } from '@/exercises/lesen/silben-klatschen'
import { wortBild } from '@/exercises/lesen/wort-bild'
import { abcTastatur } from '@/exercises/schreiben/abc-tastatur'
import type { LearnerContext } from '@/exercises/types'

const defaults = resolveDefaults('DE-BY', 1)
const start: LearnerContext = { land: 'DE-BY', grade: 1, settings: defaults }
const all: LearnerContext = {
  land: 'DE-BY',
  grade: 1,
  settings: { ...defaults, letterFilter: false, levels: { 'lesen.woerter': 4 } },
}
const params = { wordGrade: 1 }
const words = resolveWords('DE-BY', 1)
const byId = new Map(words.map((w) => [w.id, w]))

describe('Größeres Wörterbuch (E1)', () => {
  it('hat mindestens 350 Wörter und alle fünf Wortarten', () => {
    expect(words.length).toBeGreaterThanOrEqual(350)
    for (const art of WORTARTEN) {
      expect(words.filter((w) => w.wortart === art).length, art).toBeGreaterThanOrEqual(20)
    }
  })

  it('gibt Bild-Übungen nur Wörter mit Bild', () => {
    for (const module of [wortBild, bildWort, anlaut]) {
      for (const key of module.items(all, params)) {
        expect(byId.get(itemId(key))?.image, key).toBeDefined()
      }
    }
  })

  it('hat mit den Start-Buchstaben für jede Bild-Übung genug Wörter', () => {
    expect(wortBild.items(start, params).length).toBeGreaterThanOrEqual(3)
    expect(bildWort.items(start, params).length).toBeGreaterThanOrEqual(3)
    expect(anlaut.items(start, params).length).toBeGreaterThanOrEqual(3)
  })

  it('lässt Wörter ohne Bild hören statt sehen', () => {
    const rng = createRng(1)
    const klatschen = silbenKlatschen.generate(all, params, 'lesen.silben-klatschen:malen', rng)
    expect(klatschen.data.image).toBeUndefined()
    expect(klatschen.data.spoken).toBe('malen')
    const abc = abcTastatur.generate(all, params, 'schreiben.abc-tastatur:mila', rng)
    expect(abc.data.image).toBeUndefined()
    expect(abc.data.autoCapitalize).toBe(true)
    const verb = abcTastatur.generate(all, params, 'schreiben.abc-tastatur:malen', rng)
    expect(verb.data.autoCapitalize).toBe(false)
  })

  it('markiert die lauttreuen Wörter des bayerischen Grundwortschatzes', () => {
    for (const id of ['malen', 'rot', 'ich', 'name', 'woche', 'oma']) {
      expect(byId.get(id)?.grundwortschatz, id).toBe(true)
    }
    expect(byId.get('mila')?.grundwortschatz).toBe(false)
  })
})
