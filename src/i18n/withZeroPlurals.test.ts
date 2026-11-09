import { describe, expect, it } from 'vitest'
import { withZeroPlurals } from './withZeroPlurals'

describe('withZeroPlurals', () => {
  it('adds a _zero key with the _other text', () => {
    expect(withZeroPlurals({ days_one: '{{count}} dia', days_other: '{{count}} dias' })).toEqual({
      days_one: '{{count}} dia',
      days_other: '{{count}} dias',
      days_zero: '{{count}} dias',
    })
  })

  it('keeps a _zero key that already exists', () => {
    const result = withZeroPlurals({ items_zero: 'Nada', items_one: '{{count}} item', items_other: '{{count}} itens' })

    expect(result.items_zero).toBe('Nada')
  })

  it('walks nested objects', () => {
    const result = withZeroPlurals({ summary: { streak: { weeks_one: '1 semana', weeks_other: '{{count}} semanas' } } })

    expect(result).toEqual({
      summary: { streak: { weeks_one: '1 semana', weeks_other: '{{count}} semanas', weeks_zero: '{{count}} semanas' } },
    })
  })

  it('ignores a _one key with no _other', () => {
    expect(withZeroPlurals({ lonely_one: 'só um' })).toEqual({ lonely_one: 'só um' })
  })

  it('leaves keys that are not plurals alone', () => {
    expect(withZeroPlurals({ title: 'Hoje', other: 'Outro' })).toEqual({ title: 'Hoje', other: 'Outro' })
  })

  it('does not mutate the input', () => {
    const input = { nested: { days_one: '1 dia', days_other: '{{count}} dias' } }
    const snapshot = structuredClone(input)

    withZeroPlurals(input)

    expect(input).toEqual(snapshot)
  })
})
