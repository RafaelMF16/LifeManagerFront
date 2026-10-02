import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken } from '../../services/tokenStorage'

// Layout route for screens only meant for signed-out users (/auth). Checks the token only, without a refresh,
// so visiting /auth never calls the backend.
function PublicOnlyRoute() {
  return getAccessToken() ? <Navigate to="/home" replace /> : <Outlet />
}

export default PublicOnlyRoute
