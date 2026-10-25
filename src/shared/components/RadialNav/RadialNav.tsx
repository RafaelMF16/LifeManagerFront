import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import type { ModuleNavItem } from '../ModuleSidebar/ModuleSidebar'
import { RADIAL_BUBBLE_SIZE, radialLayout } from '../../utils/radialLayout'
import './RadialNav.css'

interface RadialNavProps {
  /** Already translated, e.g. "Finance". */
  moduleName: string
  moduleIcon: IconName
  items: ModuleNavItem[]
}

/** Passes a bubble's arc position and stagger order to the CSS transition. */
function bubbleStyle(x: number, y: number, index: number) {
  return { '--x': `${x}px`, '--y': `${-y}px`, '--i': index } as CSSProperties
}

/** How long a finger rests on a bubble before its name shows (a shorter tap just navigates). */
const LONG_PRESS_MS = 300
/** Space between the top of the arc and the name shown above it. */
const NAME_GAP = 12

/**
 * A module's navigation on compact screens: a floating button that opens every screen of the module (and "All
 * modules") as icon bubbles in an arc around it. Opening focuses the first bubble and Tab stays within the menu;
 * Escape, the scrim and the button close it, handing focus back to the button. Navigating closes it too.
 * Bubbles show only an icon; the name of the one under the mouse, with keyboard focus or held down by a finger shows
 * above the arc.
 */
function RadialNav({ moduleName, moduleIcon, items }: RadialNavProps) {
  const { t: translate } = useTranslation('common')
  const { pathname } = useLocation()
  // The menu stays open only on the path it was opened on, so any navigation closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const open = openedOn === pathname
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const [namedId, setNamedId] = useState<string | null>(null)
  const [pressedId, setPressedId] = useState<string | null>(null)
  const longPressRef = useRef<number | null>(null)

  const comingSoonLabel = translate('common:moduleSidebar.comingSoon')
  const menuLabel = translate('common:moduleSidebar.menu', { module: moduleName })
  const allItems = useMemo<ModuleNavItem[]>(
    () => [
      ...items,
      {
        id: 'all-modules',
        icon: 'layout-dashboard',
        label: translate('common:moduleSidebar.allModules'),
        path: '/home',
      },
    ],
    [items, translate],
  )
  const slots = useMemo(() => radialLayout(allItems.length, viewportWidth), [allItems.length, viewportWidth])
  const nameY = Math.max(...slots.map((slot) => slot.y)) + RADIAL_BUBBLE_SIZE / 2 + NAME_GAP
  const shownId = open ? (pressedId ?? namedId) : null
  const shownName = allItems.find((item) => item.id === shownId)?.label

  function cancelLongPress() {
    if (longPressRef.current !== null) window.clearTimeout(longPressRef.current)
    longPressRef.current = null
    setPressedId(null)
  }

  /** Name handlers shared by enabled and disabled bubbles. */
  function nameProps(id: string) {
    return {
      onPointerEnter: (event: PointerEvent) => {
        if (event.pointerType === 'mouse') setNamedId(id)
      },
      onPointerLeave: (event: PointerEvent) => {
        if (event.pointerType === 'mouse') setNamedId((current) => (current === id ? null : current))
        else cancelLongPress()
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'touch') return
        // A touch captures the pointer to the bubble; releasing it lets `pointerleave` fire when the finger slides off.
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
        cancelLongPress()
        longPressRef.current = window.setTimeout(() => setPressedId(id), LONG_PRESS_MS)
      },
      onPointerUp: cancelLongPress,
      onPointerCancel: cancelLongPress,
      // Holding a link would open the browser's link menu instead of showing the name.
      onContextMenu: (event: MouseEvent) => event.preventDefault(),
      onFocus: (event: FocusEvent<HTMLElement>) => {
        // Only keyboard focus names the bubble; a tap focuses it too, right before navigating.
        if (event.currentTarget.matches(':focus-visible')) setNamedId(id)
      },
      onBlur: () => setNamedId((current) => (current === id ? null : current)),
    }
  }

  function focusables() {
    const bubbles = menuRef.current?.querySelectorAll<HTMLElement>('a.lm-radial-nav__bubble') ?? []
    return [...bubbles, ...(buttonRef.current ? [buttonRef.current] : [])]
  }

  function close() {
    setOpenedOn(null)
    buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    focusables()[0]?.focus()

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenedOn(null)
        buttonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Keeps Tab within the bubbles and the close button while the menu is open.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open || event.key !== 'Tab') return
    const elements = focusables()
    const first = elements[0]
    const last = elements[elements.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={`lm-radial-nav${open ? ' lm-radial-nav--open' : ''}`} onKeyDown={onKeyDown}>
      <div className="lm-radial-nav__scrim" aria-hidden="true" onClick={close} />

      <div id={menuId} ref={menuRef} role="dialog" aria-label={menuLabel} className="lm-radial-nav__menu" inert={!open}>
        {allItems.map((item, index) => {
          const { x, y } = slots[index]
          const style = bubbleStyle(x, y, index)
          const pressedClass = pressedId === item.id ? ' lm-radial-nav__bubble--pressed' : ''
          if (!item.path) {
            return (
              <span
                key={item.id}
                className={`lm-radial-nav__bubble lm-radial-nav__bubble--disabled${pressedClass}`}
                style={style}
                {...nameProps(item.id)}
                aria-disabled="true"
                aria-label={`${item.label} (${comingSoonLabel})`}
              >
                <Icon name={item.icon} size={20} />
              </span>
            )
          }
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `lm-radial-nav__bubble${isActive ? ' lm-radial-nav__bubble--active' : ''}${pressedClass}`
              }
              style={style}
              aria-label={item.label}
              {...nameProps(item.id)}
              // Choosing the screen already open doesn't change the path, so close explicitly.
              onClick={() => setOpenedOn(null)}
            >
              <Icon name={item.icon} size={20} />
            </NavLink>
          )
        })}

        {/* Each bubble already has its name as `aria-label`, so this visual copy is hidden from screen readers. */}
        <span
          className={`lm-radial-nav__name${shownName ? ' lm-radial-nav__name--shown' : ''}`}
          style={{ '--name-y': `${-nameY}px` } as CSSProperties}
          aria-hidden="true"
        >
          {shownName}
        </span>
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="lm-radial-nav__button"
        aria-label={open ? translate('common:moduleSidebar.close') : menuLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (open) {
            close()
          } else {
            setViewportWidth(window.innerWidth)
            setNamedId(null)
            setOpenedOn(pathname)
          }
        }}
      >
        <Icon name={open ? 'x' : moduleIcon} size={22} />
      </button>
    </div>
  )
}

export default RadialNav
