import { apiRequest } from '../../shared/services/httpClient'
import type { AchievementCode, AchievementsResponseDto } from '../types/AchievementDtos'

const ACHIEVEMENTS_PATH = '/api/Achievements'

/** Unlocks what the player's history reaches, then lists every achievement with the progress. */
export function getAchievements(signal?: AbortSignal): Promise<AchievementsResponseDto> {
  return apiRequest<AchievementsResponseDto>(ACHIEVEMENTS_PATH, { method: 'GET', signal })
}

/**
 * Marks the unlocks the moment showed as seen, so it doesn't come back on any device. Only those: one that came in
 * meanwhile (from another tab) still gets its moment.
 */
export function markAchievementsSeen(codes: AchievementCode[]): Promise<void> {
  return apiRequest<void>(`${ACHIEVEMENTS_PATH}/Seen`, { method: 'POST', body: { codes } })
}
