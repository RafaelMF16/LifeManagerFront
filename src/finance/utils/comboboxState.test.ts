import { describe, expect, it } from 'vitest'
import { comboboxReducer, initialComboboxState } from './comboboxState'
import type { ComboboxState } from './comboboxState'

const closed = initialComboboxState('Mercado')

function open(overrides: Partial<ComboboxState> = {}): ComboboxState {
  return { ...comboboxReducer(closed, { type: 'open' }), ...overrides }
}

describe('comboboxReducer', () => {
  it('starts closed showing the current value', () => {
    expect(closed).toEqual({ isOpen: false, text: 'Mercado', query: '', activeIndex: -1 })
    expect(initialComboboxState(null).text).toBe('')
  })

  it('opens without a search and without an active option', () => {
    const state = comboboxReducer(closed, { type: 'open' })

    expect(state).toEqual({ isOpen: true, text: 'Mercado', query: '', activeIndex: -1 })
  })

  it('searches what is typed, opening the list', () => {
    const state = comboboxReducer(closed, { type: 'type', text: 'mer' })

    expect(state).toEqual({ isOpen: true, text: 'mer', query: 'mer', activeIndex: -1 })
  })

  it('makes the first result active once a typed search answers', () => {
    const typed = comboboxReducer(closed, { type: 'type', text: 'mer' })

    expect(comboboxReducer(typed, { type: 'results', count: 3 }).activeIndex).toBe(0)
    expect(comboboxReducer(typed, { type: 'results', count: 0 }).activeIndex).toBe(-1)
  })

  it('keeps no active option when the list opens without typing', () => {
    expect(comboboxReducer(open(), { type: 'results', count: 5 }).activeIndex).toBe(-1)
  })

  it('keeps the active option inside fewer results', () => {
    expect(comboboxReducer(open({ activeIndex: 4 }), { type: 'results', count: 2 }).activeIndex).toBe(1)
    expect(comboboxReducer(open({ activeIndex: 1 }), { type: 'results', count: 6 }).activeIndex).toBe(1)
  })

  it('moves down and up inside the options, stopping at the ends', () => {
    const first = comboboxReducer(open(), { type: 'move', delta: 1, count: 3 })
    expect(first.activeIndex).toBe(0)

    const last = comboboxReducer(open({ activeIndex: 2 }), { type: 'move', delta: 1, count: 3 })
    expect(last.activeIndex).toBe(2)

    const up = comboboxReducer(open({ activeIndex: 2 }), { type: 'move', delta: -1, count: 3 })
    expect(up.activeIndex).toBe(1)

    const top = comboboxReducer(open({ activeIndex: 0 }), { type: 'move', delta: -1, count: 3 })
    expect(top.activeIndex).toBe(0)
  })

  it('opens on an arrow key, with the first or last option active', () => {
    expect(comboboxReducer(closed, { type: 'move', delta: 1, count: 3 })).toMatchObject({ isOpen: true, activeIndex: 0 })
    expect(comboboxReducer(closed, { type: 'move', delta: -1, count: 3 })).toMatchObject({ isOpen: true, activeIndex: 2 })
  })

  it('does nothing on an arrow key without options', () => {
    expect(comboboxReducer(open(), { type: 'move', delta: 1, count: 0 }).activeIndex).toBe(-1)
  })

  it('closes on a choice, showing the chosen name', () => {
    const typed = comboboxReducer(closed, { type: 'type', text: 'far' })

    expect(comboboxReducer(typed, { type: 'select', text: 'Farmácia' })).toEqual(initialComboboxState('Farmácia'))
  })

  it('reverts to the current value on Escape, so loose text never becomes a category', () => {
    const typed = comboboxReducer(closed, { type: 'type', text: 'qualquer coisa' })

    expect(comboboxReducer(typed, { type: 'revert', text: 'Mercado' })).toEqual(closed)
  })

  it('reverts the same way when focus leaves without a choice', () => {
    const typed = comboboxReducer(open({ activeIndex: 1 }), { type: 'type', text: 'sa' })

    expect(comboboxReducer(typed, { type: 'revert', text: '' })).toEqual(initialComboboxState(null))
  })

  it('follows a value changed from outside while closed, but not while the user is typing', () => {
    expect(comboboxReducer(closed, { type: 'sync', text: 'Saúde' }).text).toBe('Saúde')

    const typed = comboboxReducer(closed, { type: 'type', text: 'sa' })
    expect(comboboxReducer(typed, { type: 'sync', text: 'Saúde' })).toBe(typed)
  })
})
