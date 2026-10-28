import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../shared/services/httpClient'
import { getAchievements, markAchievementsSeen } from './achievementService'

vi.mock('../../shared/services/httpClient', () => ({ apiRequest: vi.fn().mockResolvedValue({}) }))

describe('achievementService', () => {
  beforeEach(() => vi.mocked(apiRequest).mockClear())

  it('reads the achievements with the abort signal', async () => {
    const controller = new AbortController()
    await getAchievements(controller.signal)
    expect(apiRequest).toHaveBeenCalledWith('/api/Achievements', { method: 'GET', signal: controller.signal })
  })

  it('marks the unlocks as seen', async () => {
    await markAchievementsSeen()
    expect(apiRequest).toHaveBeenCalledWith('/api/Achievements/Seen', { method: 'POST' })
  })
})
