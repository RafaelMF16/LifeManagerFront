import { apiRequest } from '../../shared/services/httpClient'
import type { PlayerProfileDto } from '../types/PlayerProfileDtos'

const PROFILE_PATH = '/api/Habits/Profile'

export function getPlayerProfile(signal?: AbortSignal): Promise<PlayerProfileDto> {
  return apiRequest<PlayerProfileDto>(PROFILE_PATH, { method: 'GET', signal })
}
