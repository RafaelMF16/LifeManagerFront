import { describe, expect, it } from 'vitest'
import { progressRatio } from './playerProgress'

describe('progressRatio', () => {
  it.each([
    [0, 100, 0],
    [72, 100, 0.72],
    [100, 100, 1],
    [40, 300, 40 / 300],
  ])('reads %d of %d as %d', (value, max, expected) => {
    expect(progressRatio(value, max)).toBeCloseTo(expected)
  })

  it('clamps values outside the bar', () => {
    expect(progressRatio(-5, 100)).toBe(0)
    expect(progressRatio(150, 100)).toBe(1)
  })

  it('reads a bar with no maximum as empty', () => {
    expect(progressRatio(10, 0)).toBe(0)
    expect(progressRatio(10, -1)).toBe(0)
    expect(progressRatio(Number.NaN, 100)).toBe(0)
  })
})
