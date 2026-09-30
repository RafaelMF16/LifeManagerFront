import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { logout as logoutSession } from '../services/authSession'
import { useToast } from './useToast'

export function useLogout() {
  const { t: translate } = useTranslation('common')
  const { show: showToast } = useToast()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const inFlightRef = useRef(false)

  const logout = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setIsLoggingOut(true)

    await logoutSession()

    showToast(translate('common:logoutSuccessToast'))
    // `replace` so the browser's back button doesn't return to an authenticated screen.
    navigate('/auth', { replace: true })
  }, [navigate, showToast, translate])

  return { logout, isLoggingOut }
}
