import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../shared/services/httpClient'
import {
  createRankingGroup,
  getGroupRanking,
  getRankingGroups,
  joinInvite,
  leaveRankingGroup,
  previewInvite,
  regenerateInviteCode,
  removeRankingMember,
  removeRankingReaction,
  renameRankingGroup,
  setRankingReaction,
} from './rankingService'

vi.mock('../../shared/services/httpClient', () => ({ apiRequest: vi.fn().mockResolvedValue({}) }))

describe('rankingService', () => {
  beforeEach(() => vi.mocked(apiRequest).mockClear())

  it('lists the groups with the abort signal', async () => {
    const controller = new AbortController()
    await getRankingGroups(controller.signal)
    expect(apiRequest).toHaveBeenCalledWith('/api/RankingGroups', { method: 'GET', signal: controller.signal })
  })

  it('creates, renames and renews the code of a group', async () => {
    await createRankingGroup({ name: 'Família' })
    await renameRankingGroup(3, { name: 'Amigos' })
    await regenerateInviteCode(3)
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/RankingGroups', { method: 'POST', body: { name: 'Família' } })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/RankingGroups/3', { method: 'PUT', body: { name: 'Amigos' } })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/api/RankingGroups/3/InviteCode', { method: 'POST' })
  })

  it('leaves and removes members', async () => {
    await leaveRankingGroup(3)
    await removeRankingMember(3, 9)
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/RankingGroups/3/Leave', { method: 'POST' })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/RankingGroups/3/Members/9', { method: 'DELETE' })
  })

  it('previews and joins by an encoded invite code', async () => {
    await previewInvite('AB CD')
    await joinInvite('ABCDEFGH')
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/RankingGroups/Invites/AB%20CD', { method: 'GET', signal: undefined })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/RankingGroups/Invites/ABCDEFGH/Join', { method: 'POST' })
  })

  it('reads the ranking of the current week or a given one', async () => {
    await getGroupRanking(3, null)
    await getGroupRanking(3, '2026-11-02')
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/RankingGroups/3/Ranking', { method: 'GET', signal: undefined })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/RankingGroups/3/Ranking?weekStart=2026-11-02', { method: 'GET', signal: undefined })
  })

  it('sets and removes a reaction', async () => {
    await setRankingReaction(3, 9, '2026-11-02', 'Fire')
    await removeRankingReaction(3, 9, '2026-11-02')
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/RankingGroups/3/Members/9/Reaction', {
      method: 'PUT',
      body: { weekStart: '2026-11-02', kind: 'Fire' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/RankingGroups/3/Members/9/Reaction?weekStart=2026-11-02', { method: 'DELETE' })
  })
})
