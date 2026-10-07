import { useTranslation } from 'react-i18next'
import ModuleSidebar from '../../../shared/components/ModuleSidebar/ModuleSidebar'
import type { IconName } from '../../../shared/components/Icon/Icon'

// `id` doubles as an i18next key lookup (`habits:sidebar.items.${id}`).
// `path: null` marks a screen that isn't built yet — rendered disabled with a "coming soon" badge.
const NAV_ITEMS: { id: string; icon: IconName; path: string | null }[] = [
  { id: 'today', icon: 'calendar-check', path: '/habits/today' },
  { id: 'habits', icon: 'list-checks', path: null },
  { id: 'shop', icon: 'store', path: null },
  { id: 'history', icon: 'history', path: null },
]

function HabitsSidebar() {
  const { t: translate } = useTranslation('habits')

  return (
    <ModuleSidebar
      moduleLabel={translate('habits:module.label')}
      moduleName={translate('habits:module.name')}
      navAriaLabel={translate('habits:sidebar.navAria')}
      items={NAV_ITEMS.map((item) => ({ ...item, label: translate(`habits:sidebar.items.${item.id}`) }))}
      collapsedStorageKey="lm-habits-sidebar-collapsed"
    />
  )
}

export default HabitsSidebar
