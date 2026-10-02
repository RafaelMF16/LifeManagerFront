import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useErrorModal } from '../../hooks/useErrorModal'
import { restoreSession } from '../../services/authSession'
import { getAccessToken } from '../../services/tokenStorage'

type SessionStatus = 'checking' | 'authenticated' | 'anonymous'

// Layout route for every screen that needs a signed-in user. Without an access token (a new tab or a reload)
// it tries the refresh cookie before deciding; a session that expires later is handled by
// `useSessionExpiredRedirect`.
function ProtectedRoute() {
  const { t: translate } = useTranslation('common')
  const { show: showErrorModal } = useErrorModal()
  const location = useLocation()
  const [status, setStatus] = useState<SessionStatus>(() => (getAccessToken() ? 'authenticated' : 'checking'))

  useEffect(() => {
    if (status !== 'checking') return

    let cancelled = false

    restoreSession()
      .then((restored) => {
        if (!cancelled) setStatus(restored ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        if (cancelled) return
        // Fails closed: the cookie is kept, so signing in again (or a reload) works once the server is back.
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
        setStatus('anonymous')
      })

    return () => {
      cancelled = true
    }
  }, [status, showErrorModal, translate])

  if (status === 'checking') return null
  if (status === 'anonymous') return <Navigate to="/auth" replace state={{ from: location }} />

  return <Outlet />
}

export default ProtectedRoute
