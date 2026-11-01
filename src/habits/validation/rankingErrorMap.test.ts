import { describe, expect, it } from 'vitest'
import { inviteErrorKey } from './rankingErrorMap'

describe('inviteErrorKey', () => {
  it('explains each refused invite', () => {
    expect(inviteErrorKey('RankingGroups.InviteNotFound')).toBe('habits:ranking.join.errors.notFound')
    expect(inviteErrorKey('RankingGroups.TooManyGroups')).toBe('habits:ranking.join.errors.tooManyGroups')
    expect(inviteErrorKey('RankingGroups.GroupFull')).toBe('habits:ranking.join.errors.full')
    expect(inviteErrorKey('RankingGroups.AlreadyMember')).toBe('habits:ranking.join.errors.alreadyMember')
    expect(inviteErrorKey('Auth.TooManyRequests')).toBe('habits:ranking.join.errors.tooManyRequests')
  })

  it('leaves other errors to the caller', () => {
    expect(inviteErrorKey('Something.Else')).toBeNull()
  })
})
