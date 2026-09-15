import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../shared/components/Icon/Icon'
import IconButton from '../../shared/components/IconButton/IconButton'
import SegmentedControl from '../../shared/components/SegmentedControl/SegmentedControl'
import { useTheme } from '../../shared/hooks/useTheme'
import { useLanguage } from '../../shared/hooks/useLanguage'
import type { SupportedLanguage } from '../../shared/i18n/languages'
import AuthTabs from '../components/AuthTabs/AuthTabs'
import LoginForm from '../components/LoginForm/LoginForm'
import RegisterForm from '../components/RegisterForm/RegisterForm'
import type { AuthMode } from '../types/AuthMode'
import './AuthPage.css'

function AuthPage() {
  const { t: translate } = useTranslation('common')
  const [mode, setMode] = useState<AuthMode>('login')
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

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
            <SegmentedControl
              aria-label={translate('language.label')}
              value={language}
              onChange={(value: SupportedLanguage) => setLanguage(value)}
              options={[
                { value: 'pt-BR', label: 'PT' },
                { value: 'en-US', label: 'EN' },
              ]}
            />
            <IconButton
              icon={theme === 'dark' ? 'sun' : 'moon'}
              label={translate('theme.toggleAria')}
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
