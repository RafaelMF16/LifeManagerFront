export type ThemeDto = 'Light' | 'Dark'

export type LanguageDto = 'PTBR' | 'EN'

export interface UserPreferencesDto {
  theme: ThemeDto
  language: LanguageDto
}
