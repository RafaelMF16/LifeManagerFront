import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../shared/services/httpClient'
import {
  createChallenge,
  deleteChallenge,
  getChallengeHistory,
  getChallengeWeek,
  getWeeklySummary,
  markChallengesSeen,
  markWeeklySummarySeen,
  previewChallenge,
} from './challengeService'

vi.mock('../../shared/services/httpClient', () => ({ apiRequest: vi.fn().mockResolvedValue({}) }))

const request = { habitId: 7, type: 'Frequency', target: 5, week: 'Next' } as const

describe('challengeService', () => {
  beforeEach(() => vi.mocked(apiRequest).mockClear())

  it('reads a week and the history with the abort signal', async () => {
    const controller = new AbortController()
    await getChallengeWeek('Next', controller.signal)
    await getChallengeHistory(2, 10, controller.signal)
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/Habits/Challenges?week=Next', { method: 'GET', signal: controller.signal })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/Habits/Challenges/History?page=2&pageSize=10', {
      method: 'GET',
      signal: controller.signal,
    })
  })

  it('previews in the query string and creates in the body', async () => {
    await previewChallenge(request)
    await createChallenge(request)
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/Habits/Challenges/Preview?habitId=7&type=Frequency&target=5&week=Next', {
      method: 'GET',
      signal: undefined,
    })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/Habits/Challenges', { method: 'POST', body: request })
  })

  it('gives up a challenge and marks completions seen', async () => {
    await deleteChallenge(3)
    await markChallengesSeen([3, 4])
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/Habits/Challenges/3', { method: 'DELETE' })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/Habits/Challenges/Seen', { method: 'POST', body: { ids: [3, 4] } })
  })

  it('reads the weekly summary, null on a 204, and marks it seen', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined)
    expect(await getWeeklySummary()).toBeNull()
    await markWeeklySummarySeen('2026-11-02')
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/Habits/Challenges/Summary', { method: 'GET', signal: undefined })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/Habits/Challenges/Summary/Seen', {
      method: 'POST',
      body: { weekStart: '2026-11-02' },
    })
  })
})
