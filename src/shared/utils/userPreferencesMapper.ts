import type { Theme } from '../hooks/useTheme'
import type { SupportedLanguage } from '../i18n/languages'
import type { UserPreferences } from '../types/UserPreferences'
import type { LanguageDto, ThemeDto, UserPreferencesDto } from '../types/UserPreferencesDtos'

const THEME_TO_DTO: Record<Theme, ThemeDto> = { light: 'Light', dark: 'Dark' }
const THEME_FROM_DTO: Record<ThemeDto, Theme> = { Light: 'light', Dark: 'dark' }
const LANGUAGE_TO_DTO: Record<SupportedLanguage, LanguageDto> = { 'pt-BR': 'PTBR', 'en-US': 'EN' }
const LANGUAGE_FROM_DTO: Record<LanguageDto, SupportedLanguage> = { PTBR: 'pt-BR', EN: 'en-US' }

export function toUserPreferencesDto(preferences: UserPreferences): UserPreferencesDto {
  return { theme: THEME_TO_DTO[preferences.theme], language: LANGUAGE_TO_DTO[preferences.language] }
}

export function fromUserPreferencesDto(dto: UserPreferencesDto): UserPreferences {
  return { theme: THEME_FROM_DTO[dto.theme], language: LANGUAGE_FROM_DTO[dto.language] }
}
