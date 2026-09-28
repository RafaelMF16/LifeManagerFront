import { useEffect, useState } from 'react'
import i18n from '../../i18n/i18n'
import { LANGUAGE_STORAGE_KEY, type SupportedLanguage } from '../i18n/languages'

export function applyLanguage(language: SupportedLanguage) {
  document.documentElement.setAttribute('lang', language)
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  if (i18n.language !== language) {
    void i18n.changeLanguage(language)
  }
}

export function useLanguage() {
  const [language, setLanguage] = useState<SupportedLanguage>(() => i18n.language as SupportedLanguage)

  useEffect(() => {
    applyLanguage(language)
  }, [language])

  return { language, setLanguage }
}
