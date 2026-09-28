import type { Theme } from '../hooks/useTheme'
import type { SupportedLanguage } from '../i18n/languages'

export interface UserPreferences {
  theme: Theme
  language: SupportedLanguage
}
