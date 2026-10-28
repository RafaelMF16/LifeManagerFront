import { describe, expect, it } from 'vitest'
import type { PlayerProfileDto } from '../types/PlayerProfileDtos'
import type { NewAchievementDto } from '../types/AchievementDtos'
import { achievementsKey, levelBaseline, pendingMoment } from './gameMoments'

const profile: PlayerProfileDto = {
  level: 3,
  xpInLevel: 10,
  xpToNextLevel: 300,
  totalXp: 310,
  hp: 100,
  maxHp: 100,
  coins: 40,
  streakFreezes: 0,
  maxStreakFreezes: 2,
  avatar: 'Cat',
  title: null,
  lastKnockout: null,
}

const knockout = { id: 12, occurredOn: '2026-10-06', coinsLost: 10 }

const unlocks: NewAchievementDto[] = [
  { code: 'CheckIns10', tier: 'Bronze', coinsBonus: 25, xpBonus: 50, unlockedAt: '2026-10-28T12:00:00Z' },
  { code: 'Streak7', tier: 'Bronze', coinsBonus: 25, xpBonus: 50, unlockedAt: '2026-10-28T12:00:00Z' },
]

describe('levelBaseline', () => {
  it('remembers the current level on a device that never saw one, without celebrating', () => {
    expect(levelBaseline(3, null)).toBe(3)
  })

  it('follows the level down after an undo', () => {
    expect(levelBaseline(2, 3)).toBe(2)
  })

  it('keeps the stored level otherwise', () => {
    expect(levelBaseline(3, 3)).toBeNull()
    expect(levelBaseline(4, 3)).toBeNull()
  })
})

describe('pendingMoment', () => {
  it('shows a knockout the player has not seen', () => {
    expect(pendingMoment({ ...profile, lastKnockout: knockout }, 11, 3)).toEqual({ kind: 'knockout', knockout })
    expect(pendingMoment({ ...profile, lastKnockout: knockout }, null, 3)).toEqual({ kind: 'knockout', knockout })
  })

  it('does not show a knockout already seen', () => {
    expect(pendingMoment({ ...profile, lastKnockout: knockout }, 12, 3)).toBeNull()
  })

  it('celebrates a level reached since the last one seen', () => {
    expect(pendingMoment({ ...profile, level: 4 }, null, 3)).toEqual({ kind: 'levelUp', level: 4 })
  })

  it('shows the knockout before the level up', () => {
    expect(pendingMoment({ ...profile, level: 4, lastKnockout: knockout }, null, 3)?.kind).toBe('knockout')
  })

  it('waits for a baseline before celebrating a level', () => {
    expect(pendingMoment({ ...profile, level: 4 }, null, null)).toBeNull()
  })

  it('has nothing new otherwise', () => {
    expect(pendingMoment(profile, null, 3)).toBeNull()
  })

  it('shows the unseen achievements, all in one moment', () => {
    expect(pendingMoment({ ...profile, newAchievements: unlocks }, null, 3)).toEqual({ kind: 'achievements', achievements: unlocks })
  })

  it('puts achievements after a knockout and before the level they paid for', () => {
    expect(pendingMoment({ ...profile, newAchievements: unlocks, lastKnockout: knockout }, null, 3)?.kind).toBe('knockout')
    expect(pendingMoment({ ...profile, level: 4, newAchievements: unlocks }, null, 3)?.kind).toBe('achievements')
  })

  it('skips the achievements the layout just closed, but not newer ones', () => {
    const closed = achievementsKey(unlocks)
    expect(pendingMoment({ ...profile, level: 4, newAchievements: unlocks }, null, 3, closed)).toEqual({ kind: 'levelUp', level: 4 })
    expect(pendingMoment({ ...profile, newAchievements: [unlocks[0]] }, null, 3, closed)?.kind).toBe('achievements')
  })

  it('has no achievements moment without new ones', () => {
    expect(pendingMoment({ ...profile, newAchievements: [] }, null, 3)).toBeNull()
  })
})
