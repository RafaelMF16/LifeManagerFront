import { describe, expect, it } from 'vitest'
import { barRatio, niceMax } from './chartScale'

describe('niceMax', () => {
  it.each([
    [4317, 5000],
    [5000, 5000],
    [5001, 10000],
    [1800, 2000],
    [2100, 2500],
    [0.3, 0.5],
    [87, 100],
    [100, 100],
  ])('rounds %d up to %d', (value, expected) => {
    expect(niceMax(value)).toBeCloseTo(expected)
  })

  it.each([0, -10, Number.NaN])('gives 1 for %d', (value) => {
    expect(niceMax(value)).toBe(1)
  })
})

describe('barRatio', () => {
  it('is the share of the max, clamped to 0–1', () => {
    expect(barRatio(250, 1000)).toBe(0.25)
    expect(barRatio(-5, 1000)).toBe(0)
    expect(barRatio(2000, 1000)).toBe(1)
    expect(barRatio(10, 0)).toBe(0)
  })
})
