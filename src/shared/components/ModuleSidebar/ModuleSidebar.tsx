import { useId } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed'
import './ModuleSidebar.css'

export interface ModuleNavItem {
  id: string
  icon: IconName
  /** Already translated by the module. */
  label: string
  /** `null` marks a screen that isn't built yet: rendered disabled with a "coming soon" badge. */
  path: string | null
}

interface ModuleSidebarProps {
  /** Already translated, e.g. "Module" / "Finance". */
  moduleLabel: string
  moduleName: string
  navAriaLabel: string
  items: ModuleNavItem[]
  /** `localStorage` key of this module's collapsed state. */
  collapsedStorageKey: string
}

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return `lm-module-sidebar__link${isActive ? ' lm-module-sidebar__link--active' : ''}`
}

/**
 * A module's navigation: a collapsible sidebar on wide screens and a fixed bottom tab bar on compact ones (which also
 * sets `--app-bottom-inset`). Each module passes its own translated items; the shared links (all modules, collapse)
 * live here.
 */
function ModuleSidebar({ moduleLabel, moduleName, navAriaLabel, items, collapsedStorageKey }: ModuleSidebarProps) {
  const { t: translate } = useTranslation('common')
  const { collapsed, toggleCollapsed } = useSidebarCollapsed(collapsedStorageKey)

  // Collapsed, labels are only visually hidden (still read by screen readers), so `title` adds a hover tooltip.
  const tooltip = (label: string) => (collapsed ? label : undefined)
  const comingSoonLabel = translate('common:moduleSidebar.comingSoon')
  const allModulesLabel = translate('common:moduleSidebar.allModules')
  const toggleLabel = translate(collapsed ? 'common:moduleSidebar.expand' : 'common:moduleSidebar.collapse')
  const navId = useId()

  return (
    <aside className={`lm-module-sidebar${collapsed ? ' lm-module-sidebar--collapsed' : ''}`}>
      <div className="lm-module-sidebar__module">
        <span className="lm-module-sidebar__module-label">{moduleLabel}</span>
        <span className="lm-module-sidebar__module-name">{moduleName}</span>
      </div>

      <nav id={navId} className="lm-module-sidebar__nav" aria-label={navAriaLabel}>
        {items.map((item) =>
          item.path ? (
            <NavLink key={item.id} to={item.path} className={navLinkClassName} title={tooltip(item.label)}>
              <Icon name={item.icon} size={18} />
              <span className="lm-module-sidebar__label">{item.label}</span>
            </NavLink>
          ) : (
            <span
              key={item.id}
              className="lm-module-sidebar__link lm-module-sidebar__link--disabled"
              aria-disabled="true"
              title={tooltip(`${item.label} (${comingSoonLabel})`)}
            >
              <Icon name={item.icon} size={18} />
              <span className="lm-module-sidebar__label">{item.label}</span>
              <span className="lm-module-sidebar__badge">{comingSoonLabel}</span>
            </span>
          ),
        )}
      </nav>

      <div className="lm-module-sidebar__spacer" />

      <Link to="/home" className="lm-module-sidebar__link lm-module-sidebar__link--muted" title={tooltip(allModulesLabel)}>
        <Icon name="layout-dashboard" size={18} />
        <span className="lm-module-sidebar__label">{allModulesLabel}</span>
      </Link>

      <button
        type="button"
        className="lm-module-sidebar__link lm-module-sidebar__link--muted lm-module-sidebar__toggle"
        aria-expanded={!collapsed}
        aria-controls={navId}
        title={tooltip(toggleLabel)}
        onClick={toggleCollapsed}
      >
        <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={18} />
        <span className="lm-module-sidebar__label">{toggleLabel}</span>
      </button>
    </aside>
  )
}

export default ModuleSidebar
