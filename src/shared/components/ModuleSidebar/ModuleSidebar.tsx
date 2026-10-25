import { useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Dialog from '../Dialog/Dialog'
import Icon from '../Icon/Icon'
import IconButton from '../IconButton/IconButton'
import type { IconName } from '../Icon/Icon'
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed'
import { isAnyItemActive, splitNavItems } from '../../utils/moduleNav'
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

/** Screens kept in the compact tab bar; the rest (and "All modules") move to the "More" sheet, so the bar has 4 tabs. */
const MOBILE_PRIMARY_COUNT = 3

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return `lm-module-sidebar__link${isActive ? ' lm-module-sidebar__link--active' : ''}`
}

function sheetLinkClassName({ isActive }: { isActive: boolean }) {
  return `lm-module-sheet__link${isActive ? ' lm-module-sheet__link--active' : ''}`
}

/**
 * A module's navigation: a collapsible sidebar on wide screens and a fixed bottom tab bar on compact ones (which also
 * sets `--app-bottom-inset`). The tab bar shows the first screens plus a "More" tab opening a sheet with the others.
 * Each module passes its own translated items; the shared links (all modules, collapse, more) live here.
 */
function ModuleSidebar({ moduleLabel, moduleName, navAriaLabel, items, collapsedStorageKey }: ModuleSidebarProps) {
  const { t: translate } = useTranslation('common')
  const { collapsed, toggleCollapsed } = useSidebarCollapsed(collapsedStorageKey)
  const { pathname } = useLocation()
  // The sheet stays open only on the path it was opened on, so any navigation closes it.
  const [sheetOpenedOn, setSheetOpenedOn] = useState<string | null>(null)
  const sheetOpen = sheetOpenedOn === pathname
  const moreButtonRef = useRef<HTMLButtonElement>(null)

  // Collapsed, labels are only visually hidden (still read by screen readers), so `title` adds a hover tooltip.
  const tooltip = (label: string) => (collapsed ? label : undefined)
  const comingSoonLabel = translate('common:moduleSidebar.comingSoon')
  const allModulesLabel = translate('common:moduleSidebar.allModules')
  const toggleLabel = translate(collapsed ? 'common:moduleSidebar.expand' : 'common:moduleSidebar.collapse')
  const navId = useId()
  const sheetTitleId = useId()
  const { overflow } = splitNavItems(items, MOBILE_PRIMARY_COUNT)
  const moreActive = isAnyItemActive(overflow, pathname)

  function closeSheet() {
    setSheetOpenedOn(null)
    moreButtonRef.current?.focus()
  }

  return (
    <>
      <aside className={`lm-module-sidebar${collapsed ? ' lm-module-sidebar--collapsed' : ''}`}>
        <div className="lm-module-sidebar__module">
          <span className="lm-module-sidebar__module-label">{moduleLabel}</span>
          <span className="lm-module-sidebar__module-name">{moduleName}</span>
        </div>

        <nav id={navId} className="lm-module-sidebar__nav" aria-label={navAriaLabel}>
          {items.map((item, index) => {
            const overflowClass = index >= MOBILE_PRIMARY_COUNT ? ' lm-module-sidebar__link--overflow' : ''
            return item.path ? (
              <NavLink
                key={item.id}
                to={item.path}
                className={(state) => navLinkClassName(state) + overflowClass}
                title={tooltip(item.label)}
              >
                <Icon name={item.icon} size={18} />
                <span className="lm-module-sidebar__label">{item.label}</span>
              </NavLink>
            ) : (
              <span
                key={item.id}
                className={`lm-module-sidebar__link lm-module-sidebar__link--disabled${overflowClass}`}
                aria-disabled="true"
                title={tooltip(`${item.label} (${comingSoonLabel})`)}
              >
                <Icon name={item.icon} size={18} />
                <span className="lm-module-sidebar__label">{item.label}</span>
                <span className="lm-module-sidebar__badge">{comingSoonLabel}</span>
              </span>
            )
          })}
        </nav>

        <div className="lm-module-sidebar__spacer" />

        <Link
          to="/home"
          className="lm-module-sidebar__link lm-module-sidebar__link--muted lm-module-sidebar__link--overflow"
          title={tooltip(allModulesLabel)}
        >
          <Icon name="layout-dashboard" size={18} />
          <span className="lm-module-sidebar__label">{allModulesLabel}</span>
        </Link>

        <button
          ref={moreButtonRef}
          type="button"
          className={`lm-module-sidebar__link lm-module-sidebar__more${moreActive ? ' lm-module-sidebar__link--active' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpenedOn(pathname)}
        >
          <Icon name="ellipsis" size={18} />
          <span className="lm-module-sidebar__label">{translate('common:moduleSidebar.more')}</span>
        </button>

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

      {sheetOpen ? (
        <Dialog labelledBy={sheetTitleId} onClose={closeSheet}>
          <div className="lm-dialog__header">
            <h2 id={sheetTitleId} className="lm-dialog__title">
              {moduleName}
            </h2>
            <IconButton
              icon="x"
              size="sm"
              label={translate('common:moduleSidebar.close')}
              autoFocus
              onClick={closeSheet}
            />
          </div>

          <div className="lm-dialog__body lm-module-sheet__body">
            {overflow.map((item) =>
              item.path ? (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={sheetLinkClassName}
                  // Choosing the screen already open doesn't change the path, so close explicitly.
                  onClick={() => setSheetOpenedOn(null)}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </NavLink>
              ) : (
                <span key={item.id} className="lm-module-sheet__link lm-module-sheet__link--disabled" aria-disabled="true">
                  <Icon name={item.icon} size={18} />
                  {item.label}
                  <span className="lm-module-sidebar__badge">{comingSoonLabel}</span>
                </span>
              ),
            )}

            {overflow.length > 0 ? <div className="lm-module-sheet__divider" /> : null}

            <Link to="/home" className="lm-module-sheet__link lm-module-sheet__link--muted">
              <Icon name="layout-dashboard" size={18} />
              {allModulesLabel}
            </Link>
          </div>
        </Dialog>
      ) : null}
    </>
  )
}

export default ModuleSidebar
