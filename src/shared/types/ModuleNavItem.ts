import type { IconName } from '../components/Icon/Icon'

/** One screen of a module, shown by `ModuleSidebar` on wide screens and by `RadialNav` on compact ones. */
export interface ModuleNavItem {
  id: string
  icon: IconName
  /** Already translated by the module. */
  label: string
  /** `null` marks a screen that isn't built yet: rendered disabled with a "coming soon" badge. */
  path: string | null
}
