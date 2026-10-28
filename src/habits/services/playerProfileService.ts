import { apiRequest } from '../../shared/services/httpClient'
import type {
  EvolutionRange,
  PlayerEvolutionDto,
  PlayerProfileDto,
  PlayerStatsDto,
  UpdateAppearanceRequestDto,
} from '../types/PlayerProfileDtos'

const PROFILE_PATH = '/api/Habits/Profile'

export function getPlayerProfile(signal?: AbortSignal): Promise<PlayerProfileDto> {
  return apiRequest<PlayerProfileDto>(PROFILE_PATH, { method: 'GET', signal })
}

/** Picks the avatar and the title; a locked title is refused (`PlayerProfile.TitleLocked`). */
export function updateAppearance(request: UpdateAppearanceRequestDto): Promise<PlayerProfileDto> {
  return apiRequest<PlayerProfileDto>(`${PROFILE_PATH}/Appearance`, { method: 'PUT', body: request })
}

export function getPlayerStats(signal?: AbortSignal): Promise<PlayerStatsDto> {
  return apiRequest<PlayerStatsDto>(`${PROFILE_PATH}/Stats`, { method: 'GET', signal })
}

export function getPlayerEvolution(range: EvolutionRange, signal?: AbortSignal): Promise<PlayerEvolutionDto> {
  return apiRequest<PlayerEvolutionDto>(`${PROFILE_PATH}/Evolution?range=${range}`, { method: 'GET', signal })
}
