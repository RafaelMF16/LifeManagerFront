import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../shared/services/httpClient'
import { getPlayerEvolution, getPlayerProfile, getPlayerStats, updateAppearance } from './playerProfileService'

vi.mock('../../shared/services/httpClient', () => ({ apiRequest: vi.fn().mockResolvedValue({}) }))

describe('playerProfileService', () => {
  beforeEach(() => vi.mocked(apiRequest).mockClear())

  it('reads the profile with the abort signal', async () => {
    const controller = new AbortController()
    await getPlayerProfile(controller.signal)
    expect(apiRequest).toHaveBeenCalledWith('/api/Habits/Profile', { method: 'GET', signal: controller.signal })
  })

  it('saves the appearance', async () => {
    await updateAppearance({ avatar: 'Rocket', title: 'CheckIns10' })
    expect(apiRequest).toHaveBeenCalledWith('/api/Habits/Profile/Appearance', {
      method: 'PUT',
      body: { avatar: 'Rocket', title: 'CheckIns10' },
    })
  })

  it('reads the lifetime stats', async () => {
    const controller = new AbortController()
    await getPlayerStats(controller.signal)
    expect(apiRequest).toHaveBeenCalledWith('/api/Habits/Profile/Stats', { method: 'GET', signal: controller.signal })
  })

  it('reads the evolution of the range asked for', async () => {
    const controller = new AbortController()
    await getPlayerEvolution('Year', controller.signal)
    expect(apiRequest).toHaveBeenCalledWith('/api/Habits/Profile/Evolution?range=Year', { method: 'GET', signal: controller.signal })
  })
})
