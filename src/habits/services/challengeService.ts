import { apiRequest } from '../../shared/services/httpClient'
import type {
  ChallengeDto,
  ChallengeHistoryDto,
  ChallengePreviewDto,
  ChallengeWeek,
  ChallengeWeekDto,
  CreateChallengeRequestDto,
  WeeklySummaryDto,
} from '../types/ChallengeDtos'

const CHALLENGES_PATH = '/api/Habits/Challenges'

/** The week's challenges with their progress, the suggestions and the habits that can still take one. Settles them first. */
export function getChallengeWeek(week: ChallengeWeek, signal?: AbortSignal): Promise<ChallengeWeekDto> {
  return apiRequest<ChallengeWeekDto>(`${CHALLENGES_PATH}?week=${week}`, { method: 'GET', signal })
}

/** The effort and reward a challenge would have, without creating it. */
export function previewChallenge(request: CreateChallengeRequestDto, signal?: AbortSignal): Promise<ChallengePreviewDto> {
  const query = new URLSearchParams({
    habitId: String(request.habitId),
    type: request.type,
    target: String(request.target),
    week: request.week,
  })
  return apiRequest<ChallengePreviewDto>(`${CHALLENGES_PATH}/Preview?${query}`, { method: 'GET', signal })
}

export function createChallenge(request: CreateChallengeRequestDto): Promise<ChallengeDto> {
  return apiRequest<ChallengeDto>(CHALLENGES_PATH, { method: 'POST', body: request })
}

/** Gives up an active challenge: it pays nothing and counts for nothing. */
export function deleteChallenge(id: number): Promise<void> {
  return apiRequest<void>(`${CHALLENGES_PATH}/${id}`, { method: 'DELETE' })
}

/** The weeks before the current one, newest first. */
export function getChallengeHistory(page: number, pageSize: number, signal?: AbortSignal): Promise<ChallengeHistoryDto> {
  return apiRequest<ChallengeHistoryDto>(`${CHALLENGES_PATH}/History?page=${page}&pageSize=${pageSize}`, { method: 'GET', signal })
}

/** Marks the completions the moment celebrated, so it doesn't come back on any device. */
export function markChallengesSeen(ids: number[]): Promise<void> {
  return apiRequest<void>(`${CHALLENGES_PATH}/Seen`, { method: 'POST', body: { ids } })
}

/** Last week's summary; null when it was already seen or the player didn't play that week (the API answers 204). */
export async function getWeeklySummary(signal?: AbortSignal): Promise<WeeklySummaryDto | null> {
  return (await apiRequest<WeeklySummaryDto | undefined>(`${CHALLENGES_PATH}/Summary`, { method: 'GET', signal })) ?? null
}

/** Marks the summary of the week starting on `weekStart` as seen, on every device. */
export function markWeeklySummarySeen(weekStart: string): Promise<void> {
  return apiRequest<void>(`${CHALLENGES_PATH}/Summary/Seen`, { method: 'POST', body: { weekStart } })
}
