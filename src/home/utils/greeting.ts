export type GreetingPeriod = 'morning' | 'afternoon' | 'evening'

/** "Bom dia" from 5h to 11h59, "Boa tarde" from 12h to 17h59, "Boa noite" otherwise — by the device's clock. */
export function greetingPeriod(now: Date): GreetingPeriod {
  const hour = now.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

/** The device's local date as `yyyy-MM-dd`, to notice the day turning while the tab sat in the background. */
export function localDateKey(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/**
 * Whether the summary loaded on `loadedOn` (a `localDateKey`) is from another local day than `now`: the tab came
 * back after midnight. Before the first load (`null`) there's nothing stale to replace.
 */
export function shouldReloadForNewDay(loadedOn: string | null, now: Date): boolean {
  return loadedOn !== null && loadedOn !== localDateKey(now)
}

/** "Segunda-feira, 9 de novembro" / "Monday, November 9" from the backend's `yyyy-MM-dd` today. */
export function todayLabel(isoDate: string, language: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const text = new Intl.DateTimeFormat(language, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    Date.UTC(year, month - 1, day),
  )
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}
