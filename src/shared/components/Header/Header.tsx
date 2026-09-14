import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon/Icon'
import SegmentedControl from '../SegmentedControl/SegmentedControl'
import { useTheme } from '../../hooks/useTheme'
import './Header.css'

type Language = 'pt' | 'en'

const PLACEHOLDER_USER = { name: 'Ana Ribeiro', email: 'ana@exemplo.com' }

function Header() {
  const { theme, toggleTheme } = useTheme()
  const [language, setLanguage] = useState<Language>('pt')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    function onMouseDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="lm-header">
      <div className="lm-header__brand">
        <Icon name="wallet" size={18} />
        <span>LifeManager</span>
      </div>

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
            <div className="lm-header__menu-user">
              <span className="lm-header__menu-user-name">{PLACEHOLDER_USER.name}</span>
              <span className="lm-header__menu-user-email">{PLACEHOLDER_USER.email}</span>
            </div>

            <div className="lm-header__menu-divider" />

            <div className="lm-header__menu-row">
              <span className="lm-header__menu-row-label">
                <Icon name="sun" size={16} />
                Tema
              </span>
              <SegmentedControl
                aria-label="Tema"
                value={theme}
                onChange={(value) => {
                  if (value !== theme) toggleTheme()
                }}
                options={[
                  { value: 'light', label: <Icon name="sun" size={14} />, srLabel: 'Claro' },
                  { value: 'dark', label: <Icon name="moon" size={14} />, srLabel: 'Escuro' },
                ]}
              />
            </div>

            <div className="lm-header__menu-row">
              <span className="lm-header__menu-row-label">
                <Icon name="languages" size={16} />
                Idioma
              </span>
              <SegmentedControl
                aria-label="Idioma"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: 'pt', label: 'PT' },
                  { value: 'en', label: 'EN' },
                ]}
              />
            </div>

            <div className="lm-header__menu-divider" />

            <button
              type="button"
              role="menuitem"
              className="lm-header__menu-logout"
              onClick={(event) => event.preventDefault()}
            >
              <Icon name="log-out" size={16} />
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Header
