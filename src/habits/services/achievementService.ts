import { apiRequest } from '../../shared/services/httpClient'
import type { AchievementsResponseDto } from '../types/AchievementDtos'

const ACHIEVEMENTS_PATH = '/api/Achievements'

/** Unlocks what the player's history reaches, then lists every achievement with the progress. */
export function getAchievements(signal?: AbortSignal): Promise<AchievementsResponseDto> {
  return apiRequest<AchievementsResponseDto>(ACHIEVEMENTS_PATH, { method: 'GET', signal })
}

/** Marks every unlock the player was shown as seen, so the moment doesn't come back on any device. */
export function markAchievementsSeen(): Promise<void> {
  return apiRequest<void>(`${ACHIEVEMENTS_PATH}/Seen`, { method: 'POST' })
}
