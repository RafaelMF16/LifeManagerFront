import { applyLanguage } from '../hooks/useLanguage'
import { applyTheme } from '../hooks/useTheme'
import type { UserPreferences } from '../types/UserPreferences'
import type { UserPreferencesDto } from '../types/UserPreferencesDtos'
import { fromUserPreferencesDto, toUserPreferencesDto } from '../utils/userPreferencesMapper'
import { apiRequest } from './httpClient'

export async function getUserPreferences(): Promise<UserPreferences> {
  const response = await apiRequest<UserPreferencesDto>('/api/UserPreferences', { method: 'GET' })
  return fromUserPreferencesDto(response)
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  await apiRequest<UserPreferencesDto>('/api/UserPreferences', {
    method: 'PUT',
    body: toUserPreferencesDto(preferences),
  })
}

export async function loadAndApplyUserPreferences(): Promise<void> {
  const preferences = await getUserPreferences()
  applyTheme(preferences.theme)
  applyLanguage(preferences.language)
}
