import { useState } from 'react'
import Icon from '../../shared/components/Icon/Icon'
import IconButton from '../../shared/components/IconButton/IconButton'
import { useTheme } from '../../shared/hooks/useTheme'
import AuthTabs from '../components/AuthTabs/AuthTabs'
import LoginForm from '../components/LoginForm/LoginForm'
import RegisterForm from '../components/RegisterForm/RegisterForm'
import type { AuthMode } from '../types/AuthMode'
import './AuthPage.css'

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="lm-auth-page">
      <div className="lm-auth-page__content">
        <div className="lm-auth-page__header">
          <span />
          <div className="lm-auth-page__brand">
            <Icon name="wallet" size={20} />
            <span>LifeManager</span>
          </div>
          <div className="lm-auth-page__theme-toggle">
            <IconButton
              icon={theme === 'dark' ? 'sun' : 'moon'}
              label="Alternar tema"
              size="sm"
              onClick={toggleTheme}
            />
          </div>
        </div>

        <AuthTabs
          active={mode}
          onChange={setMode}
          loginPanel={<LoginForm onSwitchToSignup={() => setMode('signup')} />}
          signupPanel={<RegisterForm onSwitchToLogin={() => setMode('login')} />}
        />
      </div>
    </div>
  )
}

export default AuthPage
