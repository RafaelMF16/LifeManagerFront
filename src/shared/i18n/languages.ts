export type SupportedLanguage = 'en-US' | 'pt-BR'

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en-US', 'pt-BR']
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en-US'
export const LANGUAGE_STORAGE_KEY = 'lm-language'

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
}

export function getInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isSupportedLanguage(stored)) return stored

  const browserLanguages = navigator.languages ?? [navigator.language]
  const hasPortuguese = browserLanguages.some((lang) => lang.toLowerCase().startsWith('pt'))
  return hasPortuguese ? 'pt-BR' : DEFAULT_LANGUAGE
}
