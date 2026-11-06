import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { WALLET_RECEIVE_URL } from '../../shared/components/WalletSprite/WalletSprite'
import AuthLayout from '../components/AuthLayout/AuthLayout'
import AuthTabs from '../components/AuthTabs/AuthTabs'
import LoginForm from '../components/LoginForm/LoginForm'
import RegisterForm from '../components/RegisterForm/RegisterForm'
import type { AuthMode } from '../types/AuthMode'

// Pages that send the user back here may pick the tab (an expired confirmation link goes back to the sign-up).
export interface AuthPageState {
  mode?: AuthMode
}

function AuthPage() {
  const location = useLocation()
  const [mode, setMode] = useState<AuthMode>(() => (location.state as AuthPageState | null)?.mode ?? 'login')

  // Warms the cache for the sign-in transition, so the wallet is ready the moment the cover opens.
  useEffect(() => {
    new Image().src = WALLET_RECEIVE_URL
  }, [])

  return (
    <AuthLayout>
      {({ theme, language }) => (
        <AuthTabs
          active={mode}
          onChange={setMode}
          loginPanel={<LoginForm onSwitchToSignup={() => setMode('signup')} />}
          signupPanel={<RegisterForm preferences={{ theme, language }} onSwitchToLogin={() => setMode('login')} />}
        />
      )}
    </AuthLayout>
  )
}

export default AuthPage
