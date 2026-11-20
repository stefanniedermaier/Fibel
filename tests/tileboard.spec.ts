import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TileBoard from '@/components/TileBoard.vue'

const tiles = [
  { id: 'a', text: 'se' },
  { id: 'b', text: 'ro' },
]
const board = () =>
  mount(TileBoard, {
    props: { tiles, target: ['ro', 'se'], revealed: false, locked: false, capitalizeFirst: true },
    attachTo: document.body,
  })

const slots = (w: ReturnType<typeof board>) => w.findAll('.slot')
const tile = (w: ReturnType<typeof board>, text: string) =>
  w.findAll('.tile').find((t) => t.text() === text)!

/** A tap without movement. */
async function tap(el: { trigger: (e: string, o?: object) => Promise<void> }) {
  await el.trigger('pointerdown', { button: 0, clientX: 10, clientY: 10, pointerId: 1 })
  await el.trigger('pointerup', { clientX: 10, clientY: 10, pointerId: 1 })
}

/** Drag from an element and drop where elementFromPoint says (mocked). */
async function dragTo(
  el: { trigger: (e: string, o?: object) => Promise<void> },
  target: Element | null,
) {
  document.elementFromPoint = vi.fn(() => target)
  await el.trigger('pointerdown', { button: 0, clientX: 10, clientY: 10, pointerId: 1 })
  await el.trigger('pointermove', { clientX: 60, clientY: 80, pointerId: 1 })
  await el.trigger('pointerup', { clientX: 60, clientY: 80, pointerId: 1 })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('TileBoard: Wort legen', () => {
  it('legt beim Antippen die Kachel ins nächste freie Feld', async () => {
    const w = board()
    await tap(tile(w, 'ro'))
    expect(slots(w)[0]!.text()).toBe('Ro')
    await tap(tile(w, 'se'))
    expect(w.emitted('answer')).toEqual([[true]])
  })

  it('legt eine gezogene Kachel genau in das Feld, auf dem sie losgelassen wird', async () => {
    const w = board()
    await dragTo(tile(w, 'se'), slots(w)[1]!.element)
    expect(slots(w)[0]!.text()).toBe('')
    expect(slots(w)[1]!.text()).toBe('se')
    expect(w.emitted('answer')).toBeUndefined()
    await dragTo(tile(w, 'ro'), slots(w)[0]!.element)
    expect(w.emitted('answer')).toEqual([[true]])
  })

  it('tauscht zwei gelegte Kacheln und gibt beim Herausziehen zurück', async () => {
    const w = board()
    await dragTo(tile(w, 'ro'), slots(w)[1]!.element)
    // Drag the placed "ro" from slot 1 to slot 0.
    await dragTo(slots(w)[1]!, slots(w)[0]!.element)
    expect(slots(w)[0]!.text()).toBe('Ro')
    expect(slots(w)[1]!.text()).toBe('')
    // Drag it out of the slots: back to the tiles.
    await dragTo(slots(w)[0]!, document.body)
    expect(slots(w)[0]!.text()).toBe('')
    expect(w.findAll('.tile')).toHaveLength(2)
  })

  it('meldet eine falsche Reihenfolge und leert die Felder wieder', async () => {
    vi.useFakeTimers()
    const w = board()
    await tap(tile(w, 'se'))
    await tap(tile(w, 'ro'))
    expect(w.emitted('answer')).toEqual([[false]])
    vi.advanceTimersByTime(800)
    await w.vm.$nextTick()
    expect(slots(w).every((s) => s.text() === '')).toBe(true)
    vi.useRealTimers()
  })

  it('lässt sich mit der Tastatur bedienen', async () => {
    const w = board()
    await tile(w, 'ro').trigger('click', { detail: 0 })
    expect(slots(w)[0]!.text()).toBe('Ro')
    await slots(w)[0]!.trigger('click', { detail: 0 })
    expect(slots(w)[0]!.text()).toBe('')
  })
})
