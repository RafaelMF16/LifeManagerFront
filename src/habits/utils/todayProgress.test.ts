import { describe, expect, it } from 'vitest'
import type { HabitCheckInResultDto, WalletChangeDto } from '../types/HabitTodayDtos'
import { checkInHighlight, formatDayTitle, formatWalletChange, todayProgress } from './todayProgress'

function translate(key: string, options?: Record<string, unknown>) {
  return options ? `${key}:${JSON.stringify(options)}` : key
}

const wallet: WalletChangeDto = {
  profile: { level: 3, xpInLevel: 0, xpToNextLevel: 300, totalXp: 300, hp: 100, maxHp: 100, coins: 50, streakFreezes: 0, maxStreakFreezes: 2 },
  coinsDelta: 10,
  xpDelta: 20,
  hpDelta: 1,
  levelsGained: 0,
  knockedOut: false,
  knockoutCoinsLost: 0,
}

describe('todayProgress', () => {
  it('counts the done items', () => {
    expect(todayProgress([{ done: true }, { done: false }, { done: true }])).toEqual({ done: 2, total: 3, allDone: false })
  })

  it('is all done only when every item is', () => {
    expect(todayProgress([{ done: true }]).allDone).toBe(true)
    expect(todayProgress([]).allDone).toBe(false)
  })
})

describe('formatWalletChange', () => {
  it('lists what moved with its sign', () => {
    expect(formatWalletChange(wallet, translate)).toBe(
      'habits:today.reward.coins:{"count":10,"value":"+10"} · habits:today.reward.xp:{"value":"+20"} · habits:today.reward.hp:{"value":"+1"}',
    )
  })

  it('shows an undo as negative amounts and skips what did not move', () => {
    expect(formatWalletChange({ ...wallet, coinsDelta: -5, xpDelta: -10, hpDelta: 0 }, translate)).toBe(
      'habits:today.reward.coins:{"count":5,"value":"−5"} · habits:today.reward.xp:{"value":"−10"}',
    )
  })

  it('is empty when nothing moved', () => {
    expect(formatWalletChange({ ...wallet, coinsDelta: 0, xpDelta: 0, hpDelta: 0 }, translate)).toBe('')
  })
})

describe('checkInHighlight', () => {
  const result: HabitCheckInResultDto = {
    habitId: 1,
    date: '2026-10-07',
    done: true,
    currentStreak: 3,
    longestStreak: 3,
    wallet,
    milestoneDays: null,
    milestoneCoins: 0,
    freezesEarned: 0,
  }

  it('announces a level up with the new level', () => {
    expect(checkInHighlight({ ...result, wallet: { ...wallet, levelsGained: 1 } }, translate)).toBe('habits:today.reward.levelUp:{"level":3}')
  })

  it('announces a streak milestone with its coins', () => {
    expect(checkInHighlight({ ...result, milestoneDays: 7, milestoneCoins: 25 }, translate)).toBe(
      'habits:today.reward.milestone:{"days":7,"count":25}',
    )
  })

  it('announces a freeze earned', () => {
    expect(checkInHighlight({ ...result, freezesEarned: 1 }, translate)).toBe('habits:today.reward.freezeEarned:{"count":1}')
  })

  it('lists several moments most important first', () => {
    const everything = {
      ...result,
      wallet: { ...wallet, levelsGained: 1, knockedOut: true, knockoutCoinsLost: 12 },
      milestoneDays: 7,
      milestoneCoins: 25,
      freezesEarned: 1,
    }

    expect(checkInHighlight(everything, translate)).toBe(
      [
        'habits:today.reward.knockedOut:{"count":12}',
        'habits:today.reward.milestone:{"days":7,"count":25}',
        'habits:today.reward.levelUp:{"level":3}',
        'habits:today.reward.freezeEarned:{"count":1}',
      ].join(' · '),
    )
  })

  it('has nothing to add otherwise', () => {
    expect(checkInHighlight(result, translate)).toBeUndefined()
  })
})

describe('formatDayTitle', () => {
  it('names the day in the language, capitalized', () => {
    expect(formatDayTitle('2026-10-07', 'en-US')).toBe('Wednesday, October 7')
    expect(formatDayTitle('2026-10-07', 'pt-BR')).toBe('Quarta-feira, 7 de outubro')
  })
})
