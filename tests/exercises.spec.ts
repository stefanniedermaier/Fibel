import { describe, expect, it } from 'vitest'
import { resolveDefaults } from '@/core/content'
import { numberWord } from '@/core/numbers'
import { createRng } from '@/core/random'
import { CHOICE_COUNT, mengen } from '@/exercises/rechnen/mengen'

const ctx = { land: 'DE-BY', grade: 1, settings: resolveDefaults('DE-BY', 1) }

describe('numberWord', () => {
  it.each([
    [0, 'null'],
    [1, 'eins'],
    [7, 'sieben'],
    [11, 'elf'],
    [16, 'sechzehn'],
    [17, 'siebzehn'],
    [20, 'zwanzig'],
    [21, 'einundzwanzig'],
    [37, 'siebenunddreißig'],
    [100, 'hundert'],
    [101, 'hunderteins'],
    [342, 'dreihundertzweiundvierzig'],
    [1000, 'tausend'],
  ])('%i → %s', (n, word) => {
    expect(numberWord(n)).toBe(word)
  })

  it('lehnt ungültige Zahlen ab', () => {
    expect(() => numberWord(-1)).toThrow()
    expect(() => numberWord(2.5)).toThrow()
  })
})

describe('R1 Mengen erkennen', () => {
  it('bietet die Mengen 1 bis max an', () => {
    expect(mengen.items(ctx, { max: 10 })).toHaveLength(10)
    expect(mengen.items(ctx, { max: 10 })[0]).toBe('rechnen.mengen:1')
  })

  it('erzeugt drei verschiedene, sortierte Auswahlzahlen inklusive der Lösung', () => {
    const rng = createRng(42)
    for (let n = 1; n <= 10; n++) {
      for (let run = 0; run < 20; run++) {
        const { data } = mengen.generate(ctx, { max: 10 }, `rechnen.mengen:${n}`, rng)
        expect(data.count).toBe(n)
        expect(data.choices).toHaveLength(CHOICE_COUNT)
        expect(new Set(data.choices).size).toBe(CHOICE_COUNT)
        expect(data.choices).toContain(n)
        expect([...data.choices].sort((a, b) => a - b)).toEqual(data.choices)
        expect(data.choices.every((c) => c >= 1 && c <= 10)).toBe(true)
        // Dice faces only exist for 1–6.
        if (data.layout === 'wuerfel') expect(n).toBeLessThanOrEqual(6)
      }
    }
  })

  it('spricht die Lösung als Zahlwort', () => {
    const rng = createRng(1)
    expect(mengen.generate(ctx, { max: 10 }, 'rechnen.mengen:1', rng).solution).toBe(
      'Das ist ein Punkt.',
    )
    expect(mengen.generate(ctx, { max: 10 }, 'rechnen.mengen:7', rng).solution).toBe(
      'Das sind sieben Punkte.',
    )
  })
})
