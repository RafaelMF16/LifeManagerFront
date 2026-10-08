import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useOutletContext } from 'react-router-dom'
import Icon from '../../shared/components/Icon/Icon'
import type { IconName } from '../../shared/components/Icon/Icon'
import type { HabitsOutletContext } from '../types/HabitsOutletContext'
import './ShopPage.css'

// `id` doubles as an i18next key lookup (`habits:shop.tabs.${id}`); `path` is relative to /habits/shop.
const TABS: { id: string; path: string; icon: IconName }[] = [
  { id: 'rewards', path: 'rewards', icon: 'gift' },
  { id: 'redemptions', path: 'redemptions', icon: 'history' },
]

/**
 * The shop: rewards the player set for themselves, bought with the coins earned with habits, and the history of what
 * was redeemed. Each tab is a child route; the layout's outlet context (profile, reloadProfile) is passed on to them.
 */
function ShopPage() {
  const { t: translate } = useTranslation('habits')
  const outletContext = useOutletContext<HabitsOutletContext>()

  return (
    <main className="lm-shop-page">
      <div className="lm-shop-page__heading">
        <span className="lm-shop-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-shop-page__title">{translate('habits:shop.title')}</h1>
        <p className="lm-shop-page__intro">{translate('habits:shop.intro')}</p>
      </div>

      <nav className="lm-shop-page__tabs" aria-label={translate('habits:shop.tabsAria')}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) => `lm-shop-page__tab${isActive ? ' lm-shop-page__tab--active' : ''}`}
          >
            <Icon name={tab.icon} size={16} aria-hidden="true" />
            {translate(`habits:shop.tabs.${tab.id}`)}
          </NavLink>
        ))}
      </nav>

      <Outlet context={outletContext} />
    </main>
  )
}

export default ShopPage
