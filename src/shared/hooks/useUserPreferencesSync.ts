import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getAccessToken } from '../services/tokenStorage'
import { saveUserPreferences } from '../services/userPreferencesService'
import type { SupportedLanguage } from '../i18n/languages'
import type { UserPreferences } from '../types/UserPreferences'
import type { Theme } from './useTheme'
import { useToast } from './useToast'

const PREFERENCES_SAVE_DEBOUNCE_MS = 800

function isSamePreferences(a: UserPreferences, b: UserPreferences) {
  return a.theme === b.theme && a.language === b.language
}

// Persists theme/language changes to the backend, debounced so rapid toggling sends a single request.
export function useUserPreferencesSync(theme: Theme, language: SupportedLanguage) {
  const { t: translate } = useTranslation('common')
  const { show: showToast } = useToast()
  const lastSavedRef = useRef<UserPreferences>({ theme, language })
  const pendingRef = useRef<UserPreferences | null>(null)
  const flushRef = useRef<() => void>(() => {})

  useEffect(() => {
    flushRef.current = () => {
      const pending = pendingRef.current
      pendingRef.current = null
      if (!pending || !getAccessToken()) return

      const previous = lastSavedRef.current
      lastSavedRef.current = pending
      saveUserPreferences(pending).catch(() => {
        lastSavedRef.current = previous
        showToast(translate('common:preferences.saveError'))
      })
    }
  })

  useEffect(() => {
    const current = { theme, language }
    if (isSamePreferences(current, lastSavedRef.current)) {
      pendingRef.current = null
      return
    }

    pendingRef.current = current
    const timeoutId = setTimeout(() => flushRef.current(), PREFERENCES_SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timeoutId)
  }, [theme, language])

  // Saves a still-pending change immediately if the component unmounts before the debounce fires.
  useEffect(() => () => flushRef.current(), [])

  // Lets callers save a pending change right away, e.g. before logout clears the access token
  // (the unmount flush would then be skipped for lack of a token).
  const flush = useCallback(() => flushRef.current(), [])

  return { flush }
}
