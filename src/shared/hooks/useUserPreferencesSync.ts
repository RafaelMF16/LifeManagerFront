import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { isSessionExpiredError } from '../services/httpClient'
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
      if (!pending) return

      const previous = lastSavedRef.current
      lastSavedRef.current = pending
      saveUserPreferences(pending).catch((error: unknown) => {
        lastSavedRef.current = previous
        if (isSessionExpiredError(error)) return
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

  // The debounced save goes through apiRequest even without an access token (e.g. a new tab), so a 401
  // refreshes it from the cookie. Leaving flushes (unmount, before logout) skip it instead: with no token
  // the user is signing out, and a refresh there would fail and show the session-expired toast.
  const flushIfAuthenticated = useCallback(() => {
    if (getAccessToken()) flushRef.current()
  }, [])

  useEffect(() => flushIfAuthenticated, [flushIfAuthenticated])

  return { flush: flushIfAuthenticated }
}
