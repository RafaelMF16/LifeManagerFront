import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { IconName } from '../../../shared/components/Icon/Icon'
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed'
import './FinanceSidebar.css'

// `id` doubles as an i18next key lookup (`finance:sidebar.items.${id}`).
// `path: null` marks a screen that isn't built yet — rendered disabled with a "coming soon" badge.
interface FinanceNavItem {
  id: string
  icon: IconName
  path: string | null
}

const NAV_ITEMS: FinanceNavItem[] = [
  { id: 'dashboard', icon: 'chart-column', path: '/finance/dashboard' },
  { id: 'months', icon: 'calendar', path: '/finance/months' },
  { id: 'categories', icon: 'tags', path: '/finance/categories' },
]

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return `lm-finance-sidebar__link${isActive ? ' lm-finance-sidebar__link--active' : ''}`
}

function FinanceSidebar() {
  const { t: translate } = useTranslation('finance')
  const { collapsed, toggleCollapsed } = useSidebarCollapsed()

  // Collapsed, labels are only visually hidden (still read by screen readers), so `title` adds a hover tooltip.
  const tooltip = (label: string) => (collapsed ? label : undefined)
  const allModulesLabel = translate('finance:sidebar.allModules')
  const toggleLabel = translate(collapsed ? 'finance:sidebar.expand' : 'finance:sidebar.collapse')

  return (
    <aside className={`lm-finance-sidebar${collapsed ? ' lm-finance-sidebar--collapsed' : ''}`}>
      <div className="lm-finance-sidebar__module">
        <span className="lm-finance-sidebar__module-label">{translate('finance:module.label')}</span>
        <span className="lm-finance-sidebar__module-name">{translate('finance:module.name')}</span>
      </div>

      <nav id="lm-finance-sidebar-nav" className="lm-finance-sidebar__nav" aria-label={translate('finance:sidebar.navAria')}>
        {NAV_ITEMS.map((item) => {
          const label = translate(`finance:sidebar.items.${item.id}`)

          return item.path ? (
            <NavLink key={item.id} to={item.path} className={navLinkClassName} title={tooltip(label)}>
              <Icon name={item.icon} size={18} />
              <span className="lm-finance-sidebar__label">{label}</span>
            </NavLink>
          ) : (
            <span
              key={item.id}
              className="lm-finance-sidebar__link lm-finance-sidebar__link--disabled"
              aria-disabled="true"
              title={tooltip(`${label} (${translate('finance:sidebar.comingSoon')})`)}
            >
              <Icon name={item.icon} size={18} />
              <span className="lm-finance-sidebar__label">{label}</span>
              <span className="lm-finance-sidebar__badge">{translate('finance:sidebar.comingSoon')}</span>
            </span>
          )
        })}
      </nav>

      <div className="lm-finance-sidebar__spacer" />

      <Link to="/home" className="lm-finance-sidebar__link lm-finance-sidebar__link--muted" title={tooltip(allModulesLabel)}>
        <Icon name="layout-dashboard" size={18} />
        <span className="lm-finance-sidebar__label">{allModulesLabel}</span>
      </Link>

      <button
        type="button"
        className="lm-finance-sidebar__link lm-finance-sidebar__link--muted lm-finance-sidebar__toggle"
        aria-expanded={!collapsed}
        aria-controls="lm-finance-sidebar-nav"
        title={tooltip(toggleLabel)}
        onClick={toggleCollapsed}
      >
        <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={18} />
        <span className="lm-finance-sidebar__label">{toggleLabel}</span>
      </button>
    </aside>
  )
}

export default FinanceSidebar
