import { describe, expect, it } from 'vitest'
import type { GameLedgerEntryDto } from '../types/LedgerDtos'
import { ledgerDeltas, ledgerIcon, ledgerTitle, signedValue } from './ledgerEntry'

const translate = (key: string) => key.replace('habits:history.kinds.', '').replace('habits:shop.items.names.', 'item:').replace('habits:achievements.names.', 'achievement:')

function entry(overrides: Partial<GameLedgerEntryDto>): GameLedgerEntryDto {
  return {
    id: 1,
    kind: 'HabitDone',
    occurredOn: '2026-10-07',
    createdAt: '2026-10-07T12:00:00Z',
    coinsDelta: 0,
    xpDelta: 0,
    hpDelta: 0,
    description: null,
    habitId: null,
    rewardId: null,
    itemKind: null,
    ...overrides,
  }
}

describe('ledgerTitle', () => {
  it('names the kind and what it was about', () => {
    expect(ledgerTitle(entry({ kind: 'HabitDone', description: 'Read', habitId: 3 }), translate)).toBe('HabitDone · Read')
  })

  it('names only the kind without a description', () => {
    expect(ledgerTitle(entry({ kind: 'LevelUp' }), translate)).toBe('LevelUp')
  })

  it('tells an undone redemption apart from an undone check-in', () => {
    expect(ledgerTitle(entry({ kind: 'Undo', rewardId: 2, description: 'Pizza' }), translate)).toBe('UndoRedemption · Pizza')
    expect(ledgerTitle(entry({ kind: 'Undo', habitId: 3, description: 'Read' }), translate)).toBe('Undo · Read')
  })

  it('names a bought item in the UI language, never from the description', () => {
    expect(ledgerTitle(entry({ kind: 'ItemPurchased', itemKind: 'HpPotion' }), translate)).toBe('ItemPurchased · item:HpPotion')
  })

  it('tells an undone item purchase apart from an undone habit day', () => {
    expect(ledgerTitle(entry({ kind: 'Undo', itemKind: 'StreakFreeze' }), translate)).toBe('UndoItemPurchase · item:StreakFreeze')
    expect(ledgerTitle(entry({ kind: 'Undo', habitId: 3, description: 'Read' }), translate)).toBe('Undo · Read')
  })

  it('reads an undone habit day as one even when the item is missing from the line', () => {
    const withoutItem = { ...entry({ kind: 'Undo', habitId: 3, description: 'Read' }), itemKind: undefined } as unknown as GameLedgerEntryDto
    expect(ledgerTitle(withoutItem, translate)).toBe('Undo · Read')
  })

  it('keeps a level-up caused by a purchase as a plain level-up', () => {
    expect(ledgerTitle(entry({ kind: 'LevelUp', itemKind: 'HpPotion' }), translate)).toBe('LevelUp')
  })

  it('names the achievement behind an unlock bonus, but not the level-up it caused', () => {
    expect(ledgerTitle(entry({ kind: 'AchievementUnlocked', achievementCode: 'CheckIns100' }), translate)).toBe('AchievementUnlocked · achievement:CheckIns100')
    expect(ledgerTitle(entry({ kind: 'LevelUp', achievementCode: 'CheckIns100' }), translate)).toBe('LevelUp')
  })
})

describe('ledgerDeltas', () => {
  it('lists coins, XP and HP that moved, in that order', () => {
    expect(ledgerDeltas(entry({ coinsDelta: 10, xpDelta: 20, hpDelta: 1 }))).toEqual([
      { kind: 'coins', value: 10 },
      { kind: 'xp', value: 20 },
      { kind: 'hp', value: 1 },
    ])
  })

  it('leaves out what did not move', () => {
    expect(ledgerDeltas(entry({ hpDelta: -8 }))).toEqual([{ kind: 'hp', value: -8 }])
  })
})

describe('signedValue', () => {
  it('signs both ways with a real minus', () => {
    expect(signedValue(10)).toBe('+10')
    expect(signedValue(-8)).toBe('−8')
  })
})

describe('ledgerIcon', () => {
  it('shows a trophy for an achievement', () => {
    expect(ledgerIcon(entry({ kind: 'AchievementUnlocked', achievementCode: 'Streak7' }))).toBe('trophy')
  })

  it('shows the bought item icon', () => {
    expect(ledgerIcon(entry({ kind: 'ItemPurchased', itemKind: 'StreakFreeze' }))).toBe('snowflake')
    expect(ledgerIcon(entry({ kind: 'Undo', itemKind: 'HpPotion' }))).toBe('undo-2')
  })
})
