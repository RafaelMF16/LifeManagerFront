import { apiDownload, apiRequest } from '../../shared/services/httpClient'
import { fileNameFromContentDisposition, saveBlob } from '../../shared/utils/downloadBlob'
import { exportFallbackFileName } from '../utils/exportFileName'
import type {
  AccountDeletionResponseDto,
  ChangePasswordDto,
  RequestAccountDeletionDto,
  UpdateCurrentUserDto,
  UpdatedUserNameResponseDto,
} from '../types/AccountDtos'

/** Renames the signed-in user; the answer is the stored (trimmed) name. */
export function renameCurrentUser(dto: UpdateCurrentUserDto): Promise<UpdatedUserNameResponseDto> {
  return apiRequest<UpdatedUserNameResponseDto>('/api/Users/Me', { method: 'PUT', body: dto })
}

/** Changes the password and ends every other session; this one (the cookie's) stays signed in. */
export function changePassword(dto: ChangePasswordDto): Promise<void> {
  return apiRequest<void>('/api/Auth/ChangePassword', { method: 'POST', body: dto })
}

/** Downloads every piece of the user's data as one JSON file, named by the backend (`lifemanager-yyyy-MM-dd.json`). */
export async function downloadAccountData(signal?: AbortSignal): Promise<void> {
  const { blob, contentDisposition } = await apiDownload('/api/Users/Me/Export', signal)
  saveBlob(blob, fileNameFromContentDisposition(contentDisposition, exportFallbackFileName(new Date())))
}

/** Schedules the account's deletion (7 days of grace) and ends every session; the caller ends this tab's. */
export function requestAccountDeletion(dto: RequestAccountDeletionDto): Promise<AccountDeletionResponseDto> {
  return apiRequest<AccountDeletionResponseDto>('/api/Users/Me/Deletion', { method: 'POST', body: dto })
}
