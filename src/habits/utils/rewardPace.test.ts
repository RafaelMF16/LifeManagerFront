import { describe, expect, it } from 'vitest'
import { DEFAULT_REWARD_ICON, rewardIcon } from './rewardIcons'
import { coinsMissing, daysOfHabits } from './rewardPace'

describe('daysOfHabits', () => {
  it('rounds the days up', () => {
    expect(daysOfHabits(50, 20)).toBe(3)
    expect(daysOfHabits(40, 20)).toBe(2)
  })

  it('is at least one day for a cheap reward', () => {
    expect(daysOfHabits(5, 40)).toBe(1)
  })

  it('has no estimate without recent earnings', () => {
    expect(daysOfHabits(50, 0)).toBeNull()
    expect(daysOfHabits(50, undefined)).toBeNull()
  })
})

describe('coinsMissing', () => {
  it('is what the balance still lacks', () => {
    expect(coinsMissing(50, 38)).toBe(12)
  })

  it('is 0 when the balance covers it or is unknown', () => {
    expect(coinsMissing(50, 50)).toBe(0)
    expect(coinsMissing(50, 80)).toBe(0)
    expect(coinsMissing(50, undefined)).toBe(0)
  })
})

describe('rewardIcon', () => {
  it('keeps a known icon and falls back to the default otherwise', () => {
    expect(rewardIcon('pizza')).toBe('pizza')
    expect(rewardIcon('rocket')).toBe(DEFAULT_REWARD_ICON)
    expect(rewardIcon(null)).toBe(DEFAULT_REWARD_ICON)
  })
})
