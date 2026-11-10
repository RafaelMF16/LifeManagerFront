import { apiRequest } from '../../shared/services/httpClient'
import type { ChangePasswordDto, UpdateCurrentUserDto, UpdatedUserNameResponseDto } from '../types/AccountDtos'

/** Renames the signed-in user; the answer is the stored (trimmed) name. */
export function renameCurrentUser(dto: UpdateCurrentUserDto): Promise<UpdatedUserNameResponseDto> {
  return apiRequest<UpdatedUserNameResponseDto>('/api/Users/Me', { method: 'PUT', body: dto })
}

/** Changes the password and ends every other session; this one (the cookie's) stays signed in. */
export function changePassword(dto: ChangePasswordDto): Promise<void> {
  return apiRequest<void>('/api/Auth/ChangePassword', { method: 'POST', body: dto })
}
