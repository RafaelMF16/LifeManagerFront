import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../Icon/Icon'
import SegmentedControl from '../SegmentedControl/SegmentedControl'
import { useTheme } from '../../hooks/useTheme'
import { useLanguage } from '../../hooks/useLanguage'
import { useUserPreferencesSync } from '../../hooks/useUserPreferencesSync'
import { useLogout } from '../../hooks/useLogout'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import type { SupportedLanguage } from '../../i18n/languages'
import './Header.css'

interface HeaderProps {
  /** Module-specific controls shown next to the user menu (e.g. Finance's privacy toggle). */
  actions?: ReactNode
}

function Header({ actions }: HeaderProps) {
  const { t: translate } = useTranslation('common')
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { flush: flushPreferences } = useUserPreferencesSync(theme, language)
  const { logout, isLoggingOut } = useLogout()
  const { name: userName } = useCurrentUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="lm-header">
      <div className="lm-header__brand">
        <Icon name="wallet" size={18} />
        <span>LifeManager</span>
      </div>

      <div className="lm-header__actions">
        {actions}

        <div className="lm-header__user" ref={menuRef}>
          <button
            type="button"
            className="lm-header__user-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="user" size={18} />
            <Icon name="chevron-down" size={14} />
          </button>

          {menuOpen ? (
            <div role="menu" className="lm-header__menu">
              {userName ? (
                <>
                  <div className="lm-header__menu-user">
                    <span className="lm-header__menu-user-name" title={userName}>
                      {userName}
                    </span>
                  </div>

                  <div className="lm-header__menu-divider" />
                </>
              ) : null}

              <div className="lm-header__menu-row">
                <span className="lm-header__menu-row-label">
                  <Icon name="sun" size={16} />
                  {translate('theme.label')}
                </span>
                <SegmentedControl
                  aria-label={translate('theme.label')}
                  value={theme}
                  onChange={(value) => {
                    if (value !== theme) toggleTheme()
                  }}
                  options={[
                    { value: 'light', label: <Icon name="sun" size={14} />, srLabel: translate('theme.light') },
                    { value: 'dark', label: <Icon name="moon" size={14} />, srLabel: translate('theme.dark') },
                  ]}
                />
              </div>

              <div className="lm-header__menu-row">
                <span className="lm-header__menu-row-label">
                  <Icon name="languages" size={16} />
                  {translate('language.label')}
                </span>
                <SegmentedControl
                  aria-label={translate('language.label')}
                  value={language}
                  onChange={(value: SupportedLanguage) => setLanguage(value)}
                  options={[
                    { value: 'pt-BR', label: 'PT' },
                    { value: 'en-US', label: 'EN' },
                  ]}
                />
              </div>

              <div className="lm-header__menu-divider" />

              <button
                type="button"
                role="menuitem"
                className="lm-header__menu-logout"
                disabled={isLoggingOut}
                onClick={() => {
                  // Sends a still-debounced preference change while the access token is still valid.
                  flushPreferences()
                  void logout()
                }}
              >
                <Icon name="log-out" size={16} />
                {translate('logout')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
