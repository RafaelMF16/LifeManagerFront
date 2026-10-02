import type { CurrentUserDto } from '../types/CurrentUserDtos'
import { apiRequest } from './httpClient'

export function getCurrentUser(signal?: AbortSignal): Promise<CurrentUserDto> {
  return apiRequest<CurrentUserDto>('/api/Users/Me', { method: 'GET', signal })
}
