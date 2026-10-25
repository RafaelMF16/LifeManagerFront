import { matchPath } from 'react-router-dom'

/** Splits a module's nav items into the ones shown in the compact tab bar and the ones moved to its "More" sheet. */
export function splitNavItems<T>(items: T[], primaryCount: number) {
  return { primary: items.slice(0, primaryCount), overflow: items.slice(primaryCount) }
}

/** Whether the current path is one of these items' screens (or a screen nested under one), like `NavLink`'s active state. */
export function isAnyItemActive(items: { path: string | null }[], pathname: string) {
  return items.some((item) => item.path !== null && matchPath({ path: item.path, end: false }, pathname) !== null)
}
