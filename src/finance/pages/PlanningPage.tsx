import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import Icon from '../../shared/components/Icon/Icon'
import type { IconName } from '../../shared/components/Icon/Icon'
import './PlanningPage.css'

// `id` doubles as an i18next key lookup (`finance:planning.tabs.${id}`); `path` is relative to /finance/planning.
const TABS: { id: string; path: string; icon: IconName }[] = [
  { id: 'goals', path: 'goals', icon: 'target' },
  { id: 'recurring', path: 'recurring', icon: 'repeat' },
]

/** The Planning screen: monthly goals and recurring transactions, each a child route under one heading. */
function PlanningPage() {
  const { t: translate } = useTranslation('finance')

  return (
    <main className="lm-planning-page">
      <div className="lm-planning-page__heading">
        <span className="lm-planning-page__eyebrow">{translate('finance:module.name')}</span>
        <h1 className="lm-planning-page__title">{translate('finance:planning.title')}</h1>
      </div>

      <nav className="lm-planning-page__tabs" aria-label={translate('finance:planning.tabsAria')}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) => `lm-planning-page__tab${isActive ? ' lm-planning-page__tab--active' : ''}`}
          >
            <Icon name={tab.icon} size={16} aria-hidden="true" />
            {translate(`finance:planning.tabs.${tab.id}`)}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </main>
  )
}

export default PlanningPage
