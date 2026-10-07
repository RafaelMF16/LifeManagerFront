import { useTranslation } from 'react-i18next'
import ModuleSidebar from '../../../shared/components/ModuleSidebar/ModuleSidebar'
import type { IconName } from '../../../shared/components/Icon/Icon'

// `id` doubles as an i18next key lookup (`finance:sidebar.items.${id}`).
// `path: null` marks a screen that isn't built yet — rendered disabled with a "coming soon" badge.
const NAV_ITEMS: { id: string; icon: IconName; path: string | null }[] = [
  { id: 'dashboard', icon: 'chart-column', path: '/finance/dashboard' },
  { id: 'months', icon: 'calendar', path: '/finance/months' },
  { id: 'planning', icon: 'target', path: '/finance/planning' },
  { id: 'categories', icon: 'tags', path: '/finance/categories' },
]

function FinanceSidebar() {
  const { t: translate } = useTranslation('finance')

  return (
    <ModuleSidebar
      moduleLabel={translate('finance:module.label')}
      moduleName={translate('finance:module.name')}
      navAriaLabel={translate('finance:sidebar.navAria')}
      items={NAV_ITEMS.map((item) => ({ ...item, label: translate(`finance:sidebar.items.${item.id}`) }))}
      collapsedStorageKey="lm-finance-sidebar-collapsed"
    />
  )
}

export default FinanceSidebar
