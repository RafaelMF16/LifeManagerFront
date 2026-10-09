import { describe, expect, it } from 'vitest'
import type { GameLedgerEntryDto } from '../types/LedgerDtos'
import { ledgerDeltas, ledgerTitle, signedValue } from './ledgerEntry'

const translate = (key: string) => key.replace('habits:history.kinds.', '')

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
