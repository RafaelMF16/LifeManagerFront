import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { onSessionExpired } from '../services/sessionEvents'
import { useToast } from './useToast'

export function useSessionExpiredRedirect() {
  const { t: translate } = useTranslation('common')
  const { show: showToast } = useToast()
  const navigate = useNavigate()

  useEffect(
    () =>
      onSessionExpired(() => {
        showToast(translate('common:sessionExpiredToast'))
        navigate('/auth', { replace: true })
      }),
    [navigate, showToast, translate],
  )
}
