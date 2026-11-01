import { Navigate, useParams } from 'react-router-dom'
import { savePendingInvite } from '../../shared/utils/pendingInvite'

/**
 * `/invite/:code`, outside the route guards: keeps the code and sends the user to the ranking, which offers the group.
 * Signed out, `ProtectedRoute` asks for a login first and comes back; a sign-up by e-mail loses that way back, so the
 * code is also kept in storage (the home screen sends the user on to the ranking).
 */
function InvitePage() {
  const { code = '' } = useParams()

  // Saved during the render (idempotent), so it is there when the ranking reads it on its first render.
  savePendingInvite(code)

  return <Navigate to="/habits/ranking" replace />
}

export default InvitePage
