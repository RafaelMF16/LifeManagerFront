import { describe, expect, it } from 'vitest'
import { dayHeatLevel } from './dayHeatLevel'

describe('dayHeatLevel', () => {
  it('is 0 when nothing was spent or the month has no expenses', () => {
    expect(dayHeatLevel(0, 640)).toBe(0)
    expect(dayHeatLevel(0, 0)).toBe(0)
    expect(dayHeatLevel(50, 0)).toBe(0)
  })

  it('splits the month into quarters of its biggest day', () => {
    expect(dayHeatLevel(1, 400)).toBe(1)
    expect(dayHeatLevel(100, 400)).toBe(1)
    expect(dayHeatLevel(100.01, 400)).toBe(2)
    expect(dayHeatLevel(200, 400)).toBe(2)
    expect(dayHeatLevel(300, 400)).toBe(3)
    expect(dayHeatLevel(300.01, 400)).toBe(4)
    expect(dayHeatLevel(400, 400)).toBe(4)
  })

  it('never goes past 4', () => {
    expect(dayHeatLevel(500, 400)).toBe(4)
  })
})
