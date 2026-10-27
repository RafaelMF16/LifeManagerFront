import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import { useTheme } from '../../../shared/hooks/useTheme'
import type { Theme } from '../../../shared/hooks/useTheme'
import { useLanguage } from '../../../shared/hooks/useLanguage'
import type { SupportedLanguage } from '../../../shared/i18n/languages'
import './AuthLayout.css'

interface AuthLayoutProps {
  // A function when the page needs the screen's theme and language (the sign-up sends them)
  children: ReactNode | ((preferences: { theme: Theme; language: SupportedLanguage }) => ReactNode)
}

/**
 * The signed-out screens' frame: brand, language and theme switches, and the page's card below. It owns the theme and
 * language hooks, so a page that needs their values takes them from `children` instead of calling the hooks again.
 */
function AuthLayout({ children }: AuthLayoutProps) {
  const { t: translate } = useTranslation('common')
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

  return (
    <div className="lm-auth-page">
      <div className="lm-auth-page__content">
        <div className="lm-auth-page__header">
          <span className="lm-auth-page__header-spacer" />
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

        {typeof children === 'function' ? children({ theme, language }) : children}
      </div>
    </div>
  )
}

export default AuthLayout
