import { apiRequest } from '../../shared/services/httpClient'
import type { AccountHoldersDto } from '../types/AccountHolderDtos'

const ACCOUNT_HOLDERS_PATH = '/api/AccountHolders'

export function getAccountHolders(signal?: AbortSignal): Promise<AccountHoldersDto> {
  return apiRequest<AccountHoldersDto>(ACCOUNT_HOLDERS_PATH, { method: 'GET', signal })
}

/** Replaces the whole list (an empty one clears it); returns the saved, trimmed names. */
export function saveAccountHolders(names: string[]): Promise<AccountHoldersDto> {
  return apiRequest<AccountHoldersDto>(ACCOUNT_HOLDERS_PATH, { method: 'PUT', body: { names } })
}
