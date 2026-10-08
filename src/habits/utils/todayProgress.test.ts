import { describe, expect, it } from 'vitest'
import type { WalletChangeDto } from '../types/HabitTodayDtos'
import { formatDayTitle, formatWalletChange, todayProgress, walletChangeHighlight } from './todayProgress'

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

describe('walletChangeHighlight', () => {
  it('announces a level up with the new level', () => {
    expect(walletChangeHighlight({ ...wallet, levelsGained: 1 }, translate)).toBe('habits:today.reward.levelUp:{"level":3}')
  })

  it('puts a knockout ahead of a level up', () => {
    expect(walletChangeHighlight({ ...wallet, levelsGained: 1, knockedOut: true, knockoutCoinsLost: 12 }, translate)).toBe(
      'habits:today.reward.knockedOut:{"count":12}',
    )
  })

  it('has nothing to add otherwise', () => {
    expect(walletChangeHighlight(wallet, translate)).toBeUndefined()
  })
})

describe('formatDayTitle', () => {
  it('names the day in the language, capitalized', () => {
    expect(formatDayTitle('2026-10-07', 'en-US')).toBe('Wednesday, October 7')
    expect(formatDayTitle('2026-10-07', 'pt-BR')).toBe('Quarta-feira, 7 de outubro')
  })
})
