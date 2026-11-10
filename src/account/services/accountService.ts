import { apiRequest } from '../../shared/services/httpClient'
import type { UpdateCurrentUserDto, UpdatedUserNameResponseDto } from '../types/AccountDtos'

/** Renames the signed-in user; the answer is the stored (trimmed) name. */
export function renameCurrentUser(dto: UpdateCurrentUserDto): Promise<UpdatedUserNameResponseDto> {
  return apiRequest<UpdatedUserNameResponseDto>('/api/Users/Me', { method: 'PUT', body: dto })
}
