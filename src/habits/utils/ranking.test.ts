import { describe, expect, it } from 'vitest'
import { addWeeks, canReactTo, currentWeekStart, formatWeekRange, patchReactions, weekEndOf, inviteLink, medal, parseInviteCode, reactionCount, withMyReaction } from './ranking'

describe('parseInviteCode', () => {
  it('accepts a bare code in any case, with spaces or dashes', () => {
    expect(parseInviteCode('abcd-efgh')).toBe('ABCDEFGH')
    expect(parseInviteCode(' C2T9 JPEM ')).toBe('C2T9JPEM')
  })

  it('takes the code out of a pasted invite link', () => {
    expect(parseInviteCode('https://lifemanager.app/invite/c2t9jpem?x=1')).toBe('C2T9JPEM')
  })

  it('refuses what can never be a code', () => {
    expect(parseInviteCode('ABC')).toBeNull()
    expect(parseInviteCode('ABCDEFGHJ')).toBeNull()
    // I, L, O, 0 and 1 are left out of the alphabet.
    expect(parseInviteCode('ABCDEFG0')).toBeNull()
    expect(parseInviteCode('ABCDEFGI')).toBeNull()
  })
})

describe('inviteLink', () => {
  it('builds the link from the origin', () => {
    expect(inviteLink('ABCDEFGH', 'https://app.test')).toBe('https://app.test/invite/ABCDEFGH')
  })
})

describe('addWeeks', () => {
  it('moves by whole weeks across months and years', () => {
    expect(addWeeks('2026-11-02', -1)).toBe('2026-10-26')
    expect(addWeeks('2026-12-28', 1)).toBe('2027-01-04')
  })

  it('finds the Sunday across a month', () => {
    expect(weekEndOf('2026-10-26')).toBe('2026-11-01')
  })
})

describe('formatWeekRange', () => {
  it('formats the week without shifting days', () => {
    // Intl puts thin spaces around the dash.
    expect(formatWeekRange('2026-11-02', '2026-11-08', 'en-US').replace(/\s/g, ' ')).toBe('Nov 2 – 8')
  })
})

describe('medal', () => {
  it('only gives medals to the podium', () => {
    expect([1, 2, 3, 4].map(medal)).toEqual(['🥇', '🥈', '🥉', null])
  })
})

describe('withMyReaction', () => {
  const none = { clap: 2, fire: 1, mine: null }

  it('adds my reaction', () => {
    expect(withMyReaction(none, 'Clap')).toEqual({ clap: 3, fire: 1, mine: 'Clap' })
  })

  it('switches my reaction', () => {
    expect(withMyReaction({ clap: 3, fire: 1, mine: 'Clap' }, 'Fire')).toEqual({ clap: 2, fire: 2, mine: 'Fire' })
  })

  it('removes my reaction', () => {
    expect(withMyReaction({ clap: 3, fire: 1, mine: 'Clap' }, null)).toEqual(none)
  })

  it('counts every reaction', () => {
    expect(reactionCount(none)).toBe(3)
  })
})

describe('currentWeekStart', () => {
  it('is the Monday of the week, Sunday included', () => {
    expect(currentWeekStart(new Date(2026, 10, 4))).toBe('2026-11-02')
    expect(currentWeekStart(new Date(2026, 10, 8))).toBe('2026-11-02')
    expect(currentWeekStart(new Date(2026, 10, 9))).toBe('2026-11-09')
  })

  it('opens reactions on this week and the last one only', () => {
    const today = new Date(2026, 10, 4)
    expect(canReactTo('2026-11-02', today)).toBe(true)
    expect(canReactTo('2026-10-26', today)).toBe(true)
    expect(canReactTo('2026-10-19', today)).toBe(false)
  })
})

describe('patchReactions', () => {
  const reactions = { clap: 0, fire: 0, mine: null }
  const entry = (memberId: number) => ({
    memberId,
    name: `M${memberId}`,
    avatar: 'Cat' as const,
    title: null,
    points: 0,
    perfectDays: 0,
    keptDays: 0,
    position: 1,
    isMe: false,
    eligible: true,
    leftGroup: false,
    reactions,
    reactedBy: null,
  })
  const ranking = {
    weekStart: '2026-11-02',
    weekEnd: '2026-11-08',
    status: 'Open' as const,
    countsForAchievements: false,
    firstWeekStart: '2026-10-26',
    entries: [entry(1), entry(2)],
    me: { position: 1, points: 0, gapToNext: null, nextName: null, days: [] },
    overtakenBy: [],
    previous: { weekStart: '2026-10-26', status: 'Final' as const, podium: [entry(2)], myPosition: 1, myPoints: 0 },
  }
  const fire = { clap: 0, fire: 1, mine: 'Fire' as const }

  it('patches the member in the week it belongs to', () => {
    const patched = patchReactions(ranking, '2026-11-02', 2, fire)
    expect(patched.entries[1].reactions).toEqual(fire)
    expect(patched.entries[0].reactions).toEqual(reactions)
    expect(patched.previous?.podium[0].reactions).toEqual(reactions)
  })

  it("patches last week's podium", () => {
    const patched = patchReactions(ranking, '2026-10-26', 2, fire)
    expect(patched.previous?.podium[0].reactions).toEqual(fire)
    expect(patched.entries[1].reactions).toEqual(reactions)
  })
})
